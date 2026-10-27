import { AS_OF } from "@/domain/clock";
import { companyAContract, type CompanyContract } from "@/domain/contract";
import { runOperation, type EngineInput, type OperationResult } from "@/domain/engine";
import { ruleCardSchema, type RuleCard } from "@/domain/rule-card";
import type { PersonRecord } from "@/domain/schemas";
import { valueAdded } from "@/domain/accounts";
import type { ProjectReading } from "@/ingest/project";
import savedCard from "../data/rule-cards/MPR-2024-3.json";

const rule = ruleCardSchema.parse(savedCard);

function person(name: string, weeklyHours: number, startedOn: string, endedOn: string | null, habilitationCode: string | null): PersonRecord {
  return {
    name,
    nif: null,
    niss: null,
    weeklyHours,
    startedOn,
    endedOn,
    habilitationCode,
    source: { file: "mapa pessoal 2026.xlsx", location: "row" },
  };
}

/** 21 people all year, one at 20h, one exit on 31 Mar, one entry on 1 Jul, one graduate on 1 Aug. */
export function companyAPeople(): PersonRecord[] {
  const people: PersonRecord[] = [];
  for (let index = 0; index < 18; index += 1) {
    people.push(person(`Worker ${index}`, 40, "2020-01-01", null, null));
  }
  for (let index = 0; index < 3; index += 1) {
    people.push(person(`Graduate ${index}`, 40, "2020-01-01", null, "6"));
  }
  people.push(person("Part time", 20, "2020-01-01", null, null));
  people.push(person("Left in March", 40, "2020-01-01", "2026-03-31", null));
  people.push(person("Joined in July", 40, "2026-07-01", null, null));
  people.push(person("Joined in August", 40, "2026-08-01", null, "6"));
  return people;
}

export const companyAQuarters: EngineInput["quarters"] = [
  {
    quarter: 1,
    months: 3,
    asOf: "2026-03-31",
    turnoverYtd: 725_000,
    valueAddedYtd: 187_205,
    file: "Balancete 1T 2026.pdf",
  },
  {
    quarter: 2,
    months: 6,
    asOf: "2026-06-30",
    turnoverYtd: 1_495_000,
    valueAddedYtd: 381_777,
    file: "balancete junho.xlsx",
  },
  {
    quarter: 3,
    months: 9,
    asOf: "2026-09-30",
    turnoverYtd: 2_268_000,
    valueAddedYtd: 577_227.22,
    file: "Balancete_Set2026.csv",
  },
];

export function companyAOperation(people = companyAPeople()): OperationResult {
  return runOperation({
    asOf: AS_OF,
    contract: companyAContract,
    rule,
    people,
    conventionalHours: 40,
    staffFile: "mapa pessoal 2026.xlsx",
    quarters: companyAQuarters,
  });
}

function quarterOf(periodEnd: string): 1 | 2 | 3 | null {
  const month = Number(periodEnd.slice(5, 7));
  if (month === 3) return 1;
  if (month === 6) return 2;
  if (month === 9) return 3;
  return null;
}

/** Uses the checked term only when that PDF was actually dropped in the folder. */
export function inputFromReading(
  reading: ProjectReading,
  card: RuleCard = rule,
  contract: CompanyContract = companyAContract,
): EngineInput | null {
  const term = reading.files.some((file) => file.kind === "acceptance_term");
  const call = reading.files.some((file) => file.kind === "call");
  if (!term || !call || !reading.staff || reading.staff.unreadRows > 0) return null;

  const quarters: EngineInput["quarters"] = [];
  for (const balance of reading.balances) {
    if (!balance.periodEnd) continue;
    const quarter = quarterOf(balance.periodEnd);
    if (!quarter) continue;
    const figured = valueAdded(balance.rows);
    if (!figured.balanced) continue;
    quarters.push({
      quarter,
      months: Number(balance.periodEnd.slice(5, 7)),
      asOf: balance.periodEnd,
      turnoverYtd: figured.turnover,
      valueAddedYtd: figured.total,
      file: balance.filename,
    });
  }
  if (!quarters.some((quarter) => quarter.quarter === 3)) return null;

  return {
    asOf: AS_OF,
    contract,
    rule: card,
    people: reading.staff.people,
    conventionalHours: reading.staff.conventionalHours,
    staffFile: reading.staff.people[0]?.source.file ?? "staff map",
    quarters,
  };
}

export function operationFromReading(reading: ProjectReading, card: RuleCard = rule): OperationResult | null {
  const input = inputFromReading(reading, card);
  return input ? runOperation(input) : null;
}
