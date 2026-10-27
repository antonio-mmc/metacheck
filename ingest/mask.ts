export type MaskLexicon = {
  /** People on the staff map, the single report, or a social-security return. */
  workers: string[];
  /** Everyone else: a certificate signatory, the term's manager when they are not on that list. */
  people: string[];
  companies: string[];
  addresses: string[];
};

const STOP = new Set(["de", "da", "do", "dos", "das", "em", "para", "com"]);

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function flexible(value: string): RegExp {
  return new RegExp(escapeRegExp(value.trim()).replace(/\s+/g, "\\s+"), "giu");
}

function isNif(value: string): boolean {
  if (!/^[1-9]\d{8}$/.test(value)) return false;
  const digits = value.split("").map(Number);
  const sum = digits.slice(0, 8).reduce((total, digit, index) => total + digit * (9 - index), 0);
  const mod = sum % 11;
  const check = mod < 2 ? 0 : 11 - mod;
  return digits[8] === check;
}

/** One identifier as it appeared in the text and the label that replaced it. Never sent to the model. */
export type MaskedPair = { value: string; token: string };

/** What the screen shows: labels in the texts sent to the model, and identifiers that stayed on this computer. */
export type MaskReport = {
  documents: number;
  pairs: MaskedPair[];
  local: { documents: number; found: { prefix: string; count: number }[] };
};

/** Counts the identifiers in texts read only by code. Nothing is replaced or sent. */
export function countIdentifiers(texts: string[], lexicon: MaskLexicon): MaskReport["local"] {
  const session = createMaskSession();
  for (const text of texts) maskText(text, lexicon, session);
  const counts = new Map<string, number>();
  for (const { token } of sessionPairs(session)) {
    const prefix = token.slice(1).replace(/_\d+\]$/, "");
    counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
  }
  return { documents: texts.length, found: [...counts].map(([prefix, count]) => ({ prefix, count })) };
}

/** Labels shared by every text of one project, so a person keeps one label across documents. */
export type MaskSession = {
  labels: Map<string, string>;
  originals: Map<string, string>;
  counts: Map<string, number>;
};

export function createMaskSession(): MaskSession {
  return { labels: new Map(), originals: new Map(), counts: new Map() };
}

export function sessionPairs(session: MaskSession): MaskedPair[] {
  return [...session.originals].map(([token, value]) => ({ value, token }));
}

/**
 * Replaces identifiers with stable labels. The map from label to the real
 * value stays in the session and is not written anywhere.
 */
export function maskText(
  input: string,
  lexicon: MaskLexicon,
  session: MaskSession = createMaskSession(),
): { text: string; labels: Map<string, string>; pairs: MaskedPair[] } {
  const { labels, originals, counts } = session;

  const tokenFor = (prefix: string, key: string, original: string) => {
    const id = `${prefix}:${key.normalize("NFD").replace(/\p{M}/gu, "")}`;
    const existing = labels.get(id);
    if (existing) return existing;
    const next = (counts.get(prefix) ?? 0) + 1;
    counts.set(prefix, next);
    const token = `[${prefix}_${next}]`;
    labels.set(id, token);
    originals.set(token, original.replace(/\s+/g, " ").trim());
    return token;
  };

  let text = input;

  const replaceAll = (pattern: RegExp, prefix: string, keyOf: (match: string) => string = (match) => match) => {
    text = text.replace(pattern, (match) => tokenFor(prefix, keyOf(match).toLowerCase(), match));
  };

  for (const address of unique(lexicon.addresses)) {
    if (address.trim().length < 8) continue;
    replaceAll(flexible(address), "ADDRESS", () => address);
  }
  replaceAll(
    /(?:Rua|Avenida|Av\.|Largo|Praça|Travessa|Lugar|Estrada)\s+[^.]{6,140}?\d{4}-\d{3}\s+[\p{L} ]+/giu,
    "ADDRESS",
  );
  replaceAll(/freguesia de [^,]{2,40}, concelho d[aoe] [^,]{2,40}/giu, "ADDRESS");

  const workerKeys = new Set(unique(lexicon.workers).map((name) => name.toLowerCase()));
  const others = unique(lexicon.people).filter((name) => !workerKeys.has(name.toLowerCase()));
  const named = [
    ...unique(lexicon.workers).map((name) => ({ name, prefix: "WORKER" })),
    ...others.map((name) => ({ name, prefix: "PERSON" })),
  ].sort((a, b) => b.name.length - a.name.length);
  for (const entry of named) {
    if (entry.name.trim().length < 5) continue;
    replaceAll(flexible(entry.name), entry.prefix, () => entry.name);
  }
  const workerParts = new Set(nameParts(lexicon.workers).map((part) => part.toLowerCase()));
  for (const part of nameParts(lexicon.workers)) {
    replaceAll(new RegExp(`(?<![\\p{L}])${escapeRegExp(part)}(?![\\p{L}])`, "giu"), "WORKER", () => part);
  }
  for (const part of nameParts(others)) {
    if (workerParts.has(part.toLowerCase())) continue;
    replaceAll(new RegExp(`(?<![\\p{L}])${escapeRegExp(part)}(?![\\p{L}])`, "giu"), "PERSON", () => part);
  }
  for (const name of unique(lexicon.companies).sort((a, b) => b.length - a.length)) {
    if (name.trim().length < 4) continue;
    replaceAll(flexible(name), "COMPANY", () => name);
    const short = name.replace(/,?\s*(?:Lda\.|S\.A\.|Unipessoal Lda\.|S\.r\.l\.).*$/i, "").trim();
    if (short.length >= 6 && short !== name) replaceAll(flexible(short), "COMPANY", () => short);
  }

  replaceAll(/PT\d{2}(?:\s*\d){21}/gi, "IBAN", (match) => match.replace(/\s/g, ""));
  replaceAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "EMAIL");
  replaceAll(phoneInternational(), "PHONE", (match) => match.replace(/\D/g, ""));
  replaceAll(phoneGrouped(), "PHONE", (match) => match.replace(/\D/g, ""));
  replaceAll(/\d{8}\s+\d\s+[A-Z]{2}\d/g, "CC", (match) => match.replace(/\s/g, ""));
  replaceAll(/(?<!\d)(\d{11})(?!\d)/g, "NISS");
  text = text.replace(/(?<!\d)(\d{9})(?!\d)/g, (match) => (isNif(match) ? tokenFor("NIF", match, match) : match));
  replaceAll(phoneBare(), "PHONE");

  return { text, labels, pairs: sessionPairs(session) };
}

