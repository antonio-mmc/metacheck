import { valueAdded } from "@/domain/accounts";
import { buildDocumentsCard, type DocumentsCard, type ReadFile } from "@/domain/documents";
import type { AccountRow, DocumentKind } from "@/domain/schemas";
import { sendToModel } from "@/ai/door";
import { classifyBytes } from "@/ingest/classify";
import { countIdentifiers, createMaskSession, sessionPairs, type MaskLexicon, type MaskReport } from "@/ingest/mask";
import { readIes, type IesStatement } from "@/ingest/readers/ies";
import { readCertificate, type CertificateReading } from "@/ingest/readers/certificate";
import { certificateSignatories, readAcceptanceTerm } from "@/ingest/readers/term";
import { readSingleReport, type SingleReport } from "@/ingest/readers/single-report";
import { readSocialSecurity, type SocialSecurityReturn } from "@/ingest/readers/social-security";
import { readStaffMap, type StaffMap } from "@/ingest/readers/staff-map";
import { staffFromPayroll } from "@/ingest/staff-from-payroll";
import { readTrialBalance } from "@/ingest/readers/trial-balance";

export type InputFile = {
  filename: string;
  bytes: Uint8Array;
};

export type ProjectReading = {
  card: DocumentsCard;
  files: ReadFile[];
  balances: { filename: string; periodEnd: string | null; rows: AccountRow[] }[];
  staff: StaffMap | null;
  singleReport: SingleReport | null;
  ies: (IesStatement & { filename: string })[];
  socialSecurity: (SocialSecurityReturn & { filename: string })[];
  certificates: CertificateReading[];
  masked: MaskReport;
  lexicon: MaskLexicon;
};

