import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

export type PdfItem = {
  text: string;
  x: number;
  y: number;
  page: number;
};

type TextItem = {
  str: string;
  transform: number[];
};

function isText(item: unknown): item is TextItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "str" in item &&
    typeof item.str === "string" &&
    "transform" in item &&
    Array.isArray(item.transform)
  );
}

export async function readPdfItems(bytes: Uint8Array, maxPages?: number): Promise<PdfItem[]> {
  // A fresh copy: pdf.js transfers the buffer to its worker and detaches the original.
  const data = new Uint8Array(bytes);
  const doc = await getDocument({ data, verbosity: 0 }).promise;
  const items: PdfItem[] = [];
  const pages = maxPages ? Math.min(doc.numPages, maxPages) : doc.numPages;
  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    for (const item of content.items) {
      if (!isText(item) || !item.str.trim()) continue;
      items.push({
        text: item.str,
        x: item.transform[4] ?? 0,
        y: item.transform[5] ?? 0,
        page: pageNumber,
      });
    }
  }
  const closable = doc as { destroy?: () => Promise<void> };
  await closable.destroy?.();
  return items;
}

export type PdfRow = {
  page: number;
  y: number;
  items: PdfItem[];
  text: string;
};

export function groupRows(items: PdfItem[], tolerance = 1.2): PdfRow[] {
  const rows: PdfRow[] = [];
  for (const item of items) {
    const row = rows.find(
      (candidate) => candidate.page === item.page && Math.abs(candidate.y - item.y) <= tolerance,
    );
    if (row) {
      row.items.push(item);
      continue;
    }
    rows.push({ page: item.page, y: item.y, items: [item], text: "" });
  }
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    row.text = row.items.map((item) => item.text).join(" ");
  }
  rows.sort((a, b) => a.page - b.page || b.y - a.y);
  return rows;
}

export async function readPdfPlain(bytes: Uint8Array, maxPages = 2): Promise<string> {
  const items = await readPdfItems(bytes, maxPages);
  return items.map((item) => item.text).join(" ");
}
