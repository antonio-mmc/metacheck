"use client";

import type { CSSProperties, ReactNode } from "react";

import {
  GRADUATE_MONTHLY_SALARY,
  OTHER_MONTHLY_SALARY,
  costUntilYearEnd,
  monthlyEmployerCost,
} from "@/domain/cost";
import { effectCopy } from "@/domain/effect";
import { formatEuro, formatPercent } from "@/domain/format";
import type { Lever, SimulationResult } from "@/domain/simulate";

export type SimulatorTab = "suggestions" | "sales" | "hiring" | "combined";

const tabs: { id: SimulatorTab; label: string }[] = [
  { id: "suggestions", label: "Suggestions" },
  { id: "sales", label: "Sales" },
  { id: "hiring", label: "Hiring" },
  { id: "combined", label: "Combined" },
];

export type SimulatorPath = {
  title: string;
  detail: string;
  levers: Lever[];
  roPct: number;
  cutEuro: number;
  costToYearEnd: number | null;
};

export type HireRow = { count: number; salary: number };

/** Graduates and non-graduates can join together. Both start on the same day. */
export type Crew = { graduates: HireRow; others: HireRow };

export const EMPTY_CREW: Crew = {
  graduates: { count: 0, salary: GRADUATE_MONTHLY_SALARY },
  others: { count: 0, salary: OTHER_MONTHLY_SALARY },
};

const MAX_PER_ROW = 5;

