import type { PersonRecord } from "@/domain/schemas";
import type { CertificateReading } from "@/ingest/readers/certificate";
import type { SingleReport } from "@/ingest/readers/single-report";
import type { SocialSecurityReturn } from "@/ingest/readers/social-security";
import type { StaffMap } from "@/ingest/readers/staff-map";

const FULL_TIME_HOURS = 40;

function fold(name: string): string {
  return name.normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, " ").trim().toLowerCase();
}

function lastDay(year: number, month: number): string {
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

/**
 * Staff without a staff map: months in service from the monthly payroll returns,
 * hours and habilitation from the pre-project single report (matched by NISS).
 * Anyone not in the report works 40 h; a certificate gives their QNQ level,
 * and a foreign degree counts only after a consultant confirms it.
 * Whoever is in the latest return stays until 31 Dec.
 */
export function staffFromPayroll(
  report: SingleReport,
  returns: (SocialSecurityReturn & { filename: string })[],
  certificates: CertificateReading[],
  year: number,
): StaffMap | null {
  const months = returns.filter((item) => item.year === year).sort((a, b) => a.month - b.month);
  const latest = months.at(-1);
  if (!latest) return null;

  const fromReport = new Map(report.people.filter((person) => person.niss).map((person) => [person.niss!, person]));
  const levels = new Map(
    certificates
      .filter((certificate) => certificate.holder && certificate.level !== null && !certificate.foreignDegree)
      .map((certificate) => [fold(certificate.holder!), certificate]),
  );

  const seen = new Map<string, { name: string; first: number; last: number }>();
  for (const item of months) {
    for (const person of item.people) {
      const known = seen.get(person.niss);
      if (known) known.last = item.month;
      else seen.set(person.niss, { name: person.name, first: item.month, last: item.month });
    }
  }

  const people: PersonRecord[] = [];
  for (const [niss, presence] of seen) {
    const listed = fromReport.get(niss);
    const certificate = levels.get(fold(presence.name));
    const startedOn =
      presence.first === 1 && listed ? listed.startedOn : `${year}-${String(presence.first).padStart(2, "0")}-01`;
    people.push({
      name: listed?.name ?? presence.name,
      nif: listed?.nif ?? null,
      niss,
      weeklyHours: listed?.weeklyHours ?? FULL_TIME_HOURS,
      startedOn,
      endedOn: presence.last === latest.month ? null : lastDay(year, presence.last),
      habilitationCode: listed?.habilitationCode ?? (certificate ? String(certificate.level) : null),
      source: {
        file: listed ? `${months[0]!.filename} + Relatório Único ${report.year}` : (certificate?.filename ?? months[0]!.filename),
        location: `payroll ${year}-${String(presence.first).padStart(2, "0")} to ${year}-${String(presence.last).padStart(2, "0")}`,
      },
    });
  }

  return { people, companyName: report.companyName, conventionalHours: FULL_TIME_HOURS, unreadRows: 0 };
}
