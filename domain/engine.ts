import type { CompanyContract } from "@/domain/contract";
import { GRADUATE_MONTHLY_SALARY, costUntilYearEnd } from "@/domain/cost";
import { annualEti, isQualifiedHabilitation } from "@/domain/eti";
import { formatEti, formatEuro, formatPercent, formatPp } from "@/domain/format";
import { roundTo } from "@/domain/money";
import { CONSERVATIVE_PENALTY, cutEuro, penaltyPp } from "@/domain/penalty";
import type { RuleCard } from "@/domain/rule-card";
import type { PersonRecord, Provenance } from "@/domain/schemas";

export type QuarterInput = {
  quarter: 1 | 2 | 3;
  months: number;
  /** Last day already in the books. Hires after this day are not known yet. */
  asOf: string;
  turnoverYtd: number;
  valueAddedYtd: number;
  file: string;
};

export type EngineInput = {
  asOf: string;
  contract: CompanyContract;
  rule: RuleCard;
  people: PersonRecord[];
  conventionalHours: number;
  staffFile: string;
  quarters: QuarterInput[];
};

export type TrackedCode = "RPR003" | "RSR23" | "RPR001" | "RPR002";

export type IndicatorResult = {
  code: TrackedCode;
  label: string;
  projected: number;
  preProject: number;
  assessed: number;
  target: number;
  ratioPct: number;
  countsInRo: boolean;
  sources: Provenance[];
  lines: string[];
};

export type QuarterPoint = {
  label: string;
  roPct: number;
  penaltyPp: number;
  cutEuro: number;
};

/** What a path changes: graduates hired from `startOn` and extra turnover by 31 December. */
export type PathPlan = {
  hires: number;
  startOn: string | null;
  extraSales: number;
};

export type PathResult = {
  kind: "hire" | "mixed" | "sales";
  plan: PathPlan;
  title: string;
  detail: string;
  roPct: number;
  cutEuro: number;
  costToYearEnd: number | null;
};

export type OperationResult = {
  companyName: string;
  callCode: string;
  cruiseYear: number;
  figuresTo: string;
  roPct: number;
  thresholdPct: number;
  gapPp: number;
  penaltyPp: number;
  penaltyNote: typeof CONSERVATIVE_PENALTY;
  cutEuro: number;
  eligibleEuro: number;
  ratePct: number;
  incentiveBefore: number;
  incentiveAfter: number;
  indicators: IndicatorResult[];
  bestCodes: TrackedCode[];
  quarters: QuarterPoint[];
  yearEndRoPct: number;
  headcountToday: number;
  averageEti: number;
  promisedEti: number;
  deadlineHeadline: string;
  deadlineSentence: string;
  amberTitle: string;
  amberBody: string;
  paths: PathResult[];
  etiLines: string[];
  cutLines: string[];
  targetsSource: "consultant";
};

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

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LABELS: Record<TrackedCode, string> = {
  RPR003: "Jobs created",
  RSR23: "Qualified jobs",
  RPR001: "Turnover",
  RPR002: "Value added per worker",
};

export type Snapshot = {
  eti: number;
  qualifiedEti: number;
  turnover: number;
  valueAdded: number;
  indicators: IndicatorResult[];
  roPct: number;
  penalty: number;
  cut: number;
  bestCodes: TrackedCode[];
};

function annualise(ytd: number, months: number): number {
  return (ytd * 12) / months;
}

function knownBy(people: PersonRecord[], asOf: string): PersonRecord[] {
  return people.filter((person) => person.startedOn <= asOf);
}

function inServiceOn(person: PersonRecord, day: string): boolean {
  if (person.startedOn > day) return false;
  if (person.endedOn && person.endedOn < day) return false;
  return true;
}

function hire(startOn: string): PersonRecord {
  return {
    name: "Scenario hire",
    nif: null,
    niss: null,
    weeklyHours: 40,
    startedOn: startOn,
    endedOn: null,
    habilitationCode: "6",
    source: { file: "scenario", location: "simulation" },
  };
}

function ratioOf(assessed: number, target: number): number {
  if (target === 0) throw new Error("A target of zero is not supported.");
  return (assessed / target) * 100;
}

