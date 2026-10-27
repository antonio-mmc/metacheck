import { personRecordSchema, type PersonRecord } from "@/domain/schemas";
import { parsePtNumber } from "@/domain/money";
import { excelSerialToIso, readGrid } from "@/ingest/spreadsheet";

export type StaffMap = {
  people: PersonRecord[];
  companyName: string | null;
  conventionalHours: number;
  unreadRows: number;
};

function columnIndex(header: string[], pattern: RegExp): number {
  return header.findIndex((cell) => pattern.test(cell.normalize("NFD").replace(/\p{M}/gu, "")));
}

function habilitationCode(text: string): string | null {
  const flat = text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  if (/doutoramento/.test(flat)) return "8";
  if (/mestrado/.test(flat)) return "7";
  if (/licenciatura/.test(flat)) return "6";
  if (/ctesp|tecnico superior profissional/.test(flat)) return "5";
  if (/nivel 4|profissional/.test(flat)) return "4";
  if (/12/.test(flat)) return "3";
  if (/9/.test(flat)) return "2";
  if (/6/.test(flat)) return "1";
  return null;
}

function asDate(value: string): string | null {
  if (!value.trim()) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  const serial = Number(value);
  if (!Number.isFinite(serial) || serial < 20000) return null;
  const iso = excelSerialToIso(serial);
  return iso || null;
}

export function readStaffMap(file: string, bytes: Uint8Array): StaffMap {
  const grid = readGrid(bytes);
  const headerIndex = grid.findIndex(
    (row) => row.some((cell) => /^nome$/i.test(cell.trim())) && row.some((cell) => /^nif$/i.test(cell.trim())),
  );
  if (headerIndex < 0) {
    throw new Error("The staff map has no name column.");
  }
  const header = grid[headerIndex] ?? [];
  const nameCol = columnIndex(header, /^nome$/i);
  const nifCol = columnIndex(header, /^nif$/i);
  const nissCol = columnIndex(header, /^niss$/i);
  const studyCol = columnIndex(header, /habilit/i);
  const startCol = columnIndex(header, /admiss/i);
  const endCol = columnIndex(header, /cess/i);
  const hoursCol = columnIndex(header, /horario/i);
  const preamble = grid
    .slice(0, headerIndex)
    .flat()
    .join(" ");
  const conventional = preamble.match(/(\d+)\s*h\s*\/\s*semana/i);
  const companyName = grid[0]?.[0]?.trim() || null;
  const people: PersonRecord[] = [];
  let unreadRows = 0;

  for (let index = headerIndex + 1; index < grid.length; index += 1) {
    const row = grid[index] ?? [];
    const name = (row[nameCol] ?? "").trim();
    if (!name || /documento fict/i.test(name)) continue;
    const startedOn = asDate(row[startCol] ?? "");
    const hours = parsePtNumber(row[hoursCol] ?? "") ?? Number(row[hoursCol] ?? "");
    if (!startedOn || !Number.isFinite(hours)) {
      unreadRows += 1;
      continue;
    }
    people.push(
      personRecordSchema.parse({
        name,
        nif: (row[nifCol] ?? "").trim() || null,
        niss: (row[nissCol] ?? "").trim() || null,
        weeklyHours: hours,
        startedOn,
        endedOn: asDate(row[endCol] ?? ""),
        habilitationCode: habilitationCode(row[studyCol] ?? ""),
        source: { file, location: `row ${index + 1}` },
      }),
    );
  }

  return {
    people,
    companyName,
    conventionalHours: conventional ? Number(conventional[1]) : 40,
    unreadRows,
  };
}
