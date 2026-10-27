import { readFileSync } from "node:fs";
import path from "node:path";
import { Suspense } from "react";

import { inputFromReading } from "@/app/operation";
import { loadProject } from "@/app/load-demo";
import { projectId, projects, type ProjectId } from "@/app/projects";
import { AppShell } from "@/components/shell/app-shell";
import { buildDocumentChecks } from "@/ingest/document-checks";
import { cardDifferences, ruleCardSchema, type RuleCard } from "@/domain/rule-card";
import type { ProjectReading } from "@/ingest/project";

function modelNote(card: RuleCard): string | null {
  try {
    const raw = JSON.parse(readFileSync(path.join(process.cwd(), "data", "ai-cache", `${card.callCode}.json`), "utf8")) as {
      extracted?: unknown;
    };
    const extracted = ruleCardSchema.safeParse(raw.extracted);
    if (!extracted.success) return "The saved model reply did not pass validation. The panel keeps the saved card.";
    if (extracted.data.callCode.toLowerCase() === card.callCode.toLowerCase()) {
      extracted.data.callCode = card.callCode;
    }
    const differ = cardDifferences(extracted.data, card);
    if (differ.length === 0) {
      return "The model read this call through the single door. Every field matches the saved card.";
    }
    return `The model read this call. These fields differ: ${differ.join(", ")}. The panel keeps the saved card.`;
  } catch {
    return null;
  }
}

function blockedCopy(project: ProjectReading): string {
  const reasons = [...project.card.missing];
  for (const file of project.files) {
    if (file.kind === "unreadable" && file.detail) reasons.push(`${file.filename}: ${file.detail}`);
  }
  if (!project.staff) {
    reasons.push(...project.card.notCrossChecked.filter((note) => /staff map/i.test(note)));
  }
  return reasons.length > 0
    ? reasons.join(" ")
    : "Add the acceptance term and the September trial balance before the panel can open.";
}

const choices = Object.values(projects).map((item) => ({
  id: item.id,
  companyName: item.contract.companyName,
  callCode: item.contract.callCode,
}));

export default function Home({ searchParams }: { searchParams: Promise<{ company?: string | string[] }> }) {
  return (
    <Suspense fallback={<p className="px-5 pt-20 text-sm text-soft">Reading the company folder…</p>}>
      <Company searchParams={searchParams} />
    </Suspense>
  );
}

async function Company({ searchParams }: { searchParams: Promise<{ company?: string | string[] }> }) {
  const id: ProjectId = projectId((await searchParams).company);
  const { card, contract } = projects[id];
  const project = await loadProject(id);
  const input = inputFromReading(project, card, contract);

  return (
    <AppShell
      key={id}
      company={id}
      choices={choices}
      input={input}
      checks={buildDocumentChecks(project, contract)}
      documents={project.card}
      masked={project.masked}
      lexicon={project.lexicon}
      note={modelNote(card)}
      blocked={input ? null : blockedCopy(project)}
    />
  );
}
