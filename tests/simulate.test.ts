import { describe, expect, it } from "vitest";

import { companyAPeople, companyAQuarters } from "@/app/operation";
import { AS_OF } from "@/domain/clock";
import { companyAContract } from "@/domain/contract";
import { GRADUATE_MONTHLY_SALARY, monthlyEmployerCost } from "@/domain/cost";
import { runOperation, type EngineInput } from "@/domain/engine";
import { roundTo } from "@/domain/money";
import { ruleCardSchema } from "@/domain/rule-card";
import type { PersonRecord } from "@/domain/schemas";
import {
  CONSULTANT_LINE,
  numbersNotGrounded,
  rehearsedAnswers,
  SUGGESTED_QUESTIONS,
} from "@/domain/rehearsed";
import {
  SALARY_NOTE,
  sameResult,
  simulate,
  type Lever,
  type SimulationResult,
} from "@/domain/simulate";
import { formatEti, formatEuro, formatPercent, formatPp } from "@/domain/format";
import { section4 } from "@/tests/expected/company-a-section4";
import { section5 } from "@/tests/expected/company-a-section5";
import savedCard from "../data/rule-cards/MPR-2024-3.json";

function companyAInput(people = companyAPeople()): EngineInput {
  return {
    asOf: AS_OF,
    contract: companyAContract,
    rule: ruleCardSchema.parse(savedCard),
    people,
    conventionalHours: 40,
    staffFile: "mapa pessoal 2026.xlsx",
    quarters: companyAQuarters,
  };
}

function ratio(
  result: SimulationResult,
  code: SimulationResult["after"]["indicators"][number]["code"],
): number {
  const found = result.after.indicators.find((indicator) => indicator.code === code);
  if (!found) throw new Error(code);
  return roundTo(found.ratioPct, 2);
}

function hire(count: number, qualified: boolean, startOn: string, monthlySalary: number): Lever {
  return { kind: "hire", count, qualified, startOn, monthlySalary };
}

const input = companyAInput();
const november = hire(1, true, "2026-11-01", GRADUATE_MONTHLY_SALARY);
const twoGraduates = hire(2, true, "2026-11-01", GRADUATE_MONTHLY_SALARY);

describe("employer cost", () => {
  it("rounds one half cent up on the total, not on each month", () => {
    expect(monthlyEmployerCost(GRADUATE_MONTHLY_SALARY)).toBe(section4.monthlyGraduateEuro);
    expect(
      simulate(input, [hire(1, true, "2026-10-01", GRADUATE_MONTHLY_SALARY)]).costToYearEnd,
    ).toBe(section4.D.costToYearEnd);
  });
});

describe("company A simulations", () => {
  it("matches section 4 cases A to E", () => {
    const cases = [
      { lever: november, expected: section4.A },
      { lever: hire(1, false, "2026-11-01", 1_000), expected: section4.B },
      { lever: twoGraduates, expected: section4.C },
      { lever: hire(1, true, "2026-10-01", GRADUATE_MONTHLY_SALARY), expected: section4.D },
    ] as const;

    for (const item of cases) {
      const result = simulate(input, [item.lever]);
      expect(ratio(result, "RPR003")).toBe(item.expected.jobs);
      expect(ratio(result, "RSR23")).toBe(item.expected.qualified);
      expect(ratio(result, "RPR002")).toBe(item.expected.valueAdded);
      expect(roundTo(result.after.roPct, 2)).toBe(item.expected.roPct);
      expect(roundTo(result.after.cutEuro, 2)).toBe(item.expected.cutEuro);
      expect(result.costToYearEnd).toBe(item.expected.costToYearEnd);
      expect(result.annualCost).toBe(item.expected.annualCost);
    }

    const sales = simulate(input, [{ kind: "extra_sales", euro: section5.salesEuro }]);
    expect(ratio(sales, "RPR003")).toBe(section4.E.jobs);
    expect(ratio(sales, "RSR23")).toBe(section4.E.qualified);
    expect(ratio(sales, "RPR002")).toBe(section4.E.valueAdded);
    expect(ratio(sales, "RPR001")).toBe(section4.E.turnover);
    expect(roundTo(sales.after.roPct, 2)).toBe(section4.E.roPct);
    expect(roundTo(sales.after.cutEuro, 2)).toBe(section4.E.cutEuro);
    expect(sales.costToYearEnd).toBeNull();
    expect(roundTo(sales.effortPct ?? 0, 2)).toBe(section4.E.effortPct);
  });

  it("treats case C plus zero sales as case C", () => {
    const alone = simulate(input, [twoGraduates]);
    const combined = simulate(input, [twoGraduates, { kind: "extra_sales", euro: 0 }]);
    expect(sameResult(alone, combined)).toBe(true);
  });

  it("matches case F when the November graduate is already on the map", () => {
    const person: PersonRecord = {
      name: "November graduate",
      nif: null,
      niss: null,
      weeklyHours: 40,
      startedOn: "2026-11-01",
      endedOn: null,
      habilitationCode: "6",
      source: { file: "mapa pessoal 2026 atualizado.xlsx", location: "row" },
    };
    const updated = runOperation(companyAInput([...companyAPeople(), person]));
    const simulated = simulate(input, [november]);
    expect(
      roundTo(updated.indicators.find((item) => item.code === "RPR003")?.ratioPct ?? 0, 2),
    ).toBe(section4.F.jobs);
    expect(
      roundTo(updated.indicators.find((item) => item.code === "RSR23")?.ratioPct ?? 0, 2),
    ).toBe(section4.F.qualified);
    expect(
      roundTo(updated.indicators.find((item) => item.code === "RPR002")?.ratioPct ?? 0, 2),
    ).toBe(section4.F.valueAdded);
    expect(roundTo(updated.roPct, 2)).toBe(section4.F.roPct);
    expect(roundTo(updated.cutEuro, 2)).toBe(section4.F.cutEuro);
    expect(roundTo(updated.roPct, 2)).toBe(roundTo(simulated.after.roPct, 2));
  });

  it("keeps the salary out of the result and names indicators outside the two best", () => {
    const cheap = simulate(input, [november]);
    const expensive = simulate(input, [hire(1, true, "2026-11-01", 2_200)]);
    expect(roundTo(cheap.after.roPct, 2)).toBe(roundTo(expensive.after.roPct, 2));
    expect(cheap.costToYearEnd).not.toBe(expensive.costToYearEnd);
    expect(cheap.notes).toContain(SALARY_NOTE);
    expect(cheap.notes).toContain(
      "Jobs created is not one of the two best, so it does not move the result.",
    );

    const unqualified = simulate(input, [hire(1, false, "2026-11-01", 1_000)]);
    expect(unqualified.notes).toContain(
      "Qualified jobs is not one of the two best, so it does not move the result.",
    );
  });

  it("uses only the books closed by the reference date", () => {
    const first = runOperation(input, section4.quarters.q1.asOf);
    const second = runOperation(input, section4.quarters.q2.asOf);
    expect(roundTo(first.roPct, 2)).toBe(section4.quarters.q1.roPct);
    expect(roundTo(first.cutEuro, 2)).toBe(section4.quarters.q1.cutEuro);
    expect(first.quarters).toHaveLength(1);
    expect(roundTo(second.roPct, 2)).toBe(section4.quarters.q2.roPct);
    expect(roundTo(second.cutEuro, 2)).toBe(section4.quarters.q2.cutEuro);
    expect(second.penaltyPp).toBe(0);
    expect(second.quarters).toHaveLength(2);
  });
});

