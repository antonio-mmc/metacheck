import { personRecordSchema, type PersonRecord } from "@/domain/schemas";
import { parsePtNumber } from "@/domain/money";
import { groupRows, readPdfItems, type PdfItem } from "@/ingest/pdf-text";

export type SingleReport = {
  people: PersonRecord[];
  year: number;
  companyName: string | null;
  address: string | null;
  unreadRows: number;
};

function closest(items: PdfItem[], y: number, minX: number, maxX: number, pattern: RegExp): string | null {
  const found = items
    .filter((item) => item.x >= minX && item.x < maxX && pattern.test(item.text))
    .sort((a, b) => Math.abs(a.y - y) - Math.abs(b.y - y))[0];
  return found?.text ?? null;
}

/**
 * Column 11 (around x=420) is the habilitation. Column 17 (around x=620) is the
 * firm's own grade and is never read.
 */
export async function readSingleReport(file: string, bytes: Uint8Array): Promise<SingleReport> {
  const items = await readPdfItems(bytes, 1);
  const rows = groupRows(items, 1.4);
  const plain = items.map((item) => item.text).join(" ");
  const year = Number(plain.match(/Ano de refer[eê]ncia:\s*(\d{4})/i)?.[1] ?? "0");
  const companyName = plain.match(/Nome\s+([\p{L}0-9 .,'’-]+?Lda\.)/u)?.[1] ?? null;
  const address =
    plain.match(/(?:Rua|Avenida|Largo|Praça|Travessa|Lugar)\s+[^.]{8,120}?\d{4}-\d{3}\s+[\p{L} ]+/u)?.[0] ?? null;
  const anchors = rows
    .filter(
      (row) =>
        row.items.some((item) => /^\d{11}$/.test(item.text)) &&
        row.items.some((item) => item.x >= 60 && item.x < 180 && /\p{L}{2}/u.test(item.text)),
    )
    .sort((a, b) => b.y - a.y);
  const people: PersonRecord[] = [];
  let unreadRows = 0;

  for (let index = 0; index < anchors.length; index += 1) {
    const row = anchors[index];
    if (!row) continue;
    const previous = anchors[index - 1];
    const next = anchors[index + 1];
    const ceiling = previous ? (previous.y + row.y) / 2 : row.y + 12;
    const floor = next ? (row.y + next.y) / 2 : row.y - 12;
    const band = items.filter((item) => item.page === row.page && item.y <= ceiling && item.y >= floor);
    const niss = row.items.find((item) => /^\d{11}$/.test(item.text));
    const name = row.items.find((item) => item.x >= 60 && item.x < 180 && /\p{L}{2}/u.test(item.text));
    const entry = closest(band, row.y, 275, 320, /^\d{4}-\d{2}$/);
    const hoursText = closest(band, row.y, 680, 740, /^\d+,\d$/);
    const habilitation = closest(band, row.y, 400, 460, /^\d{3}$/);
    const hours = hoursText ? parsePtNumber(hoursText) : null;
    if (!niss || !name) continue;
    if (!entry || hours === null) {
      unreadRows += 1;
      continue;
    }
    people.push(
      personRecordSchema.parse({
        name: name.text.trim(),
        nif: null,
        niss: niss.text,
        weeklyHours: hours,
        startedOn: `${entry}-01`,
        endedOn: null,
        habilitationCode: habilitation,
        source: { file, location: `page ${row.page}` },
      }),
    );
  }

  return { people, year, companyName, address, unreadRows };
}
