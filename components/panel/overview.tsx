"use client";

import { formatPercent } from "@/domain/format";
import { ruleCardSchema, type RuleCard } from "@/domain/rule-card";

export function ConfirmCall({
  card,
  compared,
  onConfirm,
}: {
  card: RuleCard;
  compared: string | null;
  onConfirm: () => void;
}) {
  const parsed = ruleCardSchema.parse(card);
  const rows: [string, string][] = [
    ["Call", parsed.callCode],
    ["Result indicators", parsed.resultIndicators.join(", ")],
    ["Result model", `${parsed.roModel}, n = ${parsed.bestN}, weights ${parsed.weights.join(" + ")}`],
    ["Threshold", formatPercent(parsed.thresholdPct)],
    ["Penalty", `${parsed.penaltyStepPp} p.p. for every ${parsed.penaltyEveryPp} p.p., maximum ${parsed.penaltyMaxPp}`],
    ["Pre-project year", parsed.preProjectYear.source === "term" ? "From the acceptance term" : String(parsed.preProjectYear.year)],
    ["Pages", parsed.pages],
  ];

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 py-16 sm:px-8">
      <p className="text-sm font-medium text-soft">Check the call before the panel opens</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">Rules read from {parsed.callCode}</h1>
      <p className="mt-3 text-pretty text-soft">
        {compared ?? "This is the saved card. The panel uses it when the model is offline."}
      </p>
      <dl className="mt-8 divide-y divide-line rounded-2xl border border-line bg-elevated">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
            <dt className="text-sm text-soft">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={onConfirm}
        className="mt-6 inline-flex h-11 items-center rounded-[6px] bg-action px-4 text-sm font-medium text-on-accent hover:bg-action-hover"
      >
        Confirm and open the panel
      </button>
    </main>
  );
}
