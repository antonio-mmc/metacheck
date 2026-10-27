import type { DocumentKind } from "@/domain/schemas";

export type ReadFile = {
  filename: string;
  kind: DocumentKind;
  periodEnd: string | null;
  year: number | null;
  month: number | null;
  detail: string | null;
};

export type DocumentEntry = {
  filename: string;
  label: string;
  tone: "read" | "aside" | "error" | "missing";
  detail: string | null;
};

export type DocumentsCard = {
  readCount: number;
  missing: string[];
  setAside: number;
  notCrossChecked: string[];
  entries: DocumentEntry[];
  continueHint: string | null;
};

const CONTINUE =
  "The other documents are unchanged. Add a text PDF, a spreadsheet, or a CSV to continue.";

const labels: Record<DocumentKind, string> = {
  call: "Public call",
  acceptance_term: "Acceptance term",
  trial_balance: "Trial balance",
  staff_map: "Staff map",
  single_report: "Single report",
  ies: "Annual statement",
  social_security: "Social security",
  certificate: "Certificate",
  irrelevant: "Set aside",
  unreadable: "Could not read",
};

function hasBalanceEnding(files: ReadFile[], month: number, year = 2026): boolean {
  return files.some(
    (file) =>
      file.kind === "trial_balance" &&
      file.periodEnd?.startsWith(`${year}-${String(month).padStart(2, "0")}`),
  );
}

/** What the documents card says. The panel asks only for what the calculation cannot do without. */
export function buildDocumentsCard(files: ReadFile[]): DocumentsCard {
  const missing: string[] = [];
  if (!files.some((file) => file.kind === "call")) missing.push("Add the public call for this project.");
  if (!files.some((file) => file.kind === "acceptance_term")) {
    missing.push("Add the acceptance term.");
  }
  if (!hasBalanceEnding(files, 9)) {
    missing.push("Add the trial balance for Q3 (through September).");
  } else if (!hasBalanceEnding(files, 3) || !hasBalanceEnding(files, 6)) {
    missing.push("Add the trial balances for Q1 and Q2.");
  }

  const notCrossChecked: string[] = [];
  if (!files.some((file) => file.kind === "staff_map")) {
    notCrossChecked.push("The staff map was not cross-checked. It is a shortcut, not the proof.");
  }
  if (!files.some((file) => file.kind === "single_report")) {
    notCrossChecked.push("The pre-project staff report was not cross-checked.");
  }
  if (!files.some((file) => file.kind === "ies" && file.year === 2023)) {
    notCrossChecked.push("The 2023 annual statement was not cross-checked.");
  }
  if (!files.some((file) => file.kind === "social_security" && file.year === 2026 && file.month === 9)) {
    notCrossChecked.push("The September social-security return was not cross-checked.");
  }

  const entries: DocumentEntry[] = [
    ...missing.map((detail) => ({
      filename: "Still needed",
      label: "Missing",
      tone: "missing" as const,
      detail,
    })),
    ...files.map((file) => ({
      filename: file.filename,
      label: file.kind === "trial_balance" && file.periodEnd ? balanceLabel(file.periodEnd) : labels[file.kind],
      tone: file.kind === "irrelevant" ? ("aside" as const) : file.kind === "unreadable" ? ("error" as const) : ("read" as const),
      detail: file.detail,
    })),
  ];

  const unreadable = files.some((file) => file.kind === "unreadable");

  return {
    readCount: files.filter((file) => file.kind !== "irrelevant" && file.kind !== "unreadable").length,
    missing,
    setAside: files.filter((file) => file.kind === "irrelevant").length,
    notCrossChecked,
    entries,
    continueHint: unreadable ? CONTINUE : null,
  };
}

function balanceLabel(periodEnd: string): string {
  const month = Number(periodEnd.slice(5, 7));
  if (month <= 3) return "Trial balance Q1";
  if (month <= 6) return "Trial balance Q2";
  if (month <= 9) return "Trial balance Q3";
  return "Trial balance Q4";
}
