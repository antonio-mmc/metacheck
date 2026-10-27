"use client";

import { useMotionLive } from "@/components/use-motion-live";
import { formatEuro, formatPercent } from "@/domain/format";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];
const hundredths = new Intl.NumberFormat("en-GB", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export type ChartRow = {
  label: string;
  ratioPct: number;
  countsInRo: boolean;
  change: number | null;
};

export type ChartExplain = {
  id: string;
  kicker: string;
  roPct: number;
  delta: number | null;
  cutEuro: number | null;
  sentence: string;
  rows: ChartRow[];
  sources: string[];
};

export type ChartPoint = {
  id: string;
  axis: string;
  roPct: number;
  tone: string;
  explain: ChartExplain;
};

/** Two decimals, with a sign. A zero has neither an arrow nor a colour. */
export function signedHundredths(value: number): {
  text: string;
  direction: "up" | "down" | "flat";
} {
  const text = hundredths.format(Math.abs(value));
  if (value > 0.005) return { text: `+${text}`, direction: "up" };
  if (value < -0.005) return { text: `−${text}`, direction: "down" };
  return { text, direction: "flat" };
}

export function QuarterChart({
  points,
  threshold,
  todayId,
  simulated,
  selected,
  onSelect,
}: {
  points: ChartPoint[];
  threshold: number;
  todayId: string;
  simulated: { roPct: number; explain: ChartExplain } | null;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const live = useMotionLive();
  const calm = !live;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const next = {
        w: Math.round(entry.contentRect.width),
        h: Math.round(entry.contentRect.height),
      };
      setSize((current) => (current.w === next.w && current.h === next.h ? current : next));
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const open =
    simulated && (selected === "sim" || selected === "year-end")
      ? simulated.explain
      : points.find((point) => point.id === selected)?.explain;
  const width = size.w;
  const height = size.h;
  const left = 78;
  const right = 108;
  const top = 36;
  const bottom = 52;
  const values = [...points.map((point) => point.roPct), ...(simulated ? [simulated.roPct] : [])];
  const { min, max } = scale(values);
  const plotW = Math.max(1, width - left - right);
  const plotH = Math.max(1, height - top - bottom);
  const last = points.length - 1;
  const xAt = (index: number) =>
    left + (points.length === 1 ? plotW / 2 : (index / (points.length - 1)) * plotW);
  const yAt = (value: number) => top + ((max - value) / (max - min)) * plotH;
  const openIndex = points.findIndex((point) => point.id === selected);
  const anchor =
    simulated && (selected === "sim" || selected === "year-end")
      ? { x: xAt(last), y: yAt(simulated.roPct) }
      : openIndex >= 0
        ? { x: xAt(openIndex), y: yAt(points[openIndex]!.roPct) }
        : null;
  const ticks = [];
  for (let tick = max; tick >= min; tick -= 20) ticks.push(tick);
  const todayIndex = points.findIndex((point) => point.id === todayId);

  const solid =
    width > 0
      ? points
          .slice(0, -1)
          .map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index)} ${yAt(point.roPct)}`)
          .join(" ")
      : "";
  const area =
    points.length > 1 && solid
      ? `${solid} L ${xAt(Math.max(0, last - 1))} ${yAt(min)} L ${xAt(0)} ${yAt(min)} Z`
      : "";
  const bridge =
    points.length > 1 && width > 0
      ? `M ${xAt(last - 1)} ${yAt(points[last - 1].roPct)} L ${xAt(last)} ${yAt(points[last].roPct)}`
      : "";
  const simPath =
    simulated && points.length > 1 && width > 0
      ? `M ${xAt(last - 1)} ${yAt(points[last - 1].roPct)} L ${xAt(last)} ${yAt(simulated.roPct)}`
      : "";

  function toggle(id: string) {
    onSelect(id);
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">RO until the target year</h2>
          <p className="text-sm text-soft">Year-end projection as of each quarter</p>
        </div>
        <p className="mt-1 text-xs text-soft">
          Click a point or a change to see what moved the result.
        </p>
        <div ref={box} className="relative mt-1 min-h-[140px] w-full flex-1">
          {width > 0 && height > 0 ? (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="absolute inset-0 block"
            >
              {ticks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={left}
                    x2={width - right}
                    y1={yAt(tick)}
                    y2={yAt(tick)}
                    stroke="var(--grid)"
                    strokeWidth="1"
                  />
                  <text
                    x={left - 16}
                    y={yAt(tick) + 4}
                    textAnchor="end"
                    fill={tick === threshold ? "var(--red-dot)" : "var(--muted)"}
                    fontSize="12"
                    fontWeight={tick === threshold ? 700 : 400}
                  >
                    {tick}%
                  </text>
                </g>
              ))}
              <line
                x1={left}
                x2={width - right}
                y1={yAt(threshold)}
                y2={yAt(threshold)}
                stroke="var(--red-dot)"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              {todayIndex >= 0 ? (
                <line
                  x1={xAt(todayIndex)}
                  x2={xAt(todayIndex)}
                  y1={top}
                  y2={height - bottom}
                  stroke="var(--accent2)"
                  strokeWidth="1.5"
                  strokeDasharray="2 4"
                />
              ) : null}
              {area ? <path d={area} fill="var(--accent2)" opacity="0.12" /> : null}
              {solid ? (
                <motion.path
                  d={solid}
                  fill="none"
                  stroke="var(--accent2)"
                  strokeWidth="3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  initial={calm ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={calm ? { duration: 0 } : { duration: 0.9, ease: easeOut }}
                />
              ) : null}
              {bridge ? (
                <path
                  d={bridge}
                  fill="none"
                  stroke="var(--accent2)"
                  strokeWidth="3"
                  strokeDasharray="7 5"
                />
              ) : null}
              {simPath ? (
                <path
                  d={simPath}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                />
              ) : null}
              {points.map((point, index) => (
                <g
                  key={point.id}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${point.axis} ${formatPercent(point.roPct)}`}
                  aria-pressed={selected === point.id}
                  onClick={() => toggle(point.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggle(point.id);
                    }
                  }}
                >
                  <circle cx={xAt(index)} cy={yAt(point.roPct)} r="16" fill="transparent" />
                  <circle
                    cx={xAt(index)}
                    cy={yAt(point.roPct)}
                    r={selected === point.id ? 9 : 6.5}
                    fill={point.tone}
                    stroke={selected === point.id ? "var(--accent2)" : "none"}
                    strokeWidth="3"
                  />
                  {index === last ? (
                    <text
                      x={width - 6}
                      y={Math.min(height - bottom - 4, yAt(point.roPct) + 20)}
                      textAnchor="end"
                      fill="var(--ink)"
                      fontSize="14"
                      fontWeight="700"
                    >
                      Now {formatPercent(point.roPct)}
                    </text>
                  ) : (
                    <text
                      x={index === 0 ? xAt(index) + 14 : xAt(index)}
                      y={yAt(point.roPct) - 12}
                      textAnchor={index === 0 ? "start" : "middle"}
                      fill="var(--ink)"
                      fontSize="14"
                      fontWeight="700"
                    >
                      {formatPercent(point.roPct)}
                    </text>
                  )}
                  <text
                    x={index === last ? width - 6 : xAt(index)}
                    y={height - 14}
                    textAnchor={index === last ? "end" : "middle"}
                    fill={index === last ? "var(--ink)" : "var(--muted)"}
                    fontSize="12"
                    fontWeight={index === last ? 700 : 400}
                  >
                    {point.axis}
                  </text>
                </g>
              ))}
              {!open &&
                points.slice(1).map((point, index) => {
                  const previous = points[index];
                  const delta = signedHundredths(point.roPct - previous.roPct);
                  if (delta.direction === "flat") return null;
                  const midX = (xAt(index) + xAt(index + 1)) / 2;
                  const midY = (yAt(previous.roPct) + yAt(point.roPct)) / 2;
                  const up = delta.direction === "up";
                  return (
                    <g
                      key={`${point.id}-delta`}
                      className="cursor-pointer"
                      onClick={() => toggle(point.id)}
                    >
                      <rect
                        x={midX - 32}
                        y={midY - 10}
                        width="64"
                        height="20"
                        rx="10"
                        fill={up ? "var(--good-bg)" : "var(--bad-bg)"}
                      />
                      <text
                        x={midX}
                        y={midY + 4}
                        textAnchor="middle"
                        fill={up ? "var(--ok)" : "var(--cut)"}
                        fontSize="13"
                        fontWeight="700"
                      >
                        {up ? "▲" : "▼"} {delta.text}
                      </text>
                    </g>
                  );
                })}
              {todayIndex >= 0 ? (
                <g>
                  <rect
                    x={xAt(todayIndex) - 26}
                    y={height - 46}
                    width="52"
                    height="18"
                    rx="9"
                    fill="var(--accent)"
                  />
                  <text
                    x={xAt(todayIndex)}
                    y={height - 33}
                    textAnchor="middle"
                    fill="var(--on-accent)"
                    fontSize="12"
                    fontWeight="700"
                  >
                    Today
                  </text>
                </g>
              ) : null}
              {simulated ? (
                <g
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Simulated ${formatPercent(simulated.roPct)}`}
                  aria-pressed={selected === "sim"}
                  onClick={() => toggle("sim")}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      toggle("sim");
                    }
                  }}
                >
                  <motion.circle
                    cx={xAt(last)}
                    cy={yAt(simulated.roPct)}
                    r="7"
                    fill="var(--panel)"
                    stroke="var(--accent)"
                    strokeWidth="3"
                    strokeDasharray="4 3"
                    initial={false}
                    animate={{ cy: yAt(simulated.roPct) }}
                    transition={calm ? { duration: 0 } : { duration: 0.6, ease: easeOut }}
                  />
                  <text
                    x={width - 6}
                    y={Math.max(16, yAt(simulated.roPct) - 14)}
                    textAnchor="end"
                    fill="var(--accent)"
                    fontSize="14"
                    fontWeight="700"
                  >
                    Sim {formatPercent(simulated.roPct)}
                  </text>
                </g>
              ) : null}
            </svg>
          ) : null}
          {open && anchor && width > 0 ? (
            <Explain
              explain={open}
              threshold={threshold}
              anchor={anchor}
              box={{ w: width, h: height }}
              onClose={() => onSelect(selected ?? open.id)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

const CARD_W = 340;
const GAP = 18;

/** A card pinned beside the clicked point. It opens towards the side with room and never resizes the panel. */
function Explain({
  explain,
  threshold,
  anchor,
  box,
  onClose,
}: {
  explain: ChartExplain;
  threshold: number;
  anchor: { x: number; y: number };
  box: { w: number; h: number };
  onClose: () => void;
}) {
  const delta = explain.delta === null ? null : signedHundredths(explain.delta);
  const card = useRef<HTMLElement>(null);
  const toRight = anchor.x + GAP + CARD_W <= box.w;
  const left = toRight ? anchor.x + GAP : Math.max(0, anchor.x - GAP - CARD_W);
  const top = Math.max(0, Math.min(anchor.y - 48, box.h - 320));

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    function onDown(event: PointerEvent) {
      const target = event.target as Element | null;
      if (!target || card.current?.contains(target)) return;
      if (target.closest('svg [role="button"]')) return;
      onClose();
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [onClose]);

  return (
    <aside
      ref={card}
      aria-label={explain.kicker}
      className="card-in absolute z-10 max-h-full overflow-y-auto rounded-xl border border-line bg-elevated p-4 shadow-[var(--pop-shadow)]"
      style={{ left, top, width: Math.min(CARD_W, box.w) }}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <p className="text-[10px] font-semibold tracking-[0.04em] text-soft uppercase">
            {explain.kicker}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mt-2 -mr-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-soft hover:bg-panel2 hover:text-ink"
          >
            <CloseIcon />
          </button>
        </div>
        <p
          className="font-display text-2xl font-bold"
          style={{ color: explain.roPct >= threshold ? "var(--ok)" : "var(--cut)" }}
        >
          {formatPercent(explain.roPct)}
        </p>
        {delta && delta.direction !== "flat" ? (
          <p
            className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
              delta.direction === "up" ? "bg-good-bg text-ok" : "bg-off-track-bg text-cut"
            }`}
          >
            {delta.direction === "up" ? "▲" : "▼"} {delta.text} p.p. vs before
          </p>
        ) : delta ? (
          <p className="mt-1 text-xs text-soft">{delta.text} p.p. vs before</p>
        ) : null}
        {explain.cutEuro !== null ? (
          <p className="mt-1 text-xs">Cut {formatEuro(explain.cutEuro)}</p>
        ) : null}
        {explain.sources.includes("Simulator settings") ? null : (
          <p className="mt-2 text-xs text-pretty text-ink">{explain.sentence}</p>
        )}
      </div>
      <div className="min-w-0">
        <table className="mt-3 w-full text-left text-xs">
          <caption className="sr-only">Indicators at this point</caption>
          <thead className="text-[10px] tracking-[0.04em] text-soft uppercase">
            <tr>
              <th className="py-1 font-medium">Indicator</th>
              <th className="py-1 text-right font-medium">Now</th>
              <th className="py-1 text-right font-medium">Change</th>
            </tr>
          </thead>
          <tbody>
            {explain.rows.map((row) => {
              const change = row.change === null ? null : signedHundredths(row.change);
              return (
                <tr key={row.label} className="border-t border-line">
                  <th className="py-1 pr-2 font-medium text-pretty">
                    <span
                      className="mr-1 inline-block h-2 w-2 rounded-full"
                      style={{
                        background:
                          row.ratioPct >= 100
                            ? "var(--light)"
                            : row.ratioPct >= 70
                              ? "var(--amber-dot)"
                              : "var(--red-dot)",
                      }}
                    />
                    {row.label}
                    {row.countsInRo ? (
                      <span className="ml-1 rounded-full bg-sim px-1.5 py-0.5 text-[9px] font-semibold text-action">
                        BEST 2
                      </span>
                    ) : null}
                  </th>
                  <td className="num py-1 text-right">{formatPercent(row.ratioPct)}</td>
                  <td
                    className={`num py-1 text-right ${
                      change === null || change.direction === "flat"
                        ? "text-soft"
                        : change.direction === "up"
                          ? "text-ok"
                          : "text-cut"
                    }`}
                  >
                    {change === null
                      ? "—"
                      : change.direction === "flat"
                        ? change.text
                        : `${change.direction === "up" ? "▲" : "▼"} ${change.text}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-pretty text-soft">Source: {explain.sources.join(" · ")}</p>
      </div>
    </aside>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path
        d="M3.5 3.5l9 9M12.5 3.5l-9 9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function scale(values: number[]) {
  let min = 20;
  let max = 90;
  if (values.length === 0) return { min, max };
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  if (lo < min) min = Math.floor(lo / 10) * 10;
  if (hi > max) max = Math.ceil(hi / 10) * 10;
  return { min, max };
}
