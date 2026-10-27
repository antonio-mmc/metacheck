"use client";

import { useMotionLive } from "@/components/use-motion-live";
import { formatPercent } from "@/domain/format";
import type { IndicatorState } from "@/domain/panel";
import { motion } from "motion/react";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stroke: Record<IndicatorState, string> = {
  on_track: "var(--light)",
  at_risk: "var(--amber-dot)",
  off_track: "var(--red-dot)",
};

const ink: Record<IndicatorState, string> = {
  on_track: "var(--good-text)",
  at_risk: "var(--warn-text)",
  off_track: "var(--bad-text)",
};

export function TargetRing({ ratioPct, state }: { ratioPct: number; state: IndicatorState }) {
  const live = useMotionLive();
  const calm = !live;
  const size = 84;
  const radius = 32;
  const width = 11;
  const center = size / 2;
  const length = 2 * Math.PI * radius;
  const shown = Math.max(0, Math.min(1, ratioPct / 100));

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-14 w-14 shrink-0 overflow-visible min-[720px]:h-[92px] min-[720px]:w-[92px]" aria-hidden>
      <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--dim)" strokeWidth={width} />
      <motion.circle
        key={calm ? "still" : "run"}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={stroke[state]}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={length}
        transform={`rotate(-90 ${center} ${center})`}
        initial={calm ? false : { strokeDashoffset: length }}
        animate={{ strokeDashoffset: length * (1 - shown) }}
        transition={calm ? { duration: 0 } : { duration: 0.9, ease: easeOut }}
      />
      <text
        x={center}
        y={center - 1}
        textAnchor="middle"
        fill={ink[state]}
        fontSize="12"
        fontWeight="700"
        fontFamily="var(--font-display), sans-serif"
      >
        {formatPercent(ratioPct)}
      </text>
      <text
        x={center}
        y={center + 12}
        textAnchor="middle"
        fill="var(--muted)"
        fontSize="8"
        fontFamily="var(--font-text), sans-serif"
      >
        of target
      </text>
    </svg>
  );
}
