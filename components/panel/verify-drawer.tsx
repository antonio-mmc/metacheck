"use client";

import { useMotionLive } from "@/components/use-motion-live";
import { targetsSourceLabel, type TargetsSource } from "@/domain/panel";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

const easeOut: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function VerifyDrawer({
  title,
  lines,
  targetsSource,
  onClose,
}: {
  title: string | null;
  lines: string[];
  targetsSource: TargetsSource;
  onClose: () => void;
}) {
  const live = useMotionLive();
  const calm = !live;
  const open = title !== null;
  const panelRef = useRef<HTMLDivElement>(null);
  const sources = lines.filter((line) => line.startsWith("Source: ")).map((line) => line.slice("Source: ".length));
  const steps = lines.filter((line) => !line.startsWith("Source: "));

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const previously = document.activeElement;
    const focusable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>("button, [href], input, select, textarea") ?? [],
      );

    focusable()[0]?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      if (previously instanceof HTMLElement) previously.focus();
    };
  }, [onClose, open, title]);

  return (
    <AnimatePresence>
      {open && title ? (
        <motion.div
          key="verify-scrim"
          className="fixed inset-0 z-40 bg-scrim"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: calm ? 0.15 : 0.2 }}
        />
      ) : null}
      {open && title ? (
        <motion.div
          key="verify-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-title"
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[28rem] flex-col overflow-y-auto border-l border-line bg-elevated px-6 py-6"
          initial={calm ? { opacity: 0 } : { x: "100%" }}
          animate={calm ? { opacity: 1 } : { x: 0 }}
          exit={calm ? { opacity: 0 } : { x: "100%" }}
          transition={{ duration: calm ? 0.15 : 0.36, ease: easeOut }}
        >
          <div className="flex items-start justify-between gap-3 rounded-2xl bg-action px-5 py-4 text-on-accent">
            <div className="min-w-0">
              <h2 id="verify-title" className="font-display text-lg font-semibold text-balance">
                {title}
              </h2>
              <p className="mt-1 text-sm opacity-85">{targetsSourceLabel(targetsSource)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mt-1 -mr-2 grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-white/15 motion-safe:active:scale-[0.96]"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <p className="mt-6 text-xs font-semibold text-soft">How it is calculated</p>
          <ol className="mt-3 flex flex-col">
            {steps.map((line, index) => (
              <li key={line} className="relative flex gap-3 pb-4 last:pb-0">
                {index < steps.length - 1 ? (
                  <span className="absolute top-7 bottom-1 left-[11px] w-px bg-line" aria-hidden />
                ) : null}
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sim text-xs font-semibold text-action">
                  {index + 1}
                </span>
                <span className="pt-0.5 text-base text-pretty">{line}</span>
              </li>
            ))}
          </ol>
          {sources.length > 0 ? (
            <>
              <p className="mt-6 text-xs font-semibold text-soft">Sources</p>
              <ul className="mt-2 flex flex-col gap-2">
                {sources.map((line) => (
                  <li key={line} className="flex gap-2 rounded-xl bg-panel2 px-3 py-2 text-sm text-pretty">
                    <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0 text-soft" aria-hidden>
                      <path d="M4 1.5h5.5L12.5 4.5V14.5H4z M9.5 1.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
