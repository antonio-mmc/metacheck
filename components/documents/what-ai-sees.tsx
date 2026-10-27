import type { MaskedPair, MaskReport } from "@/ingest/mask";

const groups: { prefix: string; title: string; short: string; one?: string }[] = [
  { prefix: "NIF", title: "Tax numbers (NIF)", short: "NIF" },
  { prefix: "NISS", title: "Social security numbers (NISS)", short: "NISS" },
  { prefix: "CC", title: "Citizen cards", short: "citizen cards", one: "citizen card" },
  { prefix: "IBAN", title: "IBAN", short: "IBAN" },
  { prefix: "EMAIL", title: "Emails", short: "emails", one: "email" },
  { prefix: "PHONE", title: "Phones", short: "phones", one: "phone" },
  { prefix: "WORKER", title: "Workers", short: "workers", one: "worker" },
  { prefix: "PERSON", title: "Other people", short: "other people", one: "other person" },
  { prefix: "COMPANY", title: "Companies", short: "companies", one: "company" },
  { prefix: "ADDRESS", title: "Addresses", short: "addresses", one: "address" },
];

export function WhatAiSees({
  masked,
  note,
}: {
  masked: MaskReport;
  note?: string | null;
}) {
  const prefixOf = (pair: MaskedPair) => pair.token.slice(1).replace(/_\d+\]$/, "");
  const local = groups.flatMap(({ prefix, short, one }) => {
    const count = masked.local.found.find((item) => item.prefix === prefix)?.count ?? 0;
    return count > 0 ? [{ prefix, short: count === 1 && one ? one : short, count }] : [];
  });
  return (
    <div>
      {masked.local.documents > 0 ? (
        <section className="mb-4 rounded-xl bg-panel2 p-3">
          <p className="text-sm font-semibold">Never sent · {masked.local.documents} documents read on this computer</p>
          <p className="mt-1 text-sm text-pretty text-soft">
            Read by code, without the AI. Their identifiers stay here and are never sent.
          </p>
          {local.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {local.map(({ prefix, short, count }) => (
                <li key={prefix}>
                  <span className="num font-semibold">{count}</span> <span className="text-soft">{short}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
      <p className="text-sm font-semibold">
        Sent to the AI · {masked.pairs.length} values masked in {masked.documents}{" "}
        {masked.documents === 1 ? "document" : "documents"}
      </p>
      <p className="mt-1 text-sm text-pretty text-soft">
        Only these documents need the AI. Each identifier is replaced by a label before it leaves. Values and dates
        stay. This is pseudonymised, and every AI call is logged.
      </p>
      {masked.pairs.length === 0 ? (
        <p className="mt-4 text-sm text-soft">Nothing has been prepared for the model yet.</p>
      ) : (
        <div className="mt-4 grid gap-4">
          {groups.map(({ prefix, title }) => {
            const rows = masked.pairs.filter((pair) => prefixOf(pair) === prefix);
            if (rows.length === 0) return null;
            return (
              <section key={prefix}>
                <h3 className="text-xs text-soft">
                  {title} · {rows.length}
                </h3>
                <ul className="mt-1">
                  {rows.map((pair) => (
                    <li
                      key={`${pair.value}-${pair.token}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-baseline gap-3 border-t border-line py-1.5 text-sm"
                    >
                      <span className="min-w-0 truncate text-soft" title={pair.value}>
                        {pair.value}
                      </span>
                      <span aria-hidden className="text-soft">
                        →
                      </span>
                      <span className="min-w-0 truncate font-mono text-[13px] font-medium text-ok">{pair.token}</span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
      {note ? <p className="mt-4 text-sm text-pretty">{note}</p> : null}
    </div>
  );
}