export function SimulatorPanel({
  tab,
  onTab,
  paths,
  onApply,
  crew,
  onCrew,
  startOn,
  months,
  onStart,
  sales,
  onSales,
  needed,
  levers,
  simulation,
  nowRo,
  nowCut,
  threshold,
  halo,
  onReset,
}: {
  tab: SimulatorTab;
  onTab: (tab: SimulatorTab) => void;
  paths: SimulatorPath[];
  onApply: (levers: Lever[]) => void;
  crew: Crew;
  onCrew: (crew: Crew) => void;
  startOn: string;
  months: { value: string; label: string }[];
  onStart: (startOn: string) => void;
  sales: number;
  onSales: (sales: number) => void;
  needed: number;
  levers: Lever[];
  simulation: SimulationResult | null;
  nowRo: number;
  nowCut: number;
  threshold: number;
  halo: boolean;
  onReset: () => void;
}) {
  const showHires = tab === "hiring" || tab === "combined";
  const showSales = tab === "sales" || tab === "combined";
  const salesMax = Math.max(needed * 2, 120_000);
  const people = crew.graduates.count + crew.others.count;
  const hireCost = [crew.graduates, crew.others]
    .filter((row) => row.count > 0)
    .reduce((total, row) => total + costUntilYearEnd(row.salary, startOn, row.count), 0);
  const effect =
    tab === "hiring"
      ? "Effect of hiring only"
      : tab === "sales"
        ? "Effect of extra sales only"
        : "All variables together";
  const salesFill = `${(sales / salesMax) * 100}%`;
  const neededAt = needed / salesMax;

  return (
    <section
      id="simulator"
      className={`scroll-mt-24 surface-accent flex flex-col rounded-[18px] border border-line p-3 shadow-[var(--shadow)] ${
        halo ? "sim-halo" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Simulator</h2>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-8 shrink-0 items-center rounded-full border border-line px-3 text-sm font-medium hover:bg-panel2"
        >
          Reset all
        </button>
      </div>
      <div
        className="mt-1.5 flex flex-wrap gap-1 rounded-xl bg-elevated p-0.5"
        role="tablist"
        aria-label="Simulator levers"
      >
        {tabs.map((item) => {
          const badge =
            item.id === "hiring" && people > 0
              ? String(people)
              : item.id === "sales" && sales > 0
                ? `+${Math.round(sales / 1000)}k`
                : null;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => onTab(item.id)}
              className={`inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-[10px] px-2 text-sm font-medium whitespace-nowrap ${
                tab === item.id ? "bg-action text-on-accent" : "text-ink hover:bg-panel2"
              }`}
            >
              {item.label}
              {badge ? (
                <span
                  className={`rounded-full px-1.5 text-[10px] ${tab === item.id ? "bg-on-accent/15" : "bg-sim"}`}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex-1">
        {tab === "suggestions" ? (
          <div>
            <p className="text-sm font-semibold">How to keep the full grant</p>
            <p className="mt-1 text-sm text-pretty text-soft">
              Only the best 2 of the 4 targets count. From hiring to selling. Tap one to apply it.
            </p>
            <ul className="mt-3 grid gap-2">
              {paths.map((path, index) => (
                <li key={path.title}>
                  <button
                    type="button"
                    onClick={() => onApply(path.levers)}
                    className="surface-card group flex w-full items-start gap-3 rounded-xl bg-elevated p-3 text-left text-ink ring-action transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--pop-shadow)] hover:ring-2 focus-visible:ring-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sim text-sm font-semibold text-action transition-colors group-hover:bg-action group-hover:text-on-accent">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-pretty">{path.title}</span>
                      <span className="mt-1 block text-sm text-pretty text-soft">
                        {path.detail}
                      </span>
                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                          path.cutEuro > 0
                            ? "bg-off-track-bg text-off-track"
                            : "bg-good-bg text-good"
                        }`}
                      >
                        Result {formatPercent(path.roPct)} · cut {formatEuro(path.cutEuro)}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end self-stretch text-right">
                      <span className="num block text-sm font-semibold text-at-risk">
                        {formatEuro(path.costToYearEnd ?? 0)}
                      </span>
                      <span className="block text-[11px] text-soft">
                        {path.costToYearEnd === null ? "no hiring" : "to 31 Dec"}
                      </span>
                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-action">
                        Apply
                        <span
                          aria-hidden
                          className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                        >
                          →
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-soft">
              Or pick a variable above to build your own scenario.
            </p>
          </div>
        ) : null}

        {tab !== "suggestions" ? (
          <ResultCard
            label={effect}
            simulation={simulation && levers.length > 0 ? simulation : null}
            sentence={simulation && levers.length > 0 ? effectCopy(simulation, levers) : null}
            nowRo={nowRo}
            nowCut={nowCut}
            threshold={threshold}
          />
        ) : null}

        {showHires ? (
          <AdjustCard
            title="Who joins"
            aside={
              <label className="flex items-center gap-2 text-sm text-soft">
                From
                <select
                  className="h-9 rounded-[10px] border border-line bg-elevated px-2 text-ink hover:border-action"
                  value={startOn}
                  onChange={(event) => onStart(event.target.value)}
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      1 {month.label}
                    </option>
                  ))}
                </select>
              </label>
            }
          >
            <div className="mt-2 divide-y divide-line">
              <HireLine
                label="Graduates"
                note="Count for jobs created and qualified jobs"
                row={crew.graduates}
                onRow={(graduates) => onCrew({ ...crew, graduates })}
              />
              <HireLine
                label="Non-graduates"
                note="Count for jobs created only"
                row={crew.others}
                onRow={(others) => onCrew({ ...crew, others })}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-3 border-t border-line pt-2">
              <p className="text-sm">
                {people > 0 ? (
                  <>
                    {people} {people === 1 ? "person" : "people"} ·{" "}
                    <span className="num font-semibold text-at-risk">{formatEuro(hireCost)}</span>{" "}
                    to 31 Dec
                  </>
                ) : (
                  "Add people above to see the cost."
                )}
              </p>
              <p className="text-[11px] text-soft">
                Not included: meal allowance, recruitment, equipment.
              </p>
            </div>
          </AdjustCard>
        ) : null}

        {showSales ? (
          <AdjustCard
            title="Extra sales by 31 Dec"
            aside={<span className="text-xs text-soft">Value added stays as projected</span>}
          >
            <div className="mt-2 flex items-center gap-3">
              <Stepper label="Fewer sales" onClick={() => onSales(Math.max(0, sales - 1000))}>
                −
              </Stepper>
              <span className="num min-w-36 text-center text-2xl font-semibold">
                {formatEuro(sales)}
              </span>
              <Stepper label="More sales" onClick={() => onSales(sales + 1000)}>
                +
              </Stepper>
            </div>
            <div className="relative mt-4">
              {needed > 0 ? (
                <span
                  aria-hidden
                  className="absolute -top-2 h-6 w-0.5 rounded-full bg-ok"
                  style={{ left: `calc(${neededAt * 100}% + ${11 - neededAt * 22}px)` }}
                />
              ) : null}
              <input
                id="extra-sales"
                aria-label="Extra sales by 31 Dec"
                className="sim-range relative w-full"
                style={{ "--fill": salesFill } as CSSProperties}
                type="range"
                min={0}
                max={salesMax}
                step={1000}
                value={sales}
                onChange={(event) => onSales(Number(event.target.value))}
              />
            </div>
            {needed > 0 ? (
              <button
                type="button"
                onClick={() => onSales(needed)}
                className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-full bg-good-bg px-3 text-sm font-medium text-good ring-ok transition-shadow hover:ring-2"
              >
                <span aria-hidden className="h-3 w-0.5 rounded-full bg-ok" />
                {formatEuro(needed)} clears {formatPercent(threshold)} on its own · Set
              </button>
            ) : null}
          </AdjustCard>
        ) : null}

        {tab === "combined" ? (
          <p className="mt-3 text-sm text-pretty text-soft">
            The combined result is not the sum: it always averages the best 2 indicators.
          </p>
        ) : null}
      </div>
      <p className="mt-2 text-[11px] text-soft">
        Suggestion · to be confirmed by your BF consultant
      </p>
    </section>
  );
}

