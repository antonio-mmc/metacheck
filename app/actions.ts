"use server";

import { buildDocumentChecks, type DocumentCheckCard } from "@/ingest/document-checks";
import { valueAdded } from "@/domain/accounts";
import type { QuarterInput } from "@/domain/engine";
import type { PersonRecord } from "@/domain/schemas";
import { classifyUnknownText } from "@/ai/classify-unknown";
import { loadProject } from "@/app/load-demo";
import { projectId, projects } from "@/app/projects";
import { readProject } from "@/ingest/project";

export type UploadPatch = {
  filename: string;
  check: DocumentCheckCard | null;
  people: PersonRecord[] | null;
  conventionalHours: number | null;
  quarter: QuarterInput | null;
  callCode: string | null;
  error: string | null;
};

function quarterOf(periodEnd: string): 1 | 2 | 3 | null {
  const month = Number(periodEnd.slice(5, 7));
  if (month === 3) return 1;
  if (month === 6) return 2;
  if (month === 9) return 3;
  return null;
}

export async function ingestUpload(formData: FormData): Promise<UploadPatch> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return {
      filename: "Document",
      check: null,
      people: null,
      conventionalHours: null,
      quarter: null,
      callCode: null,
      error: "This file could not be read. Replace it with the original export.",
    };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const project = projects[projectId(formData.get("company"))];
  const demo = await loadProject(project.id);
  const reading = await readProject([{ filename: file.name, bytes }], {
    askModel: classifyUnknownText,
    lexicon: demo.lexicon,
  });
  const checks = buildDocumentChecks(reading, project.contract);
  const check = checks.find((item) => item.filename === file.name) ?? checks[0] ?? null;
  const balance = reading.balances.find((item) => item.filename === file.name);
  let quarter: QuarterInput | null = null;
  if (balance?.periodEnd) {
    const quarterNumber = quarterOf(balance.periodEnd);
    const figured = valueAdded(balance.rows);
    if (quarterNumber && figured.balanced) {
      quarter = {
        quarter: quarterNumber,
        months: Number(balance.periodEnd.slice(5, 7)),
        asOf: balance.periodEnd,
        turnoverYtd: figured.turnover,
        valueAddedYtd: figured.total,
        file: balance.filename,
      };
    }
  }
  const failed = reading.files.find((item) => item.filename === file.name && item.kind === "unreadable");
  return {
    filename: file.name,
    check,
    people: reading.staff?.people ?? null,
    conventionalHours: reading.staff?.conventionalHours ?? null,
    quarter,
    callCode: file.name.match(/MPR-\d{4}-\d+|MPr-\d{4}-\d+/)?.[0] ?? null,
    error: failed?.detail ?? null,
  };
}