export function projectQuarter(
  input: EngineInput,
  quarter: QuarterInput,
  extras: PersonRecord[],
  extraTurnover: number,
): Snapshot {
  const staff = [...knownBy(input.people, quarter.asOf), ...extras];
  const eti = annualEti(staff, input.contract.cruiseYear, input.conventionalHours);
  const qualifiedEti = annualEti(
    staff.filter((person) => isQualifiedHabilitation(person.habilitationCode)),
    input.contract.cruiseYear,
    input.conventionalHours,
  );
  const turnover = annualise(quarter.turnoverYtd, quarter.months) + extraTurnover;
  const valueAdded = annualise(quarter.valueAddedYtd, quarter.months);
  const contract = input.contract;
  const moneySource: Provenance = {
    file: quarter.file,
    location: "accounts 71, 72, 73, 74, 61, 62",
  };
  const staffSource: Provenance = { file: input.staffFile, location: "staff rows" };
  const term = contract.source;

  const jobsAssessed = eti - contract.preProjectEti;
  const qualifiedAssessed = qualifiedEti - contract.preProjectQualifiedEti;
  const turnoverGrowth =
    ((turnover - contract.preProjectTurnover) / contract.preProjectTurnover) * 100;
  const vaPerEti = valueAdded / eti;
  const preVaPerEti = contract.preProjectValueAdded / contract.preProjectEti;
  const vaGrowth = ((vaPerEti - preVaPerEti) / preVaPerEti) * 100;

  const drafted: Omit<IndicatorResult, "countsInRo">[] = [
    {
      code: "RPR003",
      label: LABELS.RPR003,
      projected: eti,
      preProject: contract.preProjectEti,
      assessed: jobsAssessed,
      target: contract.jobsTargetEti,
      ratioPct: ratioOf(jobsAssessed, contract.jobsTargetEti),
      sources: [staffSource, term],
      lines: [],
    },
    {
      code: "RSR23",
      label: LABELS.RSR23,
      projected: qualifiedEti,
      preProject: contract.preProjectQualifiedEti,
      assessed: qualifiedAssessed,
      target: contract.qualifiedTargetEti,
      ratioPct: ratioOf(qualifiedAssessed, contract.qualifiedTargetEti),
      sources: [staffSource, term],
      lines: [],
    },
    {
      code: "RPR001",
      label: LABELS.RPR001,
      projected: turnover,
      preProject: contract.preProjectTurnover,
      assessed: turnoverGrowth,
      target: contract.turnoverTargetGrowthPct,
      ratioPct: ratioOf(turnoverGrowth, contract.turnoverTargetGrowthPct),
      sources: [moneySource, term],
      lines: [],
    },
    {
      code: "RPR002",
      label: LABELS.RPR002,
      projected: vaPerEti,
      preProject: preVaPerEti,
      assessed: vaGrowth,
      target: contract.valueAddedTargetGrowthPct,
      ratioPct: ratioOf(vaGrowth, contract.valueAddedTargetGrowthPct),
      sources: [moneySource, staffSource, term],
      lines: [],
    },
  ];

  const ranked = [...drafted].sort(
    (a, b) => b.ratioPct - a.ratioPct || a.code.localeCompare(b.code),
  );
  const best = ranked.slice(0, input.rule.bestN);
  const bestCodes = best.map((item) => item.code);
  const roPct = best.reduce(
    (total, item, index) => total + item.ratioPct * (input.rule.weights[index] ?? 0),
    0,
  );
  const penalty = penaltyPp(
    roPct,
    input.rule.thresholdPct,
    input.rule.penaltyEveryPp,
    input.rule.penaltyStepPp,
    input.rule.penaltyMaxPp,
  );

  return {
    eti,
    qualifiedEti,
    turnover,
    valueAdded,
    roPct,
    penalty,
    cut: cutEuro(penalty, contract.eligibleEuro),
    bestCodes,
    indicators: drafted.map((item) => ({ ...item, countsInRo: bestCodes.includes(item.code) })),
  };
}

