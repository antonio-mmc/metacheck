import { divideHalfUp } from "@/domain/money";

/** 14 payments, employer social security 23.75%, accident insurance 1.5%. Meal allowance is out. */
const PAYMENTS_PER_YEAR = BigInt(14);
/** 1.2525 = 501/400, kept as integers so a half cent cannot drift. */
const MULTIPLIER_NUM = BigInt(501);
const MULTIPLIER_DEN = BigInt(400);

export const GRADUATE_MONTHLY_SALARY = 1500;
export const OTHER_MONTHLY_SALARY = 1000;

function euroToCents(amount: number): bigint {
  if (!Number.isFinite(amount)) throw new Error("Money must be a finite number.");
  return BigInt(Math.round(amount * 100));
}

/**
 * Employer cost for `months` months and `count` people, rounded once to the cent.
 * A half cent rounds up. Rounding the month first and then multiplying would turn
 * the three-month total of 6,575.625 into 6,575.64.
 */
export function employerCost(monthlySalary: number, months: number, count: number): number {
  if (!Number.isInteger(months) || months < 1 || months > 12) {
    throw new Error("Employer cost needs a whole number of months from 1 to 12.");
  }
  if (!Number.isInteger(count) || count < 1)
    throw new Error("Employer cost needs at least one person.");
  const cents = divideHalfUp(
    euroToCents(monthlySalary) *
      PAYMENTS_PER_YEAR *
      MULTIPLIER_NUM *
      BigInt(months) *
      BigInt(count),
    BigInt(12) * MULTIPLIER_DEN,
  );
  return Number(cents) / 100;
}

export function monthlyEmployerCost(monthlySalary: number): number {
  return employerCost(monthlySalary, 1, 1);
}

/** Cost from the start month through December, for every person hired. */
export function costUntilYearEnd(monthlySalary: number, startOn: string, count: number): number {
  const month = Number(startOn.slice(5, 7));
  return employerCost(monthlySalary, 12 - month + 1, count);
}

/** Twelve months at the same salary. The start month does not change this. */
export function annualEmployerCost(monthlySalary: number, count: number): number {
  return employerCost(monthlySalary, 12, count);
}
