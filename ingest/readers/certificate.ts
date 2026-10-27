export type CertificateReading = {
  filename: string;
  holder: string | null;
  level: number | null;
  foreignDegree: boolean;
};

/** The holder is the person after "que", not the academic officer who signs. */
export function readCertificate(filename: string, text: string): CertificateReading {
  const flat = text.replace(/\s+/g, " ");
  const holder = flat.match(/que\s+([^,]{3,80}?)\s*,\s*filh[oa]/i)?.[1]?.replace(/\s+/g, " ").trim() ?? null;
  const levelMatch = flat.match(/n[ií]vel\s+(\d)\s+do\s+Quadro\s+Nacional/i);
  let level = levelMatch ? Number(levelMatch[1]) : null;
  if (level === null) {
    if (/doutoramento/i.test(flat)) level = 8;
    else if (/mestrado/i.test(flat)) level = 7;
    else if (/licenciatura/i.test(flat)) level = 6;
    else if (/t[eé]cnico superior profissional|\bctesp\b/i.test(flat)) level = 5;
  }
  const foreignDegree = /estrangeir|brasil|brasileir|reconhecimento/i.test(flat);
  return { filename, holder, level, foreignDegree };
}

export function foldName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function nameOnMap(holder: string | null, staffNames: string[]): boolean {
  if (!holder) return false;
  const person = foldName(holder);
  return staffNames.some((name) => {
    const staff = foldName(name);
    return staff.length > 0 && (person.includes(staff) || staff.includes(person));
  });
}
