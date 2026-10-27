"use client";

import type { DocumentEntry, DocumentsCard } from "@/domain/documents";
import { useState } from "react";

const toneClass = {
  read: "text-on-track",
  aside: "text-soft",
  error: "text-off-track",
  missing: "text-at-risk",
} as const;

function rank(entry: DocumentEntry): number {
  if (entry.tone === "missing" || entry.tone === "error") return 0;
  if (/trial balance/i.test(entry.label)) return 1;
  if (/staff/i.test(entry.label)) return 2;
  if (/acceptance/i.test(entry.label)) return 3;
  if (/social/i.test(entry.label)) return 4;
  if (/certificate/i.test(entry.label)) return 5;
  if (entry.tone === "aside") return 8;
  return 6;
}

export function DocumentsCardView({ card }: { card: DocumentsCard }) {
  const [expanded, setExpanded] = useState(false);
  const ranked = [...card.entries].sort((a, b) => rank(a) - rank(b));
  const shown = expanded ? ranked : ranked.slice(0, 6);

  return (
    <section id="documents" className="scroll-mt-24 rounded-2xl border border-line bg-elevated p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-[0.04em] text-soft uppercase">
          Documents · {card.readCount} read
        </h2>
        <p className="text-sm text-soft">
          {card.missing.length} missing · {card.setAside} set aside
        </p>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {shown.map((entry) => (
          <li key={`${entry.tone}-${entry.filename}-${entry.detail ?? ""}`} className="py-2">
            <div className="flex items-baseline justify-between gap-4">
              <p className="min-w-0 text-sm font-medium break-words">{entry.filename}</p>
              <p className={`shrink-0 text-sm font-medium ${toneClass[entry.tone]}`}>{entry.label}</p>
            </div>
            {entry.detail ? <p className="mt-1 text-sm text-pretty text-soft">{entry.detail}</p> : null}
          </li>
        ))}
      </ul>
      {ranked.length > 6 ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 inline-flex h-11 items-center text-sm font-medium text-action hover:underline"
        >
          {expanded ? "Show less" : `See all (${ranked.length})`}
        </button>
      ) : null}
      {card.notCrossChecked.length > 0 ? (
        <ul className="mt-3 text-sm text-soft">
          {card.notCrossChecked.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      {card.continueHint ? <p className="mt-4 text-sm font-medium text-pretty">{card.continueHint}</p> : null}
    </section>
  );
}
