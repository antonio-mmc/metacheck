/** Portuguese amounts such as 1.234.567,89. Returns null when the text is not a number. */
export function parsePtNumber(raw: string): number | null {
  const cleaned = raw.trim().replace(/\s/g, "").replace("€", "");
  if (!cleaned || !/^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$|^-?\d+(?:,\d+)?$/.test(cleaned)) {
    return null;
  }
  const value = Number(cleaned.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(value) ? value : null;
}

export function toCents(value: number): number {
  return Math.round(value * 100);
}

/** Positive division. An exact half rounds up: commercial rounding. */
export function divideHalfUp(numerator: bigint, denominator: bigint): bigint {
  const zero = BigInt(0);
  if (denominator <= zero) throw new Error("Cannot divide money by zero.");
  const negative = numerator < zero;
  const absolute = negative ? -numerator : numerator;
  const quotient = absolute / denominator;
  const remainder = absolute % denominator;
  const rounded = remainder * BigInt(2) >= denominator ? quotient + BigInt(1) : quotient;
  return negative ? -rounded : rounded;
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/** Sum in cents so 0.1 + 0.2 cannot drift the euro result. */
export function sumMoney(values: number[]): number {
  const cents = values.reduce((total, value) => total + toCents(value), 0);
  return fromCents(cents);
}

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