describe("rehearsed answers", () => {
  const answers = rehearsedAnswers(input);

  it("asks exactly the three questions from section 5", () => {
    expect(SUGGESTED_QUESTIONS).toEqual(section5.questions);
    expect(answers.map((item) => item.question)).toEqual(section5.questions);
  });

  it("uses only numbers the engine produced, and cites the sheet sources", () => {
    const loss = section5.loss;
    expect(answers[0]?.answer).toContain(formatPercent(loss.roPct));
    expect(answers[0]?.answer).toContain(formatPercent(loss.turnover));
    expect(answers[0]?.answer).toContain(formatPercent(loss.valueAdded));
    expect(answers[0]?.answer).toContain(formatPp(loss.gapPp));
    expect(answers[0]?.answer).toContain(formatPercent(loss.thresholdPct));
    expect(answers[0]?.answer).toContain(formatPp(loss.penaltyPp));
    expect(answers[0]?.answer).toContain(formatEuro(loss.cutEuro));

    const one = section5.oneGraduate;
    expect(answers[1]?.answer).toContain(formatPercent(one.roPct));
    expect(answers[1]?.answer).toContain(formatEuro(one.cutEuro));
    expect(answers[1]?.answer).toContain(formatEuro(one.savedEuro));
    expect(answers[1]?.answer).toContain(formatEuro(one.costToYearEnd));
    const two = section5.twoGraduates;
    expect(answers[1]?.answer).toContain(formatPercent(two.roPct));
    expect(answers[1]?.answer).toContain(formatEuro(two.costToYearEnd));
    expect(answers[1]?.answer).toContain(formatEuro(two.annualEach));
    expect(answers[1]?.answer).toContain(formatEuro(section5.salesEuro));
    expect(answers[1]?.answer).toContain("3 years");
    expect(answers[1]?.answer).toContain("linked to the supported project");
    expect(answers[1]?.answer.endsWith(CONSULTANT_LINE)).toBe(true);

    const added = section5.valueAdded;
    expect(answers[2]?.answer).toContain(formatPercent(added.growthPct));
    expect(answers[2]?.answer).toContain(formatEuro(added.preEuro));
    expect(answers[2]?.answer).toContain(formatEuro(added.projectedEuro));
    expect(answers[2]?.answer).toContain(formatEti(added.preEti, 2));
    expect(answers[2]?.answer).toContain(formatEti(added.eti, 2));
    expect(answers[2]?.answer).toContain(formatPercent(added.preMarginPct));
    expect(answers[2]?.answer).toContain(formatPercent(added.marginPct));
    expect(answers[2]?.answer).toContain(formatPercent(added.perWorkerGrowthPct));
    expect(answers[2]?.answer).toContain(formatPercent(added.targetPct));
    expect(answers[2]?.answer).toContain(formatPercent(added.ratioPct));

    answers.forEach((item, index) => {
      expect(item.sources).toEqual(section5.sources[index]);
      expect(numbersNotGrounded(item.answer, item.grounded)).toEqual([]);
      expect(item.answer.includes(CONSULTANT_LINE)).toBe(item.suggestsAction);
    });
  });

  it("does not treat the month inside a date as an engine figure", () => {
    expect(numbersNotGrounded("Hire 11 people.", "start 2026-11-01")).toEqual(["11"]);
    expect(numbersNotGrounded("Result 64.50%.", "64.50% and 2026-11-01")).toEqual([]);
  });
});
