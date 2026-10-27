"use client";

import {
  QuarterChart,
  type ChartExplain,
  type ChartPoint,
  type ChartRow,
} from "@/components/charts/quarter-chart";
import { TargetRing } from "@/components/charts/target-ring";
import { TitleSelect } from "@/components/panel/title-select";
import type { CompanyChoice } from "@/components/shell/app-shell";
import { useRouter } from "next/navigation";
import { CountUp } from "@/components/panel/count-up";
import {
  EMPTY_CREW,
  SimulatorPanel,
  type Crew,
  type HireRow,
  type SimulatorTab,
} from "@/components/panel/simulator-panel";
import { VerifyDrawer } from "@/components/panel/verify-drawer";
import {
  asOfView,
  defaultStartOn,
  knownThen,
  monthOptions,
  pathLevers,
  salesToClear,
  type AsOfId,
} from "@/domain/as-of";
import { effectCopy } from "@/domain/effect";
import { isQualifiedHabilitation } from "@/domain/eti";
import {
  projectQuarter,
  quartersUpTo,
  runOperation,
  type EngineInput,
  type IndicatorResult,
  type OperationResult,
  type TrackedCode,
} from "@/domain/engine";
import { formatEti, formatEuro, formatPercent, formatPp } from "@/domain/format";
import { indicatorState, stateLabel } from "@/domain/panel";
import { simulate, type Lever, type SimulationResult } from "@/domain/simulate";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { askPanel } from "@/app/ask-action";
import { ChatBar } from "@/components/chat/chat-bar";
import { SUGGESTED_QUESTIONS } from "@/domain/rehearsed";
import type { MaskLexicon } from "@/ingest/mask";

const order: TrackedCode[] = ["RPR001", "RPR002", "RPR003", "RSR23"];

const shortName: Record<TrackedCode, string> = {
  RPR001: "Turnover",
  RPR002: "VA / worker",
  RPR003: "Jobs created",
  RSR23: "Qualified jobs",
};

function serving(person: { startedOn: string; endedOn: string | null }, day: string): boolean {
  if (person.startedOn > day) return false;
  if (person.endedOn && person.endedOn < day) return false;
  return true;
}

function buildLevers(tab: SimulatorTab, crew: Crew, startOn: string, sales: number): Lever[] {
  const levers: Lever[] = [];
  if (tab === "hiring" || tab === "combined") {
    for (const [row, qualified] of [
      [crew.graduates, true],
      [crew.others, false],
    ] as const) {
      if (row.count > 0 && row.salary > 0) {
        levers.push({
          kind: "hire",
          count: row.count,
          qualified,
          startOn,
          monthlySalary: row.salary,
        });
      }
    }
  }
  if ((tab === "sales" || tab === "combined") && sales > 0) {
    levers.push({ kind: "extra_sales", euro: sales });
  }
  return levers;
}

function rowsOf(
  indicators: { code: TrackedCode; ratioPct: number; countsInRo: boolean }[],
  previous: { code: TrackedCode; ratioPct: number }[] | null,
): ChartRow[] {
  return order.map((code) => {
    const item = indicators.find((indicator) => indicator.code === code);
    const before = previous?.find((indicator) => indicator.code === code);
    return {
      label: shortName[code],
      ratioPct: item?.ratioPct ?? 0,
      countsInRo: Boolean(item?.countsInRo),
      change: item && before ? item.ratioPct - before.ratioPct : null,
    };
  });
}

function filesOf(indicators: IndicatorResult[], fallback: string): string[] {
  const names = new Set<string>();
  for (const item of indicators) {
    for (const source of item.sources) names.add(source.file);
  }
  if (names.size === 0 && fallback) names.add(fallback);
  return [...names];
}

function bestLine(indicators: IndicatorResult[]): string {
  const best = indicators
    .filter((item) => item.countsInRo)
    .map((item) => `${shortName[item.code]} ${formatPercent(item.ratioPct)}`);
  return best.length > 0 ? ` The best two are ${best.join(" and ")}.` : "";
}

