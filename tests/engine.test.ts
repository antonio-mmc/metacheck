import { describe, expect, it } from "vitest";

import { operationFromReading, companyAOperation } from "@/app/operation";
import { indicatorState } from "@/domain/panel";
import { formatEti } from "@/domain/format";
import { roundTo } from "@/domain/money";
import { readProject } from "@/ingest/project";
import { companyAInputs } from "@/tests/demo-files";
import { section2 } from "@/tests/expected/company-a-section2";
import { section3 } from "@/tests/expected/company-a-section3";
import type { OperationResult, TrackedCode } from "@/domain/engine";

function indicator(result: OperationResult, code: TrackedCode) {
  const found = result.indicators.find((item) => item.code === code);
  if (!found) throw new Error(code);
  return found;
}

function expectSheet(result: OperationResult) {
  expect(roundTo(indicator(result, "RPR003").ratioPct, 2)).toBe(section2.jobs.ratioPct);
  expect(roundTo(indicator(result, "RPR003").assessed, 2)).toBe(section2.jobs.assessedEti);
  expect(roundTo(indicator(result, "RPR003").projected, 2)).toBe(section2.jobs.projectedEti);
  expect(indicatorState(indicator(result, "RPR003").ratioPct)).toBe("off_track");

  expect(roundTo(indicator(result, "RSR23").ratioPct, 2)).toBe(section2.qualified.ratioPct);
  expect(roundTo(indicator(result, "RSR23").assessed, 2)).toBe(section2.qualified.assessedEti);
  expect(roundTo(indicator(result, "RSR23").projected, 2)).toBe(section2.qualified.projectedEti);
  expect(indicatorState(indicator(result, "RSR23").ratioPct)).toBe("off_track");

  expect(roundTo(indicator(result, "RPR001").ratioPct, 2)).toBe(section2.turnover.ratioPct);
  expect(roundTo(indicator(result, "RPR001").assessed, 2)).toBe(section2.turnover.growthPct);
  expect(roundTo(indicator(result, "RPR001").projected, 2)).toBe(section2.turnover.projectedEuro);
  expect(indicatorState(indicator(result, "RPR001").ratioPct)).toBe("on_track");

  expect(roundTo(indicator(result, "RPR002").ratioPct, 2)).toBe(section2.valueAddedPerWorker.ratioPct);
  expect(roundTo(indicator(result, "RPR002").assessed, 2)).toBe(section2.valueAddedPerWorker.growthPct);
  expect(roundTo(indicator(result, "RPR002").projected, 2)).toBe(section2.valueAddedPerWorker.euro);
  expect(indicatorState(indicator(result, "RPR002").ratioPct)).toBe("off_track");

  expect(roundTo(result.roPct, 2)).toBe(section3.roPct);
  expect(result.penaltyPp).toBe(section3.penaltyPp);
  expect(roundTo(result.cutEuro, 2)).toBe(section3.cutEuro);
  expect(roundTo(result.incentiveBefore, 2)).toBe(section3.incentiveBefore);
  expect(roundTo(result.incentiveAfter, 2)).toBe(section3.incentiveAfter);
  expect(result.bestCodes).toEqual([...section3.bestCodes]);
  expect(result.penaltyNote).toBe(section3.penaltyNote);
  expect(result.cutLines).toContain(section3.penaltyNote);
  expect(result.deadlineSentence).toBe(section3.deadline);
  expect(result.deadlineHeadline).toBe(section3.deadlineHeadline);
  expect(result.headcountToday).toBe(section2.headcountToday);
  expect(formatEti(result.averageEti, 2)).toBe(section2.jobs.projectedEti.toFixed(2));
  expect(formatEti(result.averageEti, 3)).toBe(section2.etiExact);
  expect(result.etiLines.join(" ")).toContain(section2.etiExact);
  expect(result.promisedEti).toBe(section2.promisedEti);

  expect(result.quarters.map((quarter) => quarter.label)).toEqual(["Q1", "Q2", "Q3"]);
  result.quarters.forEach((quarter, index) => {
    const expected = section3.quarters[index];
    if (!expected) throw new Error("quarter");
    expect(roundTo(quarter.roPct, 2)).toBe(expected.roPct);
    expect(quarter.penaltyPp).toBe(expected.penaltyPp);
    expect(roundTo(quarter.cutEuro, 2)).toBe(expected.cutEuro);
  });
  expect(roundTo(result.yearEndRoPct, 2)).toBe(section3.roPct);

  const hire = result.paths.find((path) => path.kind === "hire");
  const sales = result.paths.find((path) => path.kind === "sales");
  expect(roundTo(hire?.roPct ?? 0, 2)).toBe(section3.graduates.roPct);
  expect(roundTo(hire?.cutEuro ?? -1, 2)).toBe(section3.graduates.cutEuro);
  expect(roundTo(hire?.costToYearEnd ?? 0, 2)).toBe(section3.graduates.costToYearEnd);
  expect(roundTo(sales?.roPct ?? 0, 2)).toBe(section3.sales.roPct);
  expect(sales?.title).toContain("67,000.00");
  expect(result.amberTitle).toBe("Cut expected, still fixable");
}

describe("company A engine", () => {
  it("matches sections 2 and 3 from the answer sheet", () => {
    expectSheet(companyAOperation());
  });

  it("matches the same sheet when the figures come from the company files", async () => {
    const reading = await readProject(companyAInputs());
    const result = operationFromReading(reading);
    expect(result).not.toBeNull();
    if (!result) return;
    expectSheet(result);
  }, 90_000);
});
