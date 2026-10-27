import { readFileSync } from "node:fs";
import path from "node:path";

import { askModel } from "@/ai/door";
import { explainRuleCard, type RuleCard } from "@/domain/rule-card";
import { readPdfItems } from "@/ingest/pdf-text";

const INSTRUCTIONS = [
  "Extract a rule card from this public Portuguese grant call.",
  "Reply with JSON only, no markdown.",
  "Use only these indicator codes: RPR003, RCR01, RSR23, RPR001, RPR031, RPR002, RPR080.",
  "RCR01 is measured one year after completion and does not enter the result. Include it only if the call lists it as a result indicator.",
  "The four result indicators are jobs (RPR003), qualified jobs (RSR23), turnover in percent and euros (RPR001 and RPR031), value added per worker in percent and euros (RPR002 and RPR080).",
  "roModel is best_n. bestN is 2. weights are [0.5, 0.5], unless the call states a different model.",
  "thresholdPct is the result-of-the-operation threshold, a number from 0 to 100.",
  "penaltyStepPp, penaltyEveryPp and penaltyMaxPp describe the operation penalty: half a point for every two points below the threshold, capped at 3, unless the text differs.",
  "gcSteps are the closure brackets, each {abovePct, upToPct, penaltyPp}. The open bottom bracket has abovePct null.",
  "For ]70–65] 0.5, ]65–60] 1, ]60–50] 1.5, below 50 is 2: abovePct 65/60/50/null and upToPct 70/65/60/50.",
  "preProjectYear is {source: term} when the call takes the year from the acceptance term, or {source: fixed, year: N} when the call fixes the year.",
  "pages is a string, the printed page range, for example \"14-21\".",
  "supported is true. Do not write formulas. Copy the parameters.",
  "Use exactly these keys: callCode, resultIndicators, roModel, bestN, weights, thresholdPct, penaltyStepPp, penaltyEveryPp, penaltyMaxPp, gcSteps, preProjectYear, pages, supported.",
  "resultIndicators is an array of code strings. Do not wrap codes in objects. Leave RCR01 out of resultIndicators.",
  "callCode is the notice code printed on the call.",
].join(" ");

/** The model sometimes renames keys. This only maps names, it does not fill values. */
export function coerceRuleCardShape(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const value = { ...(raw as Record<string, unknown>) };
  if (!Array.isArray(value.resultIndicators) && Array.isArray(value.indicators)) {
    value.resultIndicators = value.indicators
      .map((item) => {
        if (typeof item === "string") return item;
        if (!item || typeof item !== "object") return null;
        const row = item as { code?: unknown; entersResult?: unknown };
        if (row.entersResult === false) return null;
        return typeof row.code === "string" ? row.code : null;
      })
      .filter((code): code is string => code !== null && code !== "RCR01");
  }
  if (Array.isArray(value.pages)) {
    const numbers = value.pages.filter((item): item is number => typeof item === "number");
    if (numbers.length >= 2) value.pages = `${numbers[0]}-${numbers[numbers.length - 1]}`;
  }
  return value;
}

export function parseModelJson(reply: string): unknown {
  const fenced = reply.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced?.[1] ?? reply).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("The model did not return a card.");
  return JSON.parse(raw.slice(start, end + 1));
}

export async function callText(bytes: Uint8Array): Promise<string> {
  const items = await readPdfItems(bytes);
  const pages = new Map<number, string[]>();
  for (const item of items) {
    const page = pages.get(item.page) ?? [];
    page.push(item.text);
    pages.set(item.page, page);
  }
  return [...pages.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([page, texts]) => `\n\n--- page ${page} ---\n${texts.join(" ")}`)
    .join("");
}

export async function readCallCard(filename: string, bytes: Uint8Array): Promise<{ reply: string; card: RuleCard | null; reason: string | null }> {
  const text = await callText(bytes);
  const { reply } = await askModel({
    filename,
    kind: "call",
    text,
    isPublic: true,
    lexicon: { workers: [], people: [], companies: [], addresses: [] },
    instructions: INSTRUCTIONS,
  });
  const shaped = coerceRuleCardShape(parseModelJson(reply));
  if (shaped && typeof shaped === "object") {
    const fromFile = filename.match(/MPR-\d{4}-\d+|MPr-\d{4}-\d+/)?.[0];
    const current = (shaped as { callCode?: unknown }).callCode;
    const missing = typeof current !== "string";
    const sameCode = typeof current === "string" && fromFile && current.toLowerCase() === fromFile.toLowerCase();
    if (fromFile && (missing || sameCode)) (shaped as { callCode: string }).callCode = fromFile;
  }
  const explained = explainRuleCard(shaped);
  if (explained.card) return { reply, card: explained.card, reason: null };
  return { reply, card: null, reason: explained.reason };
}

export function loadDotEnv(): void {
  const file = path.join(process.cwd(), ".env.local");
  let text = "";
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    if (!key || process.env[key]) continue;
    process.env[key] = match[2] ?? "";
  }
}
