import * as XLSX from "xlsx";

export type SheetGrid = string[][];

/** First worksheet as text cells. Dates stay as Excel serials until a reader converts them. */
export function readGrid(bytes: Uint8Array): SheetGrid {
  const book = XLSX.read(bytes, { type: "array", cellDates: false });
  const name = book.SheetNames[0];
  if (!name) return [];
  const sheet = book.Sheets[name];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
  });
  return rows.map((row) => row.map((cell) => (cell === null || cell === undefined ? "" : String(cell))));
}

export function gridText(grid: SheetGrid): string {
  return grid.map((row) => row.join(" ")).join("\n");
}

/** Excel serial (1900 date system) to YYYY-MM-DD. */
export function excelSerialToIso(serial: number): string {
  const parsed = XLSX.SSF.parse_date_code(serial);
  if (!parsed) return "";
  const month = String(parsed.m).padStart(2, "0");
  const day = String(parsed.d).padStart(2, "0");
  return `${parsed.y}-${month}-${day}`;
}
