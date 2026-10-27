import type { PersonRecord } from "@/domain/schemas";

const HOURS_PER_ETI = 1920;

export type Month = { year: number; month: number };

/** Months touched by the inclusive date range. Dates are YYYY-MM-DD. */
export function monthsBetween(from: string, to: string): Month[] {
  const start = parseIso(from);
  const end = parseIso(to);
  const months: Month[] = [];
  let year = start.year;
  let month = start.month;
  while (year < end.year || (year === end.year && month <= end.month)) {
    months.push({ year, month });
    month += 1;
    if (month === 13) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

function parseIso(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split("-").map(Number);
  return { year: year ?? 0, month: month ?? 1, day: day ?? 1 };
}

function monthEnd(month: Month): string {
  const last = new Date(Date.UTC(month.year, month.month, 0)).getUTCDate();
  return `${month.year}-${String(month.month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
}

function monthStart(month: Month): string {
  return `${month.year}-${String(month.month).padStart(2, "0")}-01`;
}

/** In service that month: entry on day 1 counts, exit on the last day counts. */
export function employedInMonth(person: PersonRecord, month: Month): boolean {
  const start = monthStart(month);
  const end = monthEnd(month);
  if (person.startedOn > end) return false;
  if (person.endedOn && person.endedOn < start) return false;
  return true;
}

/**
 * Average FTE across the months of the period.
 * Each month adds weekly hours / conventional hours for every person in service.
 * Section 5 of the calculation rules gives the month fraction; the period figure
 * is that staffing level averaged over the months already elapsed, not the /12 annual total.
 */
export function averageEti(
  people: PersonRecord[],
  from: string,
  to: string,
  conventionalHours = 40,
): number {
  const months = monthsBetween(from, to);
  if (months.length === 0 || conventionalHours <= 0) return 0;
  let sum = 0;
  for (const month of months) {
    for (const person of people) {
      if (employedInMonth(person, month)) sum += person.weeklyHours / conventionalHours;
    }
  }
  return sum / months.length;
}

/** Annual ETI: complete months in the calendar year / 12, times the weekly fraction. */
export function annualEti(people: PersonRecord[], year: number, conventionalHours = 40): number {
  if (conventionalHours <= 0) return 0;
  let sum = 0;
  for (const person of people) {
    const months = monthsBetween(`${year}-01-01`, `${year}-12-31`).filter((month) =>
      employedInMonth(person, month),
    ).length;
    sum += (months / 12) * (person.weeklyHours / conventionalHours);
  }
  return sum;
}

/** RU column 11: the first digit 6, 7 or 8 is a degree. Column 17 is not this. */
export function isQualifiedHabilitation(code: string | null): boolean {
  if (!code) return false;
  return /^[678]/.test(code);
}

export function countQualified(people: PersonRecord[]): number {
  return people.filter((person) => isQualifiedHabilitation(person.habilitationCode)).length;
}

/** IES hours worked / 1,920. One full-time year is 40 hours × 48 weeks. */
export function etiFromHours(hours: number): number {
  return hours / HOURS_PER_ETI;
}