export function Monitor({
  input,
  lexicon,
  documentCount,
  halo,
  company,
  choices,
}: {
  input: EngineInput;
  lexicon: MaskLexicon;
  documentCount: number;
  halo: boolean;
  company: string;
  choices: CompanyChoice[];
}) {
  const router = useRouter();
  const [switching, startSwitch] = useTransition();
  const companies = [...new Map(choices.map((choice) => [choice.companyName, choice])).values()];
  const notices = choices.filter(
    (choice) => choice.companyName === companyNameOf(choices, company),
  );
  const openCompany = (id: string) => startSwitch(() => router.push(`/?company=${id}`));
  const [asOf, setAsOf] = useState<AsOfId>("Q3");
  const view = asOfView(asOf);
  const [tab, setTab] = useState<SimulatorTab>("suggestions");
  const [crew, setCrew] = useState<Crew>(EMPTY_CREW);
  const [startOn, setStartOn] = useState(
    defaultStartOn(view.referenceDate, input.contract.cruiseYear),
  );
  const [sales, setSales] = useState(0);
  const [open, setOpen] = useState<{ title: string; lines: string[] } | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [dockPad, setDockPad] = useState(96);

  useEffect(() => {
    const node = document.getElementById("chat-dock");
    if (!node) return;
    const apply = () => {
      const height = node.getBoundingClientRect().height;
      setDockPad(height > 20 ? Math.ceil(height) + 12 : 72);
    };
    const observer = new ResizeObserver(apply);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const operation = useMemo(
    () => runOperation(input, view.referenceDate),
    [input, view.referenceDate],
  );
  const levers = useMemo(() => buildLevers(tab, crew, startOn, sales), [crew, sales, startOn, tab]);
  const simulation: SimulationResult | null = useMemo(
    () => (levers.length > 0 ? simulate(input, levers, view.referenceDate) : null),
    [input, levers, view.referenceDate],
  );
  const known = useMemo(
    () => quartersUpTo(input.quarters, view.referenceDate),
    [input, view.referenceDate],
  );
  const snaps = useMemo(
    () => known.map((quarter) => ({ quarter, snap: projectQuarter(input, quarter, [], 0) })),
    [input, known],
  );
  const needed = salesToClear(input, view.referenceDate);
  const priced = pathLevers(input, view.referenceDate);
  const paths = operation.paths.map((path) => ({
    title: path.title,
    detail: path.detail,
    roPct: path.roPct,
    cutEuro: path.cutEuro,
    costToYearEnd: path.costToYearEnd,
    levers: priced.find((item) => item.title === path.title)?.levers ?? [],
  }));
  const qualifiedPeople = input.people.filter(
    (person) =>
      serving(person, view.referenceDate) && isQualifiedHabilitation(person.habilitationCode),
  ).length;
  const light =
    operation.penaltyPp === 0
      ? "clear"
      : operation.paths.some((path) => path.cutEuro === 0)
        ? "fixable"
        : "lost";
  const points = useMemo(() => buildPoints(snaps, operation, light), [snaps, operation, light]);
  const simulated = simulation
    ? {
        roPct: simulation.after.roPct,
        explain: {
          id: "year-end",
          kicker: `Year end ${operation.cruiseYear}`,
          roPct: simulation.after.roPct,
          delta: simulation.after.roPct - simulation.before.roPct,
          cutEuro: simulation.after.cutEuro,
          sentence: effectCopy(simulation, levers),
          rows: rowsOf(simulation.after.indicators, simulation.before.indicators),
          sources: ["Simulator settings"],
        } satisfies ChartExplain,
      }
    : null;

  function chooseQuarter(next: AsOfId) {
    const picked = asOfView(next);
    setAsOf(next);
    setCrew(EMPTY_CREW);
    setSales(0);
    setStartOn(defaultStartOn(picked.referenceDate, input.contract.cruiseYear));
    setTab("suggestions");
    setSelected(null);
  }

  function apply(next: Lever[]) {
    const hires = next.filter((lever) => lever.kind === "hire");
    const extraEuro = next.reduce(
      (sum, lever) => sum + (lever.kind === "extra_sales" ? lever.euro : 0),
      0,
    );
    const rowOf = (qualified: boolean): HireRow => {
      const same = hires.filter((lever) => lever.qualified === qualified);
      const empty = qualified ? EMPTY_CREW.graduates : EMPTY_CREW.others;
      return {
        count: same.reduce((sum, lever) => sum + lever.count, 0),
        salary: same[0]?.monthlySalary ?? empty.salary,
      };
    };
    const hasExtra = next.some((lever) => lever.kind === "extra_sales");
    if (hires.length > 0 && hasExtra) setTab("combined");
    else if (hires.length > 0) setTab("hiring");
    else if (hasExtra) setTab("sales");
    else setTab("suggestions");
    setCrew({ graduates: rowOf(true), others: rowOf(false) });
    if (hires[0]) setStartOn(hires[0].startOn);
    setSales(extraEuro);
  }

  function chooseTab(next: SimulatorTab) {
    setTab(next);
    if (next === "suggestions") {
      setCrew(EMPTY_CREW);
      setSales(0);
    }
  }

  const word = light === "clear" ? "Green" : light === "fixable" ? "Amber" : "Red";
  const roInk =
    light === "clear" ? "text-good" : light === "fixable" ? "text-amber" : "text-off-track";
  const wash =
    light === "clear" ? "bg-good-bg" : light === "fixable" ? "bg-amber-bg" : "bg-off-track-bg";
  const deadline = /^\d/.test(operation.deadlineHeadline)
    ? `${operation.deadlineHeadline} ${operation.cruiseYear}`
    : operation.deadlineHeadline;
  const latestFile = known.at(-1)?.file ?? "the latest balance";

  return (
    <main
      className="mx-auto flex w-full max-w-[1440px] flex-col gap-2 px-5 pt-2.5"
      style={{ paddingBottom: dockPad }}
      data-panel="ready"
    >
      <header
        className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 transition-opacity ${switching ? "opacity-50" : ""}`}
        aria-busy={switching}
      >
        <h1 className="font-display text-[22px] font-semibold tracking-[-0.02em]">
          <TitleSelect
            label="Company"
            value={company}
            options={companies.map((choice) => ({ value: choice.id, label: choice.companyName }))}
            onChange={openCompany}
            className="-ml-1.5 font-semibold"
          />
        </h1>
        <span className="font-display text-lg text-line" aria-hidden>
          /
        </span>
        {notices.length > 1 ? (
          <TitleSelect
            label="Notice"
            value={company}
            options={notices.map((choice) => ({ value: choice.id, label: choice.callCode }))}
            onChange={openCompany}
            className="font-display text-lg text-soft"
          />
        ) : (
          <p className="font-display text-lg text-soft">{operation.callCode}</p>
        )}
        <span className="font-display text-lg text-line" aria-hidden>
          /
        </span>
        <p className="font-display text-lg text-soft">Threshold {operation.thresholdPct}%</p>
        <span className="self-center rounded-full bg-amber-bg px-2 py-0.5 text-[11px] font-semibold text-amber">
          Synthetic data
        </span>
        <p className="ml-auto flex items-baseline gap-1 text-sm text-soft">
          Data
          <TitleSelect
            label="Data year"
            value={asOf}
            options={(["Q1", "Q2", "Q3"] as const).map((id) => ({
              value: id,
              label: `${operation.cruiseYear} · up to ${id}`,
            }))}
            onChange={(id) => chooseQuarter(id as AsOfId)}
            className="font-display text-lg font-semibold"
          />
        </p>
      </header>

      <section id="overview" className="scroll-mt-24">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-line bg-elevated px-4 py-2.5">
            <span className="flex flex-col gap-1.5 rounded-[20px] bg-panel2 px-2 py-2" aria-hidden>
              <Light on={light === "clear"} color="var(--light)" />
              <Light on={light === "fixable"} color="var(--amber-dot)" />
              <Light on={light === "lost"} color="var(--red-dot)" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold tracking-[0.04em] text-action uppercase">
                Current position · {operation.figuresTo}
              </p>
              <p className="mt-0.5 text-xs text-soft">From {documentCount} documents</p>
              <p className="text-xs break-words text-soft">Latest: {latestFile}</p>
              <p className={`mt-1 text-sm font-semibold text-pretty ${roInk}`}>
                {word} · {operation.amberTitle}
              </p>
            </div>
          </div>
          <Kpi
            label={`Projected RO for ${operation.cruiseYear}`}
            ink={roInk}
            wash={wash}
            before={simulation ? formatPercent(simulation.before.roPct) : null}
            after={simulation ? formatPercent(simulation.after.roPct) : null}
            tone={simulation ? simTone(simulation, operation.thresholdPct) : null}
            onVerify={() => setOpen({ title: "Projected RO", lines: operation.cutLines })}
            note={<>Target ≥ {operation.thresholdPct}% · best 2 indicators</>}
          >
            <p className={`num font-display text-[22px] font-bold ${roInk}`}>
              <CountUp value={operation.roPct} kind="percent" />
            </p>
          </Kpi>
          <Kpi
            label={operation.cutEuro === 0 ? "No cut expected" : "Cut expected"}
            ink={operation.cutEuro === 0 ? "text-good" : "text-cut"}
            wash={wash}
            before={simulation ? formatEuro(simulation.before.cutEuro) : null}
            after={simulation ? formatEuro(simulation.after.cutEuro) : null}
            tone={simulation ? simTone(simulation, operation.thresholdPct) : null}
            onVerify={() => setOpen({ title: "Cut expected", lines: operation.cutLines })}
            note={
              <>
                {formatPp(operation.penaltyPp)} = {formatEuro(operation.cutEuro)} ·{" "}
                {formatEuro(operation.eligibleEuro)} eligible
              </>
            }
          >
            <p
              className={`num font-display text-[22px] font-bold ${operation.cutEuro === 0 ? "text-good" : "text-cut"}`}
            >
              <CountUp value={operation.cutEuro} kind="euro" />
            </p>
          </Kpi>
          <Kpi
            label="Deadline to act"
            ink="text-ink"
            wash={wash}
            onVerify={() =>
              setOpen({
                title: "Deadline to act",
                lines: [operation.deadlineSentence, knownThen(input, view)],
              })
            }
            note={operation.deadlineSentence}
          >
            <p className="font-display text-[22px] font-bold tracking-[-0.02em]">{deadline}</p>
          </Kpi>
        </div>
      </section>

      <section
        aria-labelledby="targets-title"
        className="rounded-2xl border border-line p-3"
        style={{ background: "var(--tray)" }}
      >
        <h2
          id="targets-title"
          className="px-1 pb-2 font-display text-lg font-semibold tracking-[-0.01em]"
        >
          Targets{" "}
          <span className="font-normal text-soft">(The result is the average of the best 2)</span>
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {order.map((code) => {
            const item = operation.indicators.find((indicator) => indicator.code === code);
            if (!item) return null;
            const state = indicatorState(item.ratioPct);
            const after = simulation?.after.indicators.find((indicator) => indicator.code === code);
            const changed = Boolean(
              after && formatPercent(after.ratioPct) !== formatPercent(item.ratioPct),
            );
            const people =
              code === "RPR003"
                ? operation.headcountToday
                : code === "RSR23"
                  ? qualifiedPeople
                  : null;
            const border = changed
              ? "var(--accent2)"
              : item.countsInRo
                ? "var(--accent)"
                : "var(--border)";
            const dot =
              state === "on_track"
                ? "var(--light)"
                : state === "at_risk"
                  ? "var(--amber-dot)"
                  : "var(--red-dot)";
            // Counting targets carry the full state tint; the rest a softer one.
            const tint = item.countsInRo ? "var(--tint)" : "calc(var(--tint) * 0.65)";
            return (
              <article
                key={code}
                className={`rounded-2xl border p-3 text-ink ${changed || item.countsInRo ? "ring-1" : ""}`}
                style={{
                  borderColor: border,
                  ["--tw-ring-color" as string]: border,
                  background: `color-mix(in srgb, ${dot} ${tint}, var(--panel))`,
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex shrink-0 flex-col items-center gap-1.5">
                    <TargetRing ratioPct={item.ratioPct} state={state} />
                    {changed && after ? (
                      <p className="flex w-fit rounded-full bg-action px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-on-accent">
                        Sim {formatPercent(after.ratioPct)}{" "}
                        {after.ratioPct >= item.ratioPct ? "↑" : "↓"}
                      </p>
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold tracking-wide whitespace-nowrap uppercase">
                        {shortName[code]}
                      </p>
                      {item.countsInRo ? (
                        <span className="inline-flex shrink-0 rounded-full bg-sim px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-action">
                          ★ BEST 2
                        </span>
                      ) : (
                        <span className="shrink-0 text-[10px] whitespace-nowrap text-soft">
                          not counting
                        </span>
                      )}
                    </div>
                    <p className="num mt-1 text-lg font-bold text-pretty min-[720px]:text-xl">
                      {code === "RPR001" || code === "RPR002"
                        ? formatEuro(item.projected)
                        : `${formatEti(item.projected, 2)} FTE`}
                    </p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="flex items-center gap-1.5 text-sm whitespace-nowrap">
                        <span
                          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: dot }}
                        />
                        <span
                          className={
                            state === "on_track"
                              ? "text-good"
                              : state === "at_risk"
                                ? "text-amber"
                                : "text-off-track"
                          }
                        >
                          {stateLabel(state)}
                        </span>
                      </p>
                      <VerifyLink
                        onClick={() =>
                          setOpen({
                            title: item.label,
                            lines: [
                              ...item.lines,
                              ...item.sources.map(
                                (source) => `Source: ${source.file}, ${source.location}.`,
                              ),
                            ],
                          })
                        }
                      />
                    </div>
                    <p className="mt-0.5 text-[13px] text-pretty text-soft">
                      {code === "RPR001" || code === "RPR002"
                        ? `growth ${signed(formatPercent(item.assessed), item.assessed)} of ${signed(formatPercent(item.target), item.target)}`
                        : `created ${signed(formatEti(item.assessed, 2), item.assessed)} of ${signed(formatEti(item.target, 2), item.target)} FTE${people === null ? "" : ` · ${people} people now`}`}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-2 min-[1100px]:grid-cols-12">
        <article className="flex min-h-[420px] flex-col rounded-[18px] border border-line bg-elevated p-3.5 shadow-[var(--shadow)] min-[1100px]:col-span-7">
          <QuarterChart
            points={points}
            threshold={operation.thresholdPct}
            todayId={
              snaps.at(-1)?.quarter.quarter ? `Q${snaps.at(-1)?.quarter.quarter}` : "year-end"
            }
            simulated={simulated}
            selected={selected}
            onSelect={(id) => setSelected((current) => (current === id ? null : id))}
          />
        </article>
        <div className="min-h-0 min-w-0 min-[1100px]:col-span-5 min-[1100px]:self-start">
          <SimulatorPanel
            tab={tab}
            onTab={chooseTab}
            paths={paths}
            onApply={apply}
            crew={crew}
            onCrew={setCrew}
            startOn={startOn}
            months={monthOptions(input.contract.cruiseYear)}
            onStart={setStartOn}
            sales={sales}
            onSales={setSales}
            needed={needed}
            levers={levers}
            simulation={simulation}
            nowRo={operation.roPct}
            nowCut={operation.cutEuro}
            threshold={operation.thresholdPct}
            halo={halo}
            onReset={() => {
              setCrew(EMPTY_CREW);
              setSales(0);
              setTab("suggestions");
              setStartOn(defaultStartOn(view.referenceDate, input.contract.cruiseYear));
            }}
          />
        </div>
      </div>

      <ChatBar
        suggestions={SUGGESTED_QUESTIONS}
        onAsk={(question) => askPanel(question, input, view.referenceDate, lexicon)}
        onLevers={apply}
      />

      <VerifyDrawer
        title={open?.title ?? null}
        lines={open?.lines ?? []}
        targetsSource={operation.targetsSource}
        onClose={() => setOpen(null)}
      />
    </main>
  );
}

function buildPoints(
  snaps: { quarter: { quarter: number; file: string }; snap: ReturnType<typeof projectQuarter> }[],
  operation: OperationResult,
  light: "clear" | "fixable" | "lost",
): ChartPoint[] {
  const year = operation.cruiseYear;
  const quarterPoints: ChartPoint[] = snaps.map((item, index) => {
    const id = `Q${item.quarter.quarter}`;
    const previous = index === 0 ? null : snaps[index - 1].snap;
    const current = index === snaps.length - 1;
    return {
      id,
      axis: index === 0 ? `${id} '${String(year).slice(2)}` : id,
      roPct: item.snap.roPct,
      tone: pointTone(item.snap.roPct, operation.thresholdPct, current, light),
      explain: {
        id,
        kicker: `${id} ${year} · projected to year end`,
        roPct: item.snap.roPct,
        delta: previous ? item.snap.roPct - previous.roPct : null,
        cutEuro: null,
        sentence: `Projected to 31 Dec from this quarter. Result ${formatPercent(item.snap.roPct)}.${bestLine(item.snap.indicators)}`,
        rows: rowsOf(item.snap.indicators, previous?.indicators ?? null),
        sources: filesOf(item.snap.indicators, item.quarter.file),
      },
    };
  });
  const last = snaps.at(-1);
  quarterPoints.push({
    id: "year-end",
    axis: `Year end ${year}`,
    roPct: operation.yearEndRoPct,
    tone: pointTone(operation.yearEndRoPct, operation.thresholdPct, true, light),
    explain: {
      id: "year-end",
      kicker: `Year end ${year} · if nothing changes`,
      roPct: operation.yearEndRoPct,
      delta: last ? operation.yearEndRoPct - last.snap.roPct : null,
      cutEuro: null,
      sentence: `This is the year-end projection: result ${formatPercent(operation.roPct)}, cut ${formatEuro(operation.cutEuro)}.`,
      rows: rowsOf(operation.indicators, last?.snap.indicators ?? null),
      sources: filesOf(operation.indicators, last?.quarter.file ?? ""),
    },
  });
  return quarterPoints;
}

