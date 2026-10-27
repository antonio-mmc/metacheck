import { z } from "zod";

import { parsePtNumber } from "@/domain/money";
import { readPdfPlain } from "@/ingest/pdf-text";

export type IesStatement = {
  year: number;
  hours: number;
  amounts: Record<string, number>;
  companyName: string | null;
  gaps: string[];
};

const iesSchema = z.object({
  year: z.number().int().min(1990).max(2100),
  hours: z.number().nonnegative(),
  amounts: z.record(z.string(), z.number()),
  companyName: z.string().nullable(),
  gaps: z.array(z.string()),
});

const CODES = ["A5001", "A5004", "A5005", "A5006", "A5007"] as const;

function amountAfter(text: string, code: string): number | null {
  if (!text.includes(code)) return null;
  const match = text.match(new RegExp(`${code}[^\\d]{0,180}?(\\d{1,3}(?:\\.\\d{3})*,\\d{2})`));
  return match ? (parsePtNumber(match[1] ?? "") ?? 0) : 0;
}

export async function readIes(bytes: Uint8Array): Promise<IesStatement> {
  const text = (await readPdfPlain(bytes, 4)).replace(/\s+/g, " ");
  const amounts: Record<string, number> = {};
  const gaps: string[] = [];
  for (const code of CODES) {
    const amount = amountAfter(text, code);
    if (amount === null) gaps.push(code);
    else amounts[code] = amount;
  }
  const hoursMatch = text.match(/A0012\D{0,40}?[\d.,]+\D{0,20}?(\d{1,3}(?:\.\d{3})+)/);
  const hours = hoursMatch ? (parsePtNumber(hoursMatch[1] ?? "") ?? 0) : 0;
  if (!hoursMatch) gaps.push("A0012");
  const year = Number(text.match(/Ano:\s*(\d{4})/)?.[1] ?? text.match(/\b(20\d{2})\b/)?.[1] ?? "0");
  const companyName = text.match(/Nome:\s*([\p{L}0-9 .,'’-]+?Lda\.)/u)?.[1] ?? null;
  return iesSchema.parse({ year, hours, amounts, companyName, gaps });
}
