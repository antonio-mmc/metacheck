import type { AccountRow } from "@/domain/schemas";
import { fromCents, sumMoney, toCents } from "@/domain/money";

const ADDED = ["71", "72", "73", "74"] as const;
const SUBTRACTED = ["61", "62"] as const;

/**
 * A row is a root when no shorter account code in the same list prefixes it.
 * Reason lines and their subaccounts then cannot both be summed. Subtotals
 * have no account code and never enter.
 */
export function selectRoots(rows: AccountRow[]): AccountRow[] {
  const coded = rows.filter((row) => /^\d+$/.test(row.code));
  return coded.filter(
    (row) =>
      !coded.some(
        (other) =>
          other.code !== row.code &&
          other.code.length < row.code.length &&
          row.code.startsWith(other.code),
      ),
  );
}

/** Credit balance for class 7, debit balance for class 6. */
export function signedNet(row: AccountRow): number {
  const prefix = row.code.slice(0, 2);
  if ((ADDED as readonly string[]).includes(prefix)) return row.credit - row.debit;
  if ((SUBTRACTED as readonly string[]).includes(prefix)) return row.debit - row.credit;
  return row.debit - row.credit;
}

export type ValueAdded = {
  turnover: number;
  total: number;
  parts: Record<(typeof ADDED)[number] | (typeof SUBTRACTED)[number], number>;
  debit: number;
  credit: number;
  balanced: boolean;
};

export function valueAdded(rows: AccountRow[]): ValueAdded {
  const roots = selectRoots(rows);
  const parts = { "71": 0, "72": 0, "73": 0, "74": 0, "61": 0, "62": 0 };

  for (const row of roots) {
    const prefix = row.code.slice(0, 2);
    if (prefix in parts) {
      const key = prefix as keyof typeof parts;
      parts[key] = fromCents(toCents(parts[key]) + toCents(signedNet(row)));
    }
  }

  const added = sumMoney(ADDED.map((key) => parts[key]));
  const subtracted = sumMoney(SUBTRACTED.map((key) => parts[key]));
  const total = fromCents(toCents(added) - toCents(subtracted));
  const turnover = sumMoney([parts["71"], parts["72"]]);
  const debit = sumMoney(roots.map((row) => row.debit));
  const credit = sumMoney(roots.map((row) => row.credit));

  return {
    turnover,
    total,
    parts,
    debit,
    credit,
    balanced: debit === credit,
  };
}

/** Net of one account prefix, using roots only, so 75, 78 and 6812 can be shown apart from VA. */
export function netOf(rows: AccountRow[], prefix: string): number {
  const matches = selectRoots(rows).filter(
    (row) => row.code === prefix || row.code.startsWith(prefix),
  );
  return sumMoney(matches.map((row) => row.credit - row.debit));
}
