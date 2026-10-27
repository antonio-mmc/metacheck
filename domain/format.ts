const percent = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const euro = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const step = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export type FigureKind = "percent" | "euro" | "pp" | "count";

export function formatPercent(value: number): string {
  return `${percent.format(value)}%`;
}

export function formatEuro(value: number): string {
  return euro.format(value);
}

export function formatPp(value: number): string {
  return `${step.format(value)} p.p.`;
}

export function formatEti(value: number, decimals: number): string {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);
}

export function formatFigure(kind: FigureKind, value: number): string {
  if (kind === "percent") return formatPercent(value);
  if (kind === "euro") return formatEuro(value);
  if (kind === "count") return formatCount(value);
  return formatPp(value);
}
