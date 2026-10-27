import { valueAdded } from "@/domain/accounts";
import type { CompanyContract } from "@/domain/contract";
import { countQualified } from "@/domain/eti";
import { formatEuro } from "@/domain/format";
import type { AccountRow } from "@/domain/schemas";
import { nameOnMap, type CertificateReading } from "@/ingest/readers/certificate";
import type { IesStatement } from "@/ingest/readers/ies";
import type { SocialSecurityReturn } from "@/ingest/readers/social-security";
import type { StaffMap } from "@/ingest/readers/staff-map";
import type { ProjectReading } from "@/ingest/project";

export type ExtractedFact = {
  label: string;
  value: string;
  source: string;
};

export type RequirementCheck = {
  label: string;
  ok: boolean;
};

export type DocumentCheckCard = {
  filename: string;
  title: string;
  extracted: ExtractedFact[];
  checks: RequirementCheck[];
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

function money(value: number): string {
  return formatEuro(value);
}

function balanceCard(
  filename: string,
  periodEnd: string | null,
  rows: AccountRow[],
): DocumentCheckCard {
  const figured = valueAdded(rows);
  const period = periodEnd ?? "Unknown period";
  return {
    filename,
    title: "Trial balance",
    extracted: [
      { label: "Period", value: period, source: `${filename}, period` },
      { label: "Turnover", value: money(figured.turnover), source: `${filename}, accounts 71 and 72` },
      { label: "Value added", value: money(figured.total), source: `${filename}, accounts 71–74 minus 61 and 62` },
    ],
    checks: [
      {
        label: figured.balanced ? "Debit equals credit" : "Debit does not equal credit",
        ok: figured.balanced,
      },
    ],
  };
}

function certificateCard(certificate: CertificateReading, staffNames: string[]): DocumentCheckCard {
  const onMap = nameOnMap(certificate.holder, staffNames);
  const qualified = certificate.level !== null && certificate.level >= 6 && !certificate.foreignDegree;
  const checks: RequirementCheck[] = [
    { label: onMap ? "Name matches the staff map" : "Name is not on the staff map", ok: onMap },
    {
      label: qualified ? "Counts as qualified (level 6 or higher)" : "Does not count as qualified",
      ok: qualified,
    },
  ];
  if (certificate.foreignDegree) checks.push({ label: "Needs consultant review", ok: false });
  return {
    filename: certificate.filename,
    title: "Certificate",
    extracted: [
      { label: "Holder", value: certificate.holder ?? "Name not found", source: certificate.filename },
      {
        label: "QNQ level",
        value: certificate.level === null ? "Not found" : String(certificate.level),
        source: `${certificate.filename}, Quadro Nacional de Qualificações`,
      },
    ],
    checks,
  };
}

function payrollCard(
  payroll: SocialSecurityReturn & { filename: string },
  staff: StaffMap | null,
): DocumentCheckCard {
  const names = staff?.people.map((person) => person.name) ?? [];
  const matched = payroll.people.filter((person) => nameOnMap(person.name, names)).length;
  const same = names.length > 0 && matched === payroll.people.length;
  const month = MONTHS[payroll.month - 1] ?? String(payroll.month);
  return {
    filename: payroll.filename,
    title: "Social security return",
    extracted: [
      { label: "Month", value: `${month} ${payroll.year}`, source: payroll.filename },
      { label: "People", value: `${payroll.people.length} people`, source: payroll.filename },
    ],
    checks: [
      {
        label: same
          ? "People match the staff map"
          : `${matched} of ${payroll.people.length} people are on the staff map`,
        ok: same,
      },
    ],
  };
}

function iesCard(statement: IesStatement & { filename: string }): DocumentCheckCard {
  const figured = valueAdded(iesRows(statement.amounts, statement.filename));
  return {
    filename: statement.filename,
    title: "Annual statement",
    extracted: [
      { label: "Year", value: String(statement.year), source: statement.filename },
      { label: "Turnover", value: money(figured.turnover), source: `${statement.filename}, A5001` },
      { label: "Value added", value: money(figured.total), source: `${statement.filename}, A5001 to A5007` },
      { label: "Hours", value: statement.hours.toLocaleString("en-GB"), source: `${statement.filename}, hours worked` },
    ],
    checks: [{ label: statement.gaps.length === 0 ? "Statement lines are present" : "Statement lines are missing", ok: statement.gaps.length === 0 }],
  };
}

/** One card per analysed file. Figures come from the readers, not from the model. */
export function buildDocumentChecks(reading: ProjectReading, contract: CompanyContract): DocumentCheckCard[] {
  const staffNames = reading.staff?.people.map((person) => person.name) ?? [];
  const cards: DocumentCheckCard[] = [];

  for (const file of reading.files) {
    if (file.kind === "call") {
      cards.push({
        filename: file.filename,
        title: "Public call",
        extracted: [{ label: "Notice", value: contract.callCode, source: file.filename }],
        checks: [{ label: "Public document, left unmasked", ok: true }],
      });
    }
    if (file.kind === "acceptance_term") {
      cards.push({
        filename: file.filename,
        title: "Acceptance term",
        extracted: [
          { label: "Jobs", value: `${contract.jobsTargetEti} FTE`, source: `${file.filename}, contracted targets` },
          { label: "Qualified jobs", value: `${contract.qualifiedTargetEti} FTE`, source: `${file.filename}, contracted targets` },
          { label: "Turnover growth", value: `${contract.turnoverTargetGrowthPct}%`, source: `${file.filename}, contracted targets` },
          { label: "Value added growth", value: `${contract.valueAddedTargetGrowthPct}%`, source: `${file.filename}, contracted targets` },
        ],
        checks: [{ label: "Targets confirmed by the consultant", ok: true }],
      });
    }
    if (file.kind === "irrelevant") {
      cards.push({
        filename: file.filename,
        title: "Set aside",
        extracted: [],
        checks: [{ label: file.detail ?? "This file does not change the targets.", ok: true }],
      });
    }
    if (file.kind === "unreadable") {
      cards.push({
        filename: file.filename,
        title: "Could not read",
        extracted: [],
        checks: [{ label: file.detail ?? "This file could not be read.", ok: false }],
      });
    }
  }

  for (const balance of reading.balances) {
    cards.push(balanceCard(balance.filename, balance.periodEnd, balance.rows));
  }

  if (reading.staff) {
    const file = reading.files.find((item) => item.kind === "staff_map");
    cards.push({
      filename: file?.filename ?? "Staff map",
      title: "Staff map",
      extracted: [
        { label: "People", value: `${reading.staff.people.length} people`, source: file?.filename ?? "Staff map" },
        {
          label: "Qualified",
          value: `${countQualified(reading.staff.people)} people`,
          source: `${file?.filename ?? "Staff map"}, habilitation`,
        },
      ],
      checks: [{ label: reading.staff.unreadRows === 0 ? "Every row was read" : "Some rows were not read", ok: reading.staff.unreadRows === 0 }],
    });
  }

  if (reading.singleReport) {
    const file = reading.files.find((item) => item.kind === "single_report");
    cards.push({
      filename: file?.filename ?? "Single report",
      title: "Single report",
      extracted: [
        { label: "Year", value: String(reading.singleReport.year), source: file?.filename ?? "Single report" },
        { label: "People", value: `${reading.singleReport.people.length} people`, source: file?.filename ?? "Single report" },
      ],
      checks: [{ label: "Habilitation comes from column 11, not column 17", ok: true }],
    });
  }

  for (const statement of reading.ies) {
    cards.push(iesCard(statement));
  }

  for (const payroll of reading.socialSecurity) {
    cards.push(payrollCard(payroll, reading.staff));
  }

  for (const certificate of reading.certificates) {
    cards.push(certificateCard(certificate, staffNames));
  }

  return cards;
}