/** Names and identifiers that must not remain in text sent to the model. */
export function leaksIn(text: string, lexicon: MaskLexicon): string[] {
  const found: string[] = [];
  const haystack = text.toLowerCase();
  for (const person of unique([...lexicon.workers, ...lexicon.people])) {
    if (person.length >= 5 && haystack.includes(person.toLowerCase())) found.push(person);
    for (const part of person.normalize("NFD").replace(/\p{M}/gu, "").split(/\s+/)) {
      const clean = part.replace(/[.,]/g, "");
      if (clean.length < 3 || STOP.has(clean.toLowerCase())) continue;
      const pattern = new RegExp(`(?<![\\p{L}])${escapeRegExp(clean)}(?![\\p{L}])`, "iu");
      if (pattern.test(text.normalize("NFD").replace(/\p{M}/gu, ""))) found.push(clean);
    }
  }
  for (const company of unique(lexicon.companies)) {
    const short = company.replace(/,?\s*(?:Lda\.|S\.A\.|Unipessoal Lda\.|S\.r\.l\.).*$/i, "").trim();
    if (short.length >= 6 && haystack.includes(short.toLowerCase())) found.push(company);
  }
  if (/PT\d{2}(?:\s*\d){21}/i.test(text)) found.push("IBAN");
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) found.push("email");
  if (phoneInternational().test(text) || phoneGrouped().test(text)) found.push("phone");
  for (const match of text.matchAll(phoneBare())) {
    if (!isNif(match[1] ?? "")) found.push("phone");
  }
  if (/(?:Rua|Avenida|Largo|Praça|Travessa|Lugar)\s+[^.]{6,80}?\d{4}-\d{3}/i.test(text)) found.push("address");
  for (const match of text.matchAll(/(?<!\d)(\d{11})(?!\d)/g)) found.push(`NISS ${match[1]}`);
  for (const match of text.matchAll(/(?<!\d)(\d{9})(?!\d)/g)) {
    if (isNif(match[1] ?? "")) found.push(`NIF ${match[1]}`);
  }
  return found;
}

function phoneInternational(): RegExp {
  return /(?:\+|00)\s*351(?:[\s.-]*\d){9}/gi;
}

function phoneGrouped(): RegExp {
  return /(?<!\d)[239]\d{2}(?:[\s.-]\d{3}){2}(?!\d)/g;
}

function phoneBare(): RegExp {
  return /(?<!\d)([239]\d{8})(?!\d)/g;
}

function unique(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value.trim());
  }
  return result;
}

function nameParts(people: string[]): string[] {
  const parts = new Set<string>();
  for (const person of people) {
    for (const part of person.split(/\s+/)) {
      const clean = part.replace(/[.,]/g, "");
      if (clean.length >= 3 && !STOP.has(clean.toLowerCase())) parts.add(clean);
    }
  }
  return [...parts].sort((a, b) => b.length - a.length);
}
