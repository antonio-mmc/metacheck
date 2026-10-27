import { annualEmployerCost, costUntilYearEnd } from "@/domain/cost";
import {
  hiresAfterBalance,
  projectQuarter,
  quartersUpTo,
  type EngineInput,
  type Snapshot,
  type TrackedCode,
} from "@/domain/engine";
import { roundTo } from "@/domain/money";
import type { PersonRecord } from "@/domain/schemas";
import { z } from "zod";

export const SALARY_NOTE =
  "The salary changes the cost only. It does not change the result of the operation.";

export const leverSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("hire"),
    count: z.number().int().positive(),
    qualified: z.boolean(),
    startOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    monthlySalary: z.number().positive(),
  }),
  z.object({
    kind: z.literal("extra_sales"),
    euro: z.number().nonnegative(),
  }),
]);

export type Lever = z.infer<typeof leverSchema>;

export type SimulationSide = {
  roPct: number;
  penaltyPp: number;
  cutEuro: number;
  bestCodes: TrackedCode[];
  indicators: {
    code: TrackedCode;
    label: string;
    ratioPct: number;
    countsInRo: boolean;
  }[];
};

export type SimulationResult = {
  referenceDate: string;
  before: SimulationSide;
  after: SimulationSide;
  costToYearEnd: number | null;
  annualCost: number | null;
  salesEuro: number;
  /** Extra sales divided by the pace of the months still left in the year. */
  effortPct: number | null;
  notes: string[];
};

function sideOf(snap: Snapshot): SimulationSide {
  return {
    roPct: snap.roPct,
    penaltyPp: snap.penalty,
    cutEuro: snap.cut,
    bestCodes: snap.bestCodes,
    indicators: snap.indicators.map((indicator) => ({
      code: indicator.code,
      label: indicator.label,
      ratioPct: indicator.ratioPct,
      countsInRo: indicator.countsInRo,
    })),
  };
}

function hiredPerson(lever: Extract<Lever, { kind: "hire" }>, index: number): PersonRecord {
  return {
    name: `Scenario hire ${index}`,
    nif: null,
    niss: null,
    weeklyHours: 40,
    startedOn: lever.startOn,
    endedOn: null,
    habilitationCode: lever.qualified ? "6" : null,
    source: { file: "scenario", location: "simulation" },
  };
}

/** Applies every lever at once. Salary never enters an indicator. */
export function simulate(
  input: EngineInput,
  levers: Lever[],
  referenceDate = input.asOf,
): SimulationResult {
  const parsed = z.array(leverSchema).parse(levers);
  const quarter = quartersUpTo(input.quarters, referenceDate).at(-1);
  if (!quarter)
    throw new Error("The operation needs a trial balance on or before the reference date.");

  const hires = parsed.filter((lever) => lever.kind === "hire");
  const salesEuro = parsed.reduce(
    (total, lever) => (lever.kind === "extra_sales" ? total + lever.euro : total),
    0,
  );
  let index = 0;
  const hired = hires.flatMap((lever) =>
    Array.from({ length: lever.count }, () => {
      index += 1;
      return hiredPerson(lever, index);
    }),
  );

  const onTheMap = hiresAfterBalance(input.people, quarter, referenceDate);
  const before = projectQuarter(input, quarter, onTheMap, 0);
  const after = projectQuarter(input, quarter, [...onTheMap, ...hired], salesEuro);
  const remainingMonths = 12 - quarter.months;
  const pace = (before.turnover / 12) * remainingMonths;

  const notes: string[] = [];
  if (hires.length > 0) notes.push(SALARY_NOTE);
  if (parsed.length > 0) {
    for (const indicator of after.indicators) {
      if (!indicator.countsInRo) {
        notes.push(
          `${indicator.label} is not one of the two best, so it does not move the result.`,
        );
      }
    }
  }

  return {
    referenceDate,
    before: sideOf(before),
    after: sideOf(after),
    costToYearEnd: hires.length
      ? hires.reduce(
          (total, lever) =>
            total + costUntilYearEnd(lever.monthlySalary, lever.startOn, lever.count),
          0,
        )
      : null,
    annualCost: hires.length
      ? hires.reduce(
          (total, lever) => total + annualEmployerCost(lever.monthlySalary, lever.count),
          0,
        )
      : null,
    salesEuro,
    effortPct: salesEuro > 0 && pace > 0 ? (salesEuro / pace) * 100 : null,
    notes,
  };
}

export function sameResult(left: SimulationResult, right: SimulationResult): boolean {
  const ratio = (side: SimulationSide) =>
    side.indicators.map((indicator) => roundTo(indicator.ratioPct, 2));
  return (
    ratio(left.after).join() === ratio(right.after).join() &&
    roundTo(left.after.roPct, 2) === roundTo(right.after.roPct, 2) &&
    roundTo(left.after.cutEuro, 2) === roundTo(right.after.cutEuro, 2) &&
    left.costToYearEnd === right.costToYearEnd &&
    left.annualCost === right.annualCost
  );
}