export async function readProject(
  inputs: InputFile[],
  options?: {
    askModel?: (text: string, lexicon: MaskLexicon) => Promise<DocumentKind | null>;
    lexicon?: MaskLexicon;
  },
): Promise<ProjectReading> {
  const files: ReadFile[] = [];
  const balances: ProjectReading["balances"] = [];
  let staff: StaffMap | null = null;
  let singleReport: SingleReport | null = null;
  const ies: ProjectReading["ies"] = [];
  const socialSecurity: ProjectReading["socialSecurity"] = [];
  const workers: string[] = [];
  const people: string[] = [];
  const companies: string[] = [];
  const addresses: string[] = [];
  const certificates: { filename: string; text: string }[] = [];
  const calls: { filename: string; text: string }[] = [];
  const unknowns: { filename: string; bytes: Uint8Array; text: string }[] = [];
  const localTexts: string[] = [];

  const take = async (filename: string, bytes: Uint8Array, classified: Awaited<ReturnType<typeof classifyBytes>>) => {
    const base: ReadFile = {
      filename,
      kind: classified.kind,
      periodEnd: null,
      year: null,
      month: null,
      detail: classified.detail,
    };

    try {
      if (classified.kind === "trial_balance") {
        const balance = await readTrialBalance(filename, bytes, classified.text);
        base.periodEnd = balance.periodEnd;
        if (balance.periodFromName) {
          base.detail = "The export has no date. The quarter was taken from the file name.";
        }
        balances.push({ filename, periodEnd: balance.periodEnd, rows: balance.rows });
        if (!valueAdded(balance.rows).balanced) {
          base.kind = "unreadable";
          base.detail = "Debit and credit do not match. Replace this export before the figures are used.";
        }
        if (balance.companyName) companies.push(balance.companyName);
        companies.push(...balance.thirdParties);
      } else if (classified.kind === "staff_map") {
        staff = readStaffMap(filename, bytes);
        if (staff.unreadRows > 0) {
          base.kind = "unreadable";
          base.detail = `${staff.unreadRows} rows could not be read. Check this file before using the headcount.`;
        }
        workers.push(...staff.people.map((person) => person.name));
        if (staff.companyName) companies.push(staff.companyName);
      } else if (classified.kind === "single_report") {
        singleReport = await readSingleReport(filename, bytes);
        base.year = singleReport.year;
        if (singleReport.unreadRows > 0) {
          base.kind = "unreadable";
          base.detail = `${singleReport.unreadRows} people could not be read. Check this file before using the headcount.`;
        }
        workers.push(...singleReport.people.map((person) => person.name));
        if (singleReport.companyName) companies.push(singleReport.companyName);
        if (singleReport.address) addresses.push(singleReport.address);
      } else if (classified.kind === "ies") {
        const statement = await readIes(bytes);
        if (statement.gaps.length > 0) {
          base.detail = "This file has no complete annual statement, so it was not used.";
        } else {
          ies.push({ ...statement, filename });
          base.year = statement.year;
        }
        if (statement.companyName) companies.push(statement.companyName);
      } else if (classified.kind === "social_security") {
        const payroll = await readSocialSecurity(bytes);
        socialSecurity.push({ ...payroll, filename });
        base.year = payroll.year;
        base.month = payroll.month;
        workers.push(...payroll.people.map((person) => person.name));
        if (payroll.companyName) companies.push(payroll.companyName);
        if (payroll.address) addresses.push(payroll.address);
      } else if (classified.kind === "acceptance_term") {
        const term = await readAcceptanceTerm(bytes);
        if (term.signatory) people.push(term.signatory);
        if (term.companyName) companies.push(term.companyName);
        if (term.address) addresses.push(term.address);
      } else if (classified.kind === "certificate") {
        people.push(...certificateSignatories(classified.text));
        certificates.push({ filename, text: classified.text });
      } else if (classified.kind === "call") {
        calls.push({ filename, text: classified.text });
      }
    } catch {
      base.kind = "unreadable";
      base.detail = "This file could not be read. Replace it with the original export.";
    }

    if (!["certificate", "call", "irrelevant", "unreadable"].includes(base.kind)) localTexts.push(classified.text);
    files.push(base);
  };

  for (const input of inputs) {
    let classified;
    try {
      classified = await classifyBytes(input.bytes);
    } catch {
      files.push({
        filename: input.filename,
        kind: "unreadable",
        periodEnd: null,
        year: null,
        month: null,
        detail: "This file could not be read. Replace it with the original export.",
      });
      continue;
    }
    if (
      classified.kind === "unreadable" &&
      /not a call/i.test(classified.detail ?? "") &&
      classified.text.trim().length > 40
    ) {
      unknowns.push({ filename: input.filename, bytes: input.bytes, text: classified.text });
    }
    await take(input.filename, input.bytes, classified);
  }

  const lexicon: MaskLexicon = {
    workers: mergeNames(options?.lexicon?.workers, workers),
    people: mergeNames(options?.lexicon?.people, people),
    companies: mergeNames(options?.lexicon?.companies, companies),
    addresses: mergeNames(options?.lexicon?.addresses, addresses),
  };
  const named = lexicon.workers.length + lexicon.people.length + lexicon.companies.length > 0;
  if (options?.askModel && named) {
    for (const unknown of unknowns) {
      let guessed: DocumentKind | null = null;
      try {
        guessed = await options.askModel(unknown.text, lexicon);
      } catch {
        continue;
      }
      if (!guessed || guessed === "unreadable") continue;
      const index = files.findIndex((file) => file.filename === unknown.filename);
      if (index >= 0) files.splice(index, 1);
      await take(unknown.filename, unknown.bytes, {
        kind: guessed,
        text: unknown.text,
        detail: "Classified by the model.",
      });
    }
  }
  const maskedWith: MaskLexicon = {
    workers: mergeNames(lexicon.workers, workers),
    people: mergeNames(lexicon.people, people),
    companies: mergeNames(lexicon.companies, companies),
    addresses: mergeNames(lexicon.addresses, addresses),
  };
  const session = createMaskSession();
  for (const certificate of certificates) {
    sendToModel({
      filename: certificate.filename,
      kind: "certificate",
      text: certificate.text,
      isPublic: false,
      lexicon: maskedWith,
      session,
    });
  }
  for (const callFile of calls) {
    sendToModel({
      filename: callFile.filename,
      kind: "call",
      text: callFile.text,
      isPublic: true,
      lexicon: maskedWith,
    });
  }

  const certificateReadings = certificates.map((certificate) => readCertificate(certificate.filename, certificate.text));
  const payrollYear = Math.max(...socialSecurity.map((item) => item.year));
  const fromPayroll =
    singleReport && socialSecurity.length > 0
      ? staffFromPayroll(singleReport, socialSecurity, certificateReadings, payrollYear)
      : null;

  return {
    card: buildDocumentsCard(files),
    files,
    balances,
    staff: staff ?? fromPayroll,
    singleReport,
    ies,
    socialSecurity,
    certificates: certificateReadings,
    masked: {
      documents: certificates.length,
      pairs: sessionPairs(session),
      local: countIdentifiers(localTexts, maskedWith),
    },
    lexicon: maskedWith,
  };
}

function mergeNames(left: string[] | undefined, right: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of [...(left ?? []), ...right]) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value.trim());
  }
  return result;
}

