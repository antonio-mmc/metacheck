"use client";

import type { DocumentEntry, DocumentsCard } from "@/domain/documents";
import type { DocumentCheckCard } from "@/ingest/document-checks";
import { useState } from "react";

const toneText = {
  read: "Read",
  aside: "Set aside",
  error: "Could not read",
  missing: "Missing",
} as const;

const toneClass = {
  read: "text-on-track",
  aside: "text-soft",
  error: "text-off-track",
  missing: "text-at-risk",
} as const;

export function DocumentsMenu({
  documents,
  checks,
  freshFilename,
}: {
  documents: DocumentsCard;
  checks: DocumentCheckCard[];
  freshFilename: string | null;
}) {
  const files = documents.entries.filter((entry) => entry.tone !== "missing");
  const aside = files.filter((entry) => entry.tone === "aside");
  const rest = files.filter((entry) => entry.tone !== "aside");
  const [focus, setFocus] = useState<DocumentEntry | null>(null);
  const [showAside, setShowAside] = useState(false);

  const years = [...new Set(rest.map((entry) => yearOf(entry.filename)))].sort((a, b) => {
    if (a === "No year") return 1;
    if (b === "No year") return -1;
    return b.localeCompare(a);
  });

  const row = (entry: DocumentEntry) => (
    <li key={`${entry.filename}-${entry.label}`}>
      <button
        type="button"
        onMouseEnter={() => setFocus(entry)}
        onFocus={() => setFocus(entry)}
        onClick={() => setFocus(entry)}
        className={`w-full truncate rounded-md px-2 py-1 text-left text-sm hover:bg-panel2 ${
          focus === entry ? "bg-panel2 text-ink" : "text-ink"
        } ${entry.tone === "error" ? "text-off-track" : ""} ${entry.filename === freshFilename ? "card-in" : ""}`}
        title={entry.filename}
      >
        {entry.filename}
      </button>
    </li>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        {years.map((year) => {
          const inYear = rest.filter((entry) => yearOf(entry.filename) === year);
          const types = [...new Set(inYear.map(typeOf))];
          return (
            <section key={year} className="mb-3 border-t border-line pt-3 first:border-t-0 first:pt-0">
              <h3 className="num px-2 text-base font-semibold text-ink">{year}</h3>
              {types.map((type) => (
                <div key={type} className="mt-2">
                  <p className="px-2 text-sm font-medium text-soft">{type}</p>
                  <ul>{inYear.filter((entry) => typeOf(entry) === type).map(row)}</ul>
                </div>
              ))}
            </section>
          );
        })}
        {aside.length > 0 ? (
          <section className="border-t border-line pt-2">
            <button
              type="button"
              aria-expanded={showAside}
              onClick={() => setShowAside((open) => !open)}
              className="w-full rounded-md px-2 py-1 text-left text-sm text-soft hover:bg-panel2"
            >
              Set aside · {aside.length} {showAside ? "▴" : "▾"}
            </button>
            {showAside ? <ul>{aside.map(row)}</ul> : null}
          </section>
        ) : null}
      </div>
      <aside className="min-w-0 rounded-xl bg-panel2 p-4 sm:sticky sm:top-0 sm:self-start" aria-live="polite">
        {focus ? <Detail entry={focus} check={checks.find((card) => card.filename === focus.filename) ?? null} /> : <Summary documents={documents} />}
      </aside>
    </div>
  );
}

function Summary({ documents }: { documents: DocumentsCard }) {
  return (
    <div className="text-sm">
      <p className="font-semibold">{documents.readCount} documents read</p>
      <p className="mt-1 text-soft">
        {documents.missing.length} missing · {documents.setAside} set aside
      </p>
      {documents.missing.length > 0 ? (
        <ul className="mt-3 grid gap-1">
          {documents.missing.map((item) => (
            <li key={item} className="text-at-risk">
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      {documents.notCrossChecked.length > 0 ? (
        <ul className="mt-3 grid gap-1 text-soft">
          {documents.notCrossChecked.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
      {documents.continueHint ? <p className="mt-3 font-medium text-pretty">{documents.continueHint}</p> : null}
      <p className="mt-4 text-xs text-soft">Point at a document to see what was read from it.</p>
    </div>
  );
}

function Detail({ entry, check }: { entry: DocumentEntry; check: DocumentCheckCard | null }) {
  return (
    <div className="text-sm">
      <p className="text-xs text-soft">{entry.label}</p>
      <p className="mt-0.5 font-semibold break-words">{entry.filename}</p>
      <p className={`mt-1 font-medium ${toneClass[entry.tone]}`}>{toneText[entry.tone]}</p>
      {entry.detail ? <p className="mt-2 text-pretty text-soft">{entry.detail}</p> : null}
      {check && check.extracted.length > 0 ? (
        <dl className="mt-3 grid gap-2 border-t border-line pt-3">
          {check.extracted.map((fact) => (
            <div key={`${fact.label}-${fact.source}`}>
              <dt className="text-xs text-soft">{fact.label}</dt>
              <dd className="font-medium text-pretty">{fact.value}</dd>
              <dd className="text-xs text-soft text-pretty">{fact.source}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {check && check.checks.length > 0 ? (
        <ul className="mt-3 grid gap-1 border-t border-line pt-3">
          {check.checks.map((item) => (
            <li key={item.label} className="flex gap-2 text-pretty">
              <span aria-hidden className={item.ok ? "text-on-track" : "text-off-track"}>
                {item.ok ? "✓" : "✗"}
              </span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function yearOf(filename: string): string {
  const match = filename.match(/20\d{2}/);
  return match?.[0] ?? "No year";
}

function typeOf(entry: DocumentEntry): string {
  return entry.label.replace(/ Q\d$/, "");
}
