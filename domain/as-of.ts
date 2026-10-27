import { AS_OF } from "@/domain/clock";
import { GRADUATE_MONTHLY_SALARY } from "@/domain/cost";
import {
  hiresAfterBalance,
  minimumExtraSales,
  nextHireOn,
  quartersUpTo,
  runOperation,
  type EngineInput,
} from "@/domain/engine";
import { simulate, type Lever } from "@/domain/simulate";

export type AsOfId = "Q1" | "Q2" | "Q3";

export type AsOfView = {
  id: AsOfId;
  label: string;
  /** What the books and the calendar knew. Q3 is pitch day, so the next hire is 1 November. */
  referenceDate: string;
  knownIn: string;
};

export const AS_OF_VIEWS: readonly AsOfView[] = [
  { id: "Q1", label: "Q1", referenceDate: "2026-03-31", knownIn: "March" },
  { id: "Q2", label: "Q2", referenceDate: "2026-06-30", knownIn: "June" },
  { id: "Q3", label: "Q3", referenceDate: AS_OF, knownIn: "October" },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function asOfView(id: AsOfId): AsOfView {
  const found = AS_OF_VIEWS.find((view) => view.id === id);
  if (!found) throw new Error(`Unknown quarter ${id}.`);
  return found;
}

/** First of the month after the reference date, inside the cruise year. */
export function defaultStartOn(referenceDate: string, cruiseYear: number): string {
  return nextHireOn(referenceDate, cruiseYear) ?? `${cruiseYear}-12-01`;
}

export function monthOptions(cruiseYear: number): { value: string; label: string }[] {
  return MONTHS.map((label, index) => ({
    value: `${cruiseYear}-${String(index + 1).padStart(2, "0")}-01`,
    label,
  }));
}

/** What a hire from the next possible month would have done, using the engine. */
export function knownThen(input: EngineInput, view: AsOfView): string {
  const operation = runOperation(input, view.referenceDate);
  const startOn = nextHireOn(view.referenceDate, input.contract.cruiseYear);
  if (operation.roPct >= operation.thresholdPct) {
    return `In ${view.knownIn} you would have known: the threshold was already clear.`;
  }
  if (!startOn) {
    return `In ${view.knownIn} you would have known: no hire date was left in the year.`;
  }
  const month = MONTHS[Number(startOn.slice(5, 7)) - 1] ?? "";
  let count: number | null = null;
  for (let people = 1; people <= 3; people += 1) {
    const result = simulate(
      input,
      [
        {
          kind: "hire",
          count: people,
          qualified: true,
          startOn,
          monthlySalary: GRADUATE_MONTHLY_SALARY,
        },
      ],
      view.referenceDate,
    );
    if (result.after.roPct >= input.rule.thresholdPct) {
      count = people;
      break;
    }
  }
  if (count === null) {
    return `In ${view.knownIn} you would have known: no hire of up to 3 people from 1 ${month} would have cleared the threshold.`;
  }
  const noun = count === 1 ? "hire" : "hires";
  return `In ${view.knownIn} you would have known: ${count} ${noun} from 1 ${month} would have cleared the threshold.`;
}

export function salesToClear(input: EngineInput, referenceDate: string): number {
  const quarter = quartersUpTo(input.quarters, referenceDate).at(-1);
  if (!quarter) return 0;
  const extras = hiresAfterBalance(input.people, quarter, referenceDate);
  return minimumExtraSales(input, quarter, extras);
}

/** The engine's paths as levers the simulator can apply. The engine already chose the people and the sales. */
export function pathLevers(
  input: EngineInput,
  referenceDate: string,
): { title: string; levers: Lever[] }[] {
  return runOperation(input, referenceDate).paths.map((path) => {
    const levers: Lever[] = [];
    if (path.plan.hires > 0 && path.plan.startOn) {
      levers.push({
        kind: "hire",
        count: path.plan.hires,
        qualified: true,
        startOn: path.plan.startOn,
        monthlySalary: GRADUATE_MONTHLY_SALARY,
      });
    }
    if (path.plan.extraSales > 0) levers.push({ kind: "extra_sales", euro: path.plan.extraSales });
    return { title: path.title, levers };
  });
}
