import Papa from "papaparse";

import { accountRowSchema, type AccountRow } from "@/domain/schemas";
import { parsePtNumber } from "@/domain/money";
import { groupRows, readPdfItems } from "@/ingest/pdf-text";
import { readGrid } from "@/ingest/spreadsheet";

export type TrialBalance = {
  rows: AccountRow[];
  periodEnd: string | null;
  periodFromName: boolean;
  companyName: string | null;
  thirdParties: string[];
};

function periodFromText(text: string): string | null {
  const flat = text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  const year = flat.match(/20\d{2}/)?.[0] ?? "2026";
  if (/setembro|30-09|30\/09/.test(flat)) return `${year}-09-30`;
  if (/junho|30-06|30\/06/.test(flat)) return `${year}-06-30`;
  if (/mar[cç]o|31-03|31\/03/.test(flat)) return `${year}-03-31`;
  return null;
}

/** The September CSV has no date inside it. The month is then taken from the export name. */
function periodFromName(filename: string): string | null {
  const flat = filename
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
  const year = flat.match(/20\d{2}/)?.[0] ?? "2026";
  if (/set|sep/.test(flat)) return `${year}-09-30`;
  if (/jun/.test(flat)) return `${year}-06-30`;
  if (/mar|1t/.test(flat)) return `${year}-03-31`;
  return null;
}

function pushRow(
  rows: AccountRow[],
  file: string,
  location: string,
  code: string,
  description: string,
  debit: number,
  credit: number,
) {
  rows.push(accountRowSchema.parse({ code, description, debit, credit, source: { file, location } }));
}

async function fromPdf(file: string, bytes: Uint8Array): Promise<AccountRow[]> {
  const rows: AccountRow[] = [];
  const grouped = groupRows(await readPdfItems(bytes), 2);
  for (const row of grouped) {
    const codeItem = row.items.find((item) => /^\d{2,}$/.test(item.text) && item.x < 160);
    if (!codeItem) continue;
    const description = row.items
      .filter((item) => item.x >= 60 && item.x < 280 && !/^\d/.test(item.text))
      .map((item) => item.text)
      .join(" ")
      .replace(/\s+\*$/, "")
      .trim();
    const amounts = row.items
      .filter((item) => item.x > 250)
      .map((item) => parsePtNumber(item.text))
      .filter((value): value is number => value !== null);
    if (amounts.length < 2) continue;
    pushRow(rows, file, `page ${row.page}`, codeItem.text, description, amounts[0] ?? 0, amounts[1] ?? 0);
  }
  return rows;
}

function fromGrid(file: string, bytes: Uint8Array): AccountRow[] {
  const grid = readGrid(bytes);
  const headerIndex = grid.findIndex((row) => row.some((cell) => /^conta$/i.test(cell.trim())));
  if (headerIndex < 0) return [];
  const header = grid[headerIndex] ?? [];
  const column = (pattern: RegExp, from = 0) =>
    header.findIndex((cell, index) => index >= from && pattern.test(cell));
  const codeCol = column(/^conta$/i);
  const descriptionCol = column(/descri/i);
  const debitCol = column(/d[eé]bito/i);
  const creditCol = column(/cr[eé]dito/i, debitCol + 1);
  const rows: AccountRow[] = [];
  for (let index = headerIndex + 1; index < grid.length; index += 1) {
    const row = grid[index] ?? [];
    const code = (row[codeCol] ?? "").trim();
    const description = (row[descriptionCol] ?? "").trim();
    if (!/^\d{2,}$/.test(code)) continue;
    if (/^(subtotal|total|soma l[ií]quida)/i.test(description)) continue;
    const debit = Number(row[debitCol] ?? "");
    const credit = Number(row[creditCol] ?? "");
    if (!Number.isFinite(debit) || !Number.isFinite(credit)) continue;
    pushRow(rows, file, `row ${index + 1}`, code, description, debit, credit);
  }
  return rows;
}

function fromCsv(file: string, bytes: Uint8Array): AccountRow[] {
  const text = new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, delimiter: ";", skipEmptyLines: true });
  const rows: AccountRow[] = [];
  parsed.data.forEach((row, index) => {
    const code = (row.Conta ?? "").trim();
    if (!/^\d{2,}$/.test(code)) return;
    const debit = parsePtNumber(row.Debito ?? "");
    const credit = parsePtNumber(row.Credito ?? "");
    if (debit === null || credit === null) return;
    pushRow(rows, file, `row ${index + 2}`, code, row.Descricao ?? "", debit, credit);
  });
  return rows;
}

function companyAndParties(rows: AccountRow[], text: string): { companyName: string | null; thirdParties: string[] } {
  const legal = text.match(/[\p{L}0-9][\p{L}0-9 .'"’-]*?,\s*(?:Lda\.|S\.A\.|Unipessoal Lda\.|S\.r\.l\.(?:\s*\([^)]+\))?)/u);
  const thirdParties = rows
    .filter((row) => row.code.startsWith("21"))
    .map((row) => row.description.replace(/\s+–.*$/, "").trim())
    .filter((name) => name.length > 3);
  return { companyName: legal?.[0] ?? null, thirdParties };
}

export async function readTrialBalance(file: string, bytes: Uint8Array, text: string): Promise<TrialBalance> {
  const isPdf = bytes[0] === 0x25;
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b;
  const rows = isPdf ? await fromPdf(file, bytes) : isZip ? fromGrid(file, bytes) : fromCsv(file, bytes);
  const fromText = periodFromText(text);
  const periodEnd = fromText ?? periodFromName(file);
  const names = companyAndParties(rows, text);
  return { rows, periodEnd, periodFromName: fromText === null && periodEnd !== null, ...names };
}
