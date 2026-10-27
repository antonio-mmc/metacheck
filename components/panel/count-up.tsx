"use client";

import { useMotionLive } from "@/components/use-motion-live";
import { formatFigure, type FigureKind } from "@/domain/format";
import { animate } from "motion/react";
import { useLayoutEffect, useState } from "react";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function CountUp({
  value,
  kind,
  delay = 0,
  className,
}: {
  value: number;
  kind: FigureKind;
  delay?: number;
  className?: string;
}) {
  const live = useMotionLive();
  const finalText = formatFigure(kind, value);
  const [animated, setAnimated] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!live) return;

    let stopped = false;
    const controls = animate(0, value, {
      delay,
      duration: 0.8,
      ease: easeOut,
      onUpdate: (latest) => {
        const shown = kind === "euro" || kind === "count" ? Math.round(latest) : latest;
        setAnimated(formatFigure(kind, shown));
      },
    });
    void controls.finished.then(() => {
      if (!stopped) setAnimated(formatFigure(kind, value));
    });

    return () => {
      stopped = true;
      controls.stop();
    };
  }, [delay, kind, live, value]);

  return (
    <span className={`num ${className ?? ""}`}>
      {animated ?? finalText}
    </span>
  );
}