function monthStart(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/** First day a new hire can start: the 1st of the month after the reference date. */
export function nextHireOn(referenceDate: string, cruiseYear: number): string | null {
  const start = nextStart(referenceDate, cruiseYear);
  if (start.year !== cruiseYear) return null;
  return monthStart(start.year, start.month);
}

function nextStart(asOf: string, cruiseYear: number): { year: number; month: number } {
  const [year, month, day] = asOf.split("-").map(Number);
  if (year !== cruiseYear) return { year: cruiseYear, month: 1 };
  if (day === 1) return { year, month: month ?? 1 };
  if ((month ?? 12) === 12) return { year: year + 1, month: 1 };
  return { year, month: (month ?? 1) + 1 };
}

function figuresTo(iso: string): string {
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  return `${day} ${SHORT_MONTHS[month - 1] ?? ""}`;
}

function gapLabel(gap: number): string {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(roundTo(gap, 2));
}

function writeLines(input: EngineInput, quarter: QuarterInput, snap: Snapshot): void {
  const pace = `At the current pace, year to date × 12 / ${quarter.months}.`;
  for (const indicator of snap.indicators) {
    if (indicator.code === "RPR001") {
      indicator.lines = [
        `Turnover year to date ${formatEuro(quarter.turnoverYtd)}, accounts 71 and 72, ${quarter.file}.`,
        `${pace} ${formatEuro(quarter.turnoverYtd)} × 12 / ${quarter.months} = ${formatEuro(indicator.projected)}.`,
        `Pre-project ${formatEuro(indicator.preProject)}. Achieved ${formatPercent(indicator.assessed)} against a contracted ${formatPercent(indicator.target)}.`,
        `${formatPercent(indicator.assessed).replace("%", "")} / ${formatPercent(indicator.target).replace("%", "")} = ${formatPercent(indicator.ratioPct)} of the target.`,
      ];
    } else if (indicator.code === "RPR002") {
      indicator.lines = [
        `Projected value added ${formatEuro(snap.valueAdded)} over ${formatEti(snap.eti, 3)} FTE = ${formatEuro(indicator.projected)} per worker.`,
        `Pre-project ${formatEuro(indicator.preProject)}. Achieved ${formatPercent(indicator.assessed)} against a contracted ${formatPercent(indicator.target)}.`,
        `${formatPercent(indicator.assessed).replace("%", "")} / ${formatPercent(indicator.target).replace("%", "")} = ${formatPercent(indicator.ratioPct)} of the target.`,
        `Value added from ${quarter.file}. FTE from ${input.staffFile}. The check keeps FTE at 3 decimals: ${formatEti(snap.eti, 3)}.`,
      ];
    } else if (indicator.code === "RPR003") {
      indicator.lines = [
        `Projected FTE ${formatEti(snap.eti, 3)}. Pre-project ${formatEti(indicator.preProject, 2)}. Achieved ${formatEti(indicator.assessed, 2)} against a contracted ${formatEti(indicator.target, 2)}.`,
        `${formatEti(indicator.assessed, 2)} / ${formatEti(indicator.target, 2)} = ${formatPercent(indicator.ratioPct)} of the target.`,
        `${input.staffFile}. People still employed on ${quarter.asOf} are kept until 31 Dec. Later hires are not in this quarter's projection.`,
      ];
    } else {
      indicator.lines = [
        `Projected qualified FTE ${formatEti(snap.qualifiedEti, 3)}. Pre-project ${formatEti(indicator.preProject, 2)}. Achieved ${formatEti(indicator.assessed, 2)} against a contracted ${formatEti(indicator.target, 2)}.`,
        `${formatEti(indicator.assessed, 2)} / ${formatEti(indicator.target, 2)} = ${formatPercent(indicator.ratioPct)} of the target.`,
        `A degree is level 6 or higher on the staff map. Level 5 does not count. ${input.staffFile}.`,
      ];
    }
  }
}

function etiLines(input: EngineInput, quarter: QuarterInput, total: number): string[] {
  const staff = knownBy(input.people, quarter.asOf);
  const groups = new Map<string, number>();
  for (const person of staff) {
    const share = annualEti([person], input.contract.cruiseYear, input.conventionalHours);
    const key = formatEti(share, 3);
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  const parts = [...groups.entries()].map(([share, count]) => `${count} × ${share}`);
  return [
    `Projected FTE ${formatEti(total, 3)}. The panel rounds this to ${formatEti(total, 2)}.`,
    `${parts.join(" + ")} = ${formatEti(total, 3)}.`,
    `${input.staffFile}. Each person is months in ${input.contract.cruiseYear} / 12 × weekly hours / ${input.conventionalHours}.`,
  ];
}

/** Quarters whose books were already closed on the reference date. */
export function quartersUpTo(quarters: QuarterInput[], referenceDate: string): QuarterInput[] {
  return quarters
    .filter((quarter) => quarter.asOf <= referenceDate)
    .sort((a, b) => a.quarter - b.quarter);
}

/**
 * People on the current map who start after the balance date.
 * A past quarter does not know them. The headline does, once the reference date is later than that balance.
 */
export function hiresAfterBalance(
  people: PersonRecord[],
  quarter: QuarterInput,
  referenceDate: string,
): PersonRecord[] {
  if (quarter.asOf >= referenceDate) return [];
  return people.filter((person) => person.startedOn > quarter.asOf);
}

/** Smallest extra turnover, in steps of 1,000 euros, that reaches the threshold. Zero if it is already reached. */
export function minimumExtraSales(
  input: EngineInput,
  quarter: QuarterInput,
  extras: PersonRecord[] = [],
): number {
  let extra = 0;
  for (let step = 0; step < 500; step += 1) {
    if (projectQuarter(input, quarter, extras, extra).roPct >= input.rule.thresholdPct)
      return extra;
    extra += 1000;
  }
  return extra;
}

function amberTitle(penalty: number, paths: PathResult[]): string {
  if (penalty > 0 && paths.some((path) => path.cutEuro === 0)) return "Cut expected, still fixable";
  if (penalty > 0) return "Cut expected";
  return "No cut";
}

export function runOperation(input: EngineInput, referenceDate = input.asOf): OperationResult {
  const knownQuarters = quartersUpTo(input.quarters, referenceDate);
  const latest = knownQuarters.at(-1);
  if (!latest)
    throw new Error("The operation needs a trial balance on or before the reference date.");

  const alreadyOnTheMap = hiresAfterBalance(input.people, latest, referenceDate);
  const current = projectQuarter(input, latest, alreadyOnTheMap, 0);
  writeLines(input, latest, current);

  const quarters: QuarterPoint[] = knownQuarters.map((quarter) => {
    const snap = projectQuarter(input, quarter, [], 0);
    return {
      label: `Q${quarter.quarter}`,
      roPct: snap.roPct,
      penaltyPp: snap.penalty,
      cutEuro: snap.cut,
    };
  });

  const at = (hires: number, startOn: string, extraTurnover = 0) =>
    projectQuarter(
      input,
      latest,
      [...alreadyOnTheMap, ...Array.from({ length: hires }, () => hire(startOn))],
      extraTurnover,
    );

  const lastMonthFor = (hires: number): number | null => {
    for (let month = 12; month >= 1; month -= 1) {
      if (at(hires, monthStart(input.contract.cruiseYear, month)).roPct >= input.rule.thresholdPct)
        return month;
    }
    return null;
  };

  const start = nextStart(referenceDate, input.contract.cruiseYear);
  const startOn =
    start.year === input.contract.cruiseYear ? monthStart(start.year, start.month) : null;
  const alreadyClear = current.roPct >= input.rule.thresholdPct;
  let squad: number | null = null;
  if (!alreadyClear && startOn) {
    for (let count = 1; count <= 3; count += 1) {
      if (at(count, startOn).roPct >= input.rule.thresholdPct) {
        squad = count;
        break;
      }
    }
  }

  const oneHireMonth = alreadyClear ? null : lastMonthFor(1);
  const deadlineHeadline = alreadyClear
    ? "No cut"
    : startOn
      ? `1 ${SHORT_MONTHS[start.month - 1]}`
      : "—";
  const deadlineSentence = alreadyClear
    ? "No cut at this date, so no hire is required."
    : oneHireMonth && squad && startOn
      ? `1 hire would have been enough by ${MONTHS[oneHireMonth - 1]}. Today: ${squad}, starting 1 ${MONTHS[start.month - 1]}.`
      : squad && startOn
        ? `${squad} hires, starting 1 ${MONTHS[start.month - 1]}, clear the threshold. One hire does not.`
        : "No hire of up to 3 people clears the threshold from the next possible start date.";

  const paths: PathResult[] = [];
  if (!alreadyClear && squad && startOn) {
    const hired = at(squad, startOn);
    const cost = costUntilYearEnd(GRADUATE_MONTHLY_SALARY, startOn, squad);
    paths.push({
      kind: "hire",
      plan: { hires: squad, startOn, extraSales: 0 },
      title: `${squad} graduate${squad === 1 ? "" : "s"} from 1 ${SHORT_MONTHS[start.month - 1]}`,
      detail: `${formatEuro(cost)} until 31 Dec, avoids ${formatEuro(current.cut)}. The new role must be linked to the supported project.`,
      roPct: hired.roPct,
      cutEuro: hired.cut,
      costToYearEnd: cost,
    });
  }

  const extraTurnover = minimumExtraSales(input, latest, alreadyOnTheMap);
  const sales = projectQuarter(input, latest, alreadyOnTheMap, extraTurnover);

  // One graduate does part of the work and sales do the rest. Only worth showing when one hire alone falls short
  // and the mix needs less selling than sales alone.
  if (!alreadyClear && startOn && squad !== 1) {
    const mixSales = minimumExtraSales(input, latest, [...alreadyOnTheMap, hire(startOn)]);
    const mixed = at(1, startOn, mixSales);
    if (mixed.roPct >= input.rule.thresholdPct && mixSales > 0 && mixSales < extraTurnover) {
      const cost = costUntilYearEnd(GRADUATE_MONTHLY_SALARY, startOn, 1);
      paths.push({
        kind: "mixed",
        plan: { hires: 1, startOn, extraSales: mixSales },
        title: `1 graduate from 1 ${SHORT_MONTHS[start.month - 1]} + sell ${formatEuro(mixSales)} more`,
        detail: `${formatEuro(cost)} until 31 Dec for the hire, and ${formatEuro(extraTurnover - mixSales)} less to sell than with sales alone.`,
        roPct: mixed.roPct,
        cutEuro: mixed.cut,
        costToYearEnd: cost,
      });
    }
  }

  if (sales.roPct >= input.rule.thresholdPct && extraTurnover > 0) {
    paths.push({
      kind: "sales",
      plan: { hires: 0, startOn: null, extraSales: extraTurnover },
      title: `Sell ${formatEuro(extraTurnover)} more by 31 Dec`,
      detail: "No direct cost. Value added stays as it is, which is the prudent reading.",
      roPct: sales.roPct,
      cutEuro: sales.cut,
      costToYearEnd: null,
    });
  }

  const turnover = current.indicators.find((item) => item.code === "RPR001");
  const promised = input.contract.preProjectEti + input.contract.jobsTargetEti;
  const salesBeat = (turnover?.ratioPct ?? 0) >= 100;
  const amberBody = salesBeat
    ? `Sales beat the target, but staff averages ${formatEti(current.eti, 2)} FTE of the ${formatEti(promised, 2)} promised. There are ${paths.length} ways to keep the full grant.`
    : `The projected result is ${formatPercent(current.roPct)}. There are ${paths.length} ways to keep the full grant.`;

  const gap = input.rule.thresholdPct - current.roPct;
  const bands = current.penalty === 0 ? 0 : Math.round(current.penalty / input.rule.penaltyStepPp);
  const bestText = current.bestCodes
    .map((code) => {
      const item = current.indicators.find((indicator) => indicator.code === code);
      return `${LABELS[code].toLowerCase()} at ${formatPercent(item?.ratioPct ?? 0)}`;
    })
    .join(" and ");
  const bestSum = current.bestCodes
    .map((code) =>
      formatPercent(current.indicators.find((item) => item.code === code)?.ratioPct ?? 0).replace(
        "%",
        "",
      ),
    )
    .join(" + ");

  return {
    companyName: input.contract.companyName,
    callCode: input.contract.callCode,
    cruiseYear: input.contract.cruiseYear,
    figuresTo: figuresTo(latest.asOf),
    roPct: current.roPct,
    thresholdPct: input.rule.thresholdPct,
    gapPp: gap,
    penaltyPp: current.penalty,
    penaltyNote: CONSERVATIVE_PENALTY,
    cutEuro: current.cut,
    eligibleEuro: input.contract.eligibleEuro,
    ratePct: input.contract.ratePct,
    incentiveBefore: (input.contract.ratePct / 100) * input.contract.eligibleEuro,
    incentiveAfter:
      ((input.contract.ratePct - current.penalty) / 100) * input.contract.eligibleEuro,
    indicators: current.indicators,
    bestCodes: current.bestCodes,
    quarters,
    yearEndRoPct: current.roPct,
    headcountToday: input.people.filter((person) => inServiceOn(person, referenceDate)).length,
    averageEti: current.eti,
    promisedEti: promised,
    deadlineHeadline,
    deadlineSentence,
    amberTitle: amberTitle(current.penalty, paths),
    amberBody,
    paths,
    etiLines: etiLines(input, latest, current.eti),
    cutLines: [
      `The two best results are ${bestText}.`,
      `Result = (${bestSum}) / ${input.rule.bestN} = ${formatPercent(current.roPct)}.`,
      `Threshold ${input.rule.thresholdPct}%. Gap of ${gapLabel(gap)} percentage points.`,
      CONSERVATIVE_PENALTY,
      `${bands} steps × ${input.rule.penaltyStepPp} = ${formatPp(current.penalty)}.`,
      `Cut = ${current.penalty}% × ${formatEuro(input.contract.eligibleEuro)} eligible investment = ${formatEuro(current.cut)}.`,
      `The grant goes from ${formatEuro((input.contract.ratePct / 100) * input.contract.eligibleEuro)} to ${formatEuro(((input.contract.ratePct - current.penalty) / 100) * input.contract.eligibleEuro)}.`,
    ],
    targetsSource: "consultant",
  };
}
