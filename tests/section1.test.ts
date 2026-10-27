import { describe, expect, it } from "vitest";

import { netOf, valueAdded } from "@/domain/accounts";
import { annualEti, averageEti, countQualified, etiFromHours } from "@/domain/eti";
import { roundTo } from "@/domain/money";
import type { AccountRow } from "@/domain/schemas";
import { readProject } from "@/ingest/project";
import { companyAInputs } from "@/tests/demo-files";
import { section1 } from "@/tests/expected/company-a-section1";

function money(value: number): number {
  return roundTo(value, 2);
}

function iesRows(amounts: Record<string, number>, file: string): AccountRow[] {
  const source = { file, location: "IES" };
  return [
    { code: "71", description: "A5001", debit: 0, credit: amounts.A5001 ?? 0, source },
    { code: "73", description: "A5004", debit: 0, credit: amounts.A5004 ?? 0, source },
    { code: "74", description: "A5005", debit: 0, credit: amounts.A5005 ?? 0, source },
    { code: "61", description: "A5006", debit: amounts.A5006 ?? 0, credit: 0, source },
    { code: "62", description: "A5007", debit: amounts.A5007 ?? 0, credit: 0, source },
  ];
}

describe("company A section 1", () => {
  it("reads the balances, the staff map, the 2023 report and the 2023 statement", async () => {
    const reading = await readProject(companyAInputs());
    const byEnd = (end: string) => {
      const balance = reading.balances.find((item) => item.periodEnd === end);
      if (!balance) throw new Error(`No balance ending ${end}`);
      return valueAdded(balance.rows);
    };
    const t1 = byEnd("2026-03-31");
    const t2 = byEnd("2026-06-30");
    const t3balance = reading.balances.find((item) => item.periodEnd === "2026-09-30");
    if (!t3balance) throw new Error("No Q3 balance");
    const t3 = valueAdded(t3balance.rows);
    const staff = reading.staff;
    const report = reading.singleReport;
    const ies = reading.ies.find((item) => item.year === 2023);
    const payroll = reading.socialSecurity.find((item) => item.year === 2026 && item.month === 9);
    if (!staff || !report || !ies || !payroll) throw new Error("A required document was not read");

    const iesValue = valueAdded(iesRows(ies.amounts, "IES 2023.pdf"));
    const checks = [
      ["T1 turnover", t1.turnover, section1.t1.turnover],
      ["T1 value added", t1.total, section1.t1.valueAdded],
      ["T1 debit", t1.debit, section1.t1.debit],
      ["T1 credit", t1.credit, section1.t1.debit],
      ["T2 turnover", t2.turnover, section1.t2.turnover],
      ["T2 value added", t2.total, section1.t2.valueAdded],
      ["T2 debit", t2.debit, section1.t2.debit],
      ["T2 credit", t2.credit, section1.t2.debit],
      ["T3 turnover", t3.turnover, section1.t3.turnover],
      ["T3 value added", t3.total, section1.t3.valueAdded],
      ["T3 debit", t3.debit, section1.t3.debit],
      ["T3 credit", t3.credit, section1.t3.debit],
      ["T3 71", t3.parts["71"], section1.t3.parts["71"]],
      ["T3 72", t3.parts["72"], section1.t3.parts["72"]],
      ["T3 73", t3.parts["73"], section1.t3.parts["73"]],
      ["T3 74", t3.parts["74"], section1.t3.parts["74"]],
      ["T3 61", t3.parts["61"], section1.t3.parts["61"]],
      ["T3 62", t3.parts["62"], section1.t3.parts["62"]],
      ["T3 75 excluded", netOf(t3balance.rows, "75"), section1.t3.excluded["75"]],
      ["T3 78 excluded", netOf(t3balance.rows, "78"), section1.t3.excluded["78"]],
      ["T3 6812 excluded", Math.abs(netOf(t3balance.rows, "6812")), section1.t3.excluded["6812"]],
      ["T1 ETI", averageEti(staff.people, "2026-01-01", "2026-03-31", staff.conventionalHours), section1.t1.eti],
      ["T2 ETI", averageEti(staff.people, "2026-01-01", "2026-06-30", staff.conventionalHours), section1.t2.eti],
      ["T3 ETI", averageEti(staff.people, "2026-01-01", "2026-09-30", staff.conventionalHours), section1.t3.eti],
      ["RU people", report.people.length, section1.ru2023.people],
      ["RU ETI", annualEti(report.people, 2023), section1.ru2023.eti],
      ["RU qualified", countQualified(report.people), section1.ru2023.qualified],
      ["IES turnover", iesValue.turnover, section1.ies2023.turnover],
      ["IES value added", iesValue.total, section1.ies2023.valueAdded],
      ["IES hours", ies.hours, section1.ies2023.hours],
      ["IES ETI", etiFromHours(ies.hours), section1.ies2023.eti],
      ["September payroll", payroll.people.length, section1.septemberPayroll.people],
    ] as const;

    const failed = checks.filter(([, actual, expected]) => money(actual) !== money(expected));
    expect(failed.map(([name, actual, expected]) => `${name}: ${actual} vs ${expected}`)).toEqual([]);
  }, 60_000);
});
