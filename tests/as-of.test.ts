import { describe, expect, it } from "vitest";

import { companyAPeople, companyAQuarters } from "@/app/operation";
import { AS_OF_VIEWS, asOfView, knownThen, pathLevers } from "@/domain/as-of";
import { AS_OF } from "@/domain/clock";
import { companyAContract } from "@/domain/contract";
import { effectCopy } from "@/domain/effect";
import { runOperation, type EngineInput } from "@/domain/engine";
import { roundTo } from "@/domain/money";
import { ruleCardSchema } from "@/domain/rule-card";
import { simulate } from "@/domain/simulate";
import { section3 } from "@/tests/expected/company-a-section3";
import savedCard from "../data/rule-cards/MPR-2024-3.json";

function companyAInput(): EngineInput {
  return {
    asOf: AS_OF,
    contract: companyAContract,
    rule: ruleCardSchema.parse(savedCard),
    people: companyAPeople(),
    conventionalHours: 40,
    staffFile: "mapa pessoal 2026.xlsx",
    quarters: companyAQuarters,
  };
}

describe("as of", () => {
  const input = companyAInput();

  it("says what March already showed", () => {
    expect(knownThen(input, asOfView("Q1"))).toBe(
      "In March you would have known: 2 hires from 1 April would have cleared the threshold.",
    );
  });

  it("says June was already clear", () => {
    expect(knownThen(input, asOfView("Q2"))).toContain("already clear");
  });

  it("prices the paths from the engine", () => {
    const paths = pathLevers(input, AS_OF);
    expect(paths[0]?.levers).toEqual([
      { kind: "hire", count: 2, qualified: true, startOn: "2026-11-01", monthlySalary: 1500 },
    ]);
    expect(paths[1]?.levers).toEqual([
      { kind: "hire", count: 1, qualified: true, startOn: "2026-11-01", monthlySalary: 1500 },
      { kind: "extra_sales", euro: expect.any(Number) },
    ]);
    expect(paths[2]?.levers).toEqual([{ kind: "extra_sales", euro: section3.sales.euro }]);
  });

  it("offers one graduate plus sales, needing less selling than sales alone", () => {
    const mixed = runOperation(input, AS_OF).paths.find((path) => path.kind === "mixed");
    expect(mixed?.plan.hires).toBe(1);
    expect(mixed?.plan.extraSales).toBeGreaterThan(0);
    expect(mixed?.plan.extraSales).toBeLessThan(section3.sales.euro);
    expect(mixed?.cutEuro).toBe(0);
  });

  it("each path, applied in the simulator, gives what the engine says", () => {
    for (const view of AS_OF_VIEWS) {
      const operation = runOperation(input, view.referenceDate);
      const priced = pathLevers(input, view.referenceDate);
      operation.paths.forEach((path, index) => {
        const after = simulate(input, priced[index]?.levers ?? [], view.referenceDate).after;
        expect(roundTo(after.roPct, 2)).toBe(roundTo(path.roPct, 2));
        expect(roundTo(after.cutEuro, 2)).toBe(roundTo(path.cutEuro, 2));
        expect(after.cutEuro).toBe(0);
      });
    }
  });
});

describe("effect copy", () => {
  const input = companyAInput();

  it("follows the active levers", () => {
    const two = simulate(input, [
      { kind: "hire", count: 2, qualified: true, startOn: "2026-11-01", monthlySalary: 1500 },
    ]);
    const sales = simulate(input, [{ kind: "extra_sales", euro: section3.sales.euro }]);
    expect(
      effectCopy(two, [
        { kind: "hire", count: 2, qualified: true, startOn: "2026-11-01", monthlySalary: 1500 },
      ]),
    ).toContain("70.75%");
    expect(effectCopy(sales, [{ kind: "extra_sales", euro: 67_000 }])).toContain("No staff cost");
    expect(effectCopy(sales, [{ kind: "extra_sales", euro: 67_000 }])).not.toContain("graduate");
  });

  it("names graduates and non-graduates hired together", () => {
    const crew = [
      {
        kind: "hire" as const,
        count: 1,
        qualified: true,
        startOn: "2026-11-01",
        monthlySalary: 1500,
      },
      {
        kind: "hire" as const,
        count: 1,
        qualified: false,
        startOn: "2026-11-01",
        monthlySalary: 1000,
      },
    ];
    expect(effectCopy(simulate(input, crew), crew)).toMatch(
      /^1 graduate and 1 non-graduate from 1 November: result/,
    );
  });
});