function pointTone(
  ro: number,
  threshold: number,
  current: boolean,
  light: "clear" | "fixable" | "lost",
): string {
  if (ro >= threshold) return "var(--light)";
  if (current && light === "fixable") return "var(--amber-dot)";
  return "var(--red-dot)";
}

function simTone(simulation: SimulationResult, threshold: number): "good" | "warn" | "bad" {
  if (simulation.after.roPct >= threshold) return "good";
  if (simulation.after.cutEuro < simulation.before.cutEuro) return "warn";
  return "bad";
}

function Light({ on, color }: { on: boolean; color: string }) {
  return (
    <span
      className="block h-[18px] w-[18px] rounded-full"
      style={{
        background: on ? color : "var(--dim)",
        boxShadow: on
          ? `0 0 0 3px color-mix(in srgb, ${color} 20%, transparent), 0 0 12px ${color}`
          : undefined,
      }}
    />
  );
}

function VerifyLink({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-xs font-medium text-action">
      Verify
    </button>
  );
}

function Kpi({
  label,
  ink,
  children,
  before,
  after,
  tone,
  note,
  onVerify,
  wash,
}: {
  label: string;
  ink: string;
  wash: string;
  children: ReactNode;
  before?: string | null;
  after?: string | null;
  tone?: "good" | "warn" | "bad" | null;
  note: ReactNode;
  onVerify: () => void;
}) {
  const box =
    tone === "good"
      ? "border-ok bg-good-bg text-good"
      : tone === "warn"
        ? "border-amber bg-amber-bg text-amber"
        : "border-cut bg-off-track-bg text-off-track";
  return (
    <article
      className={`flex min-w-0 flex-1 flex-col justify-between gap-1 rounded-2xl px-4 py-2.5 ${wash}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className={`text-sm ${ink}`}>{label}</p>
        <VerifyLink onClick={onVerify} />
      </div>
      <div className="flex flex-wrap items-center gap-x-2">
        <div className={before && after ? "opacity-50" : ""}>{children}</div>
        {before && after ? (
          <p className={`rounded-xl border-2 px-2 leading-snug ${box}`}>
            <span className="font-display text-lg font-bold" aria-hidden>
              →
            </span>{" "}
            <span className="num font-display text-[22px] font-bold">{after}</span>
            <span className="ml-1.5 text-[10px] font-bold tracking-wide">SIMULATED</span>
          </p>
        ) : null}
      </div>
      <p className={`text-xs text-pretty text-soft ${before && after ? "opacity-50" : ""}`}>
        {note}
      </p>
    </article>
  );
}

function companyNameOf(choices: CompanyChoice[], id: string): string | undefined {
  return choices.find((choice) => choice.id === id)?.companyName;
}

function signed(text: string, value: number): string {
  return value >= 0 ? `+${text}` : text;
}
