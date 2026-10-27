import { GRADUATE_MONTHLY_SALARY, annualEmployerCost } from "@/domain/cost";
import {
  hiresAfterBalance,
  minimumExtraSales,
  nextHireOn,
  projectQuarter,
  quartersUpTo,
  runOperation,
  type EngineInput,
} from "@/domain/engine";
import { formatEti, formatEuro, formatPercent, formatPp } from "@/domain/format";
import { simulate } from "@/domain/simulate";

export const SUGGESTED_QUESTIONS = [
  "Are we going to lose part of the grant?",
  "Is it worth hiring one graduate at 1,500 a month?",
  "Why is value added per worker at risk?",
] as const;

export const CONSULTANT_LINE = "Suggestion · to be confirmed by your BF consultant";

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

export type CachedAnswer = {
  question: (typeof SUGGESTED_QUESTIONS)[number];
  answer: string;
  sources: string[];
  suggestsAction: boolean;
  /** Formatted figures that were inserted. The chat does not show this. */
  grounded: string;
};

class Figures {
  private readonly parts: string[] = [];

  use(text: string): string {
    this.parts.push(text);
    return text;
  }

  joined(): string {
    return this.parts.join(" ");
  }
}

function digitTokens(text: string): string[] {
  const withoutDates = text.replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ");
  return withoutDates.match(/\d[\d,]*(?:\.\d+)?/g) ?? [];
}

/** Digits in the answer must have been inserted from the engine. "3 years" is the call rule, not a result. A date is not a figure. */
export function numbersNotGrounded(text: string, grounded: string): string[] {
  const stripped = text.replace(/\b3 years\b/g, " ");
  const tokens = digitTokens(stripped);
  const allowed = new Set(digitTokens(grounded));
  return tokens.filter((token) => !allowed.has(token));
}

function finish(answer: string, suggestsAction: boolean): string {
  if (!suggestsAction) return answer;
  return `${answer} ${CONSULTANT_LINE}`;
}

/** The three rehearsed questions. Every calculated figure is taken from the engine. */
export function rehearsedAnswers(input: EngineInput): CachedAnswer[] {
  const operation = runOperation(input);
  const quarter = quartersUpTo(input.quarters, input.asOf).at(-1);
  if (!quarter)
    throw new Error("The operation needs a trial balance on or before the reference date.");
  const startOn = nextHireOn(input.asOf, input.contract.cruiseYear);
  if (!startOn) throw new Error("There is no hire date left in the cruise year.");
  const monthName = MONTHS[Number(startOn.slice(5, 7)) - 1] ?? "";

  const onTheMap = hiresAfterBalance(input.people, quarter, input.asOf);
  const snap = projectQuarter(input, quarter, onTheMap, 0);
  const one = simulate(input, [
    { kind: "hire", count: 1, qualified: true, startOn, monthlySalary: GRADUATE_MONTHLY_SALARY },
  ]);
  const two = simulate(input, [
    { kind: "hire", count: 2, qualified: true, startOn, monthlySalary: GRADUATE_MONTHLY_SALARY },
  ]);
  const salesEuro = minimumExtraSales(input, quarter, onTheMap);
  const saved = operation.cutEuro - one.after.cutEuro;
  const eachYear = annualEmployerCost(GRADUATE_MONTHLY_SALARY, 1);
  const valueAdded = operation.indicators.find((indicator) => indicator.code === "RPR002");
  if (!valueAdded || one.costToYearEnd === null || two.costToYearEnd === null) {
    throw new Error("The rehearsed answers need the value-added indicator and both hire costs.");
  }

  const contract = input.contract;
  const growth =
    ((snap.valueAdded - contract.preProjectValueAdded) / contract.preProjectValueAdded) * 100;
  const margin = (snap.valueAdded / snap.turnover) * 100;
  const preMargin = (contract.preProjectValueAdded / contract.preProjectTurnover) * 100;

  const loss = new Figures();
  const best = operation.bestCodes
    .map((code) => {
      const indicator = operation.indicators.find((item) => item.code === code);
      return `${indicator?.label.toLowerCase() ?? code} ${loss.use(formatPercent(indicator?.ratioPct ?? 0))}`;
    })
    .join(" and ");
  const lossAnswer = finish(
    `Yes, at the current pace. Projected result ${loss.use(formatPercent(operation.roPct))} (${best} are the two best), ${loss.use(formatPp(operation.gapPp))} below the ${loss.use(formatPercent(operation.thresholdPct))} threshold, so the cut is ${loss.use(formatPp(operation.penaltyPp))} = ${loss.use(formatEuro(operation.cutEuro))}.`,
    false,
  );

  const hire = new Figures();
  const hireAnswer = finish(
    `One graduate from ${hire.use(`1 ${monthName}`)}: result ${hire.use(formatPercent(one.after.roPct))}, the cut drops to ${hire.use(formatEuro(one.after.cutEuro))} (saves ${hire.use(formatEuro(saved))}) for ${hire.use(formatEuro(one.costToYearEnd))} until ${hire.use("31 December")}. Two graduates: result ${hire.use(formatPercent(two.after.roPct))}, no cut, ${hire.use(formatEuro(two.costToYearEnd))} until 31 December. After that, ${hire.use(formatEuro(eachYear))} a year each. No legal duty to keep them 3 years under this call; the role must be linked to the supported project. Without hiring: ${hire.use(formatEuro(salesEuro))} more sales by 31 December.`,
    true,
  );

  const added = new Figures();
  const addedAnswer = finish(
    `Value added grows only ${added.use(formatPercent(growth))} (${added.use(formatEuro(contract.preProjectValueAdded))} to ${added.use(formatEuro(snap.valueAdded))} projected) while FTE rose from ${added.use(formatEti(contract.preProjectEti, 2))} to ${added.use(formatEti(operation.averageEti, 2))}: the July and August hires added people before adding value. Margins also fell (value added / turnover ${added.use(formatPercent(preMargin))} to ${added.use(formatPercent(margin))}, energy and subcontracting in FSE). Value added per worker ${added.use(formatPercent(valueAdded.assessed))} against a ${added.use(formatPercent(valueAdded.target))} target = ${added.use(formatPercent(valueAdded.ratioPct))}.`,
    false,
  );

  return [
    {
      question: SUGGESTED_QUESTIONS[0],
      answer: lossAnswer,
      sources: [
        "Acceptance term (targets)",
        "Balancete_Set2026.csv (turnover, VA)",
        "staff map (FTE)",
        "call MPR-2024-3 p. 21",
      ],
      suggestsAction: false,
      grounded: loss.joined(),
    },
    {
      question: SUGGESTED_QUESTIONS[1],
      answer: hireAnswer,
      sources: [
        "Staff map",
        "call p. 14–15 and 21",
        "cost rules (14 salaries, 23.75% social security)",
      ],
      suggestsAction: true,
      grounded: hire.joined(),
    },
    {
      question: SUGGESTED_QUESTIONS[2],
      answer: addedAnswer,
      sources: ["Balancete_Set2026.csv (61, 62)", "staff map", "acceptance term"],
      suggestsAction: false,
      grounded: added.joined(),
    },
  ];
}