/** The card you change things in. Outlined in the action colour so it reads as the control. */
function AdjustCard({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="surface-card mt-2 rounded-xl bg-elevated p-3 text-ink shadow-[var(--pop-shadow)] ring-[3px] ring-action">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span
            aria-hidden
            className="rounded-full bg-action px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em] text-on-accent uppercase"
          >
            Adjust
          </span>
          {title}
        </p>
        {aside}
      </div>
      {children}
    </div>
  );
}

function Stepper({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 place-items-center rounded-full bg-sim text-lg font-semibold text-action transition-colors hover:bg-action hover:text-on-accent disabled:opacity-40 disabled:hover:bg-sim disabled:hover:text-action"
    >
      {children}
    </button>
  );
}

function HireLine({
  label,
  note,
  row,
  onRow,
}: {
  label: string;
  note: string;
  row: HireRow;
  onRow: (row: HireRow) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[11px] text-soft">{note}</p>
      </div>
      <div className="flex items-center gap-2">
        <Stepper
          label={`Fewer ${label.toLowerCase()}`}
          disabled={row.count === 0}
          onClick={() => onRow({ ...row, count: Math.max(0, row.count - 1) })}
        >
          −
        </Stepper>
        <span className="num w-6 text-center text-xl font-semibold">{row.count}</span>
        <Stepper
          label={`More ${label.toLowerCase()}`}
          disabled={row.count === MAX_PER_ROW}
          onClick={() => onRow({ ...row, count: Math.min(MAX_PER_ROW, row.count + 1) })}
        >
          +
        </Stepper>
      </div>
      <label
        className="flex h-9 w-32 items-center rounded-[10px] border border-line bg-elevated px-2 text-sm hover:border-action"
        title={`Employer cost ${formatEuro(monthlyEmployerCost(row.salary))}/mo`}
      >
        <span className="text-soft">€</span>
        <input
          aria-label={`${label} base salary per month`}
          className="num min-w-0 flex-1 bg-transparent px-1 outline-none"
          inputMode="numeric"
          value={row.salary}
          onChange={(event) => onRow({ ...row, salary: Number(event.target.value) || 0 })}
        />
        <span className="text-soft">/mo</span>
      </label>
    </div>
  );
}

/** Before → after for the result and the cut, with the result drawn against the target. Read only. */
function ResultCard({
  label,
  simulation,
  sentence,
  nowRo,
  nowCut,
  threshold,
}: {
  label: string;
  simulation: SimulationResult | null;
  sentence: string | null;
  nowRo: number;
  nowCut: number;
  threshold: number;
}) {
  const ro = simulation ? simulation.after.roPct : nowRo;
  const cut = simulation ? simulation.after.cutEuro : nowCut;
  const clear = ro >= threshold;
  return (
    <div
      id="simulator-effect"
      className="surface-card rounded-xl bg-dim p-3 text-ink"
      aria-live="polite"
    >
      <p className="text-[11px] font-semibold tracking-[0.04em] text-soft uppercase">
        Preview · {label}
      </p>
      <dl className="mt-1.5 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-soft">Result</dt>
          <dd className="num mt-0.5 flex items-baseline gap-1.5 whitespace-nowrap">
            {simulation ? (
              <span className="text-sm text-soft">{formatPercent(nowRo)} →</span>
            ) : null}
            <span className={`text-2xl font-semibold ${clear ? "text-good" : "text-off-track"}`}>
              {formatPercent(ro)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-soft">Cut</dt>
          <dd className="num mt-0.5 flex items-baseline gap-1.5 whitespace-nowrap">
            {simulation ? <span className="text-sm text-soft">{formatEuro(nowCut)} →</span> : null}
            <span
              className={`text-2xl font-semibold ${cut === 0 ? "text-good" : "text-off-track"}`}
            >
              {formatEuro(cut)}
            </span>
          </dd>
        </div>
      </dl>
      <div className="relative mt-3 h-2 overflow-visible rounded-full bg-elevated">
        <span
          className={`absolute inset-0 origin-left rounded-full transition-transform duration-500 ease-[var(--ease-out)] motion-reduce:transition-none ${
            clear ? "bg-ok" : "bg-amber"
          }`}
          style={{ transform: `scaleX(${Math.min(ro, 100) / 100})` }}
        />
        <span
          aria-hidden
          className="absolute -top-1 h-4 w-0.5 rounded-full bg-ink"
          style={{ left: `${threshold}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-soft">Target {formatPercent(threshold)}</p>
      {sentence ? (
        <p className="mt-2 text-sm text-pretty">
          {sentence.split(/(?<=\.)\s+/).map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      ) : (
        <p className="mt-2 text-sm text-soft">
          Use the controls below. This card shows the effect.
        </p>
      )}
    </div>
  );
}
