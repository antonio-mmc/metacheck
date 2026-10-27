"use client";

import { ingestUpload } from "@/app/actions";
import { DocumentsMenu } from "@/components/documents/documents-menu";
import { WhatAiSees } from "@/components/documents/what-ai-sees";
import { ConfirmCall } from "@/components/panel/overview";
import { Monitor } from "@/components/panel/monitor";
import type { DocumentsCard } from "@/domain/documents";
import type { DocumentCheckCard } from "@/ingest/document-checks";
import type { EngineInput, QuarterInput } from "@/domain/engine";
import type { MaskLexicon, MaskReport } from "@/ingest/mask";
import { ruleCardSchema, type RuleCard } from "@/domain/rule-card";
import saved2026 from "@/data/rule-cards/MPR-2026-6.json";
import Image from "next/image";
import { useEffect, useState, type DragEvent } from "react";

const freshCard = saved2026 as RuleCard;
type Menu = "documents" | "mask" | null;

export type CompanyChoice = { id: string; companyName: string; callCode: string };

export function AppShell({
  company,
  choices,
  input,
  checks,
  documents,
  masked,
  lexicon,
  note,
  blocked,
}: {
  company: string;
  choices: CompanyChoice[];
  input: EngineInput | null;
  checks: DocumentCheckCard[];
  documents: DocumentsCard;
  masked: MaskReport;
  lexicon: MaskLexicon;
  note: string | null;
  blocked: string | null;
}) {
  const [active, setActive] = useState("overview");
  const [menu, setMenu] = useState<Menu>(null);
  const [drawer, setDrawer] = useState(false);
  const [adding, setAdding] = useState(false);
  const [engine, setEngine] = useState(input);
  const [cards, setCards] = useState(checks);
  const [fresh, setFresh] = useState<string | null>(null);
  const [newCall, setNewCall] = useState(false);
  const [dropMessage, setDropMessage] = useState<string | null>(null);
  const [halo, setHalo] = useState(false);

  useEffect(() => {
    const mark = () => {
      if (menu) return;
      const line = window.innerHeight * 0.35;
      const simulator = document.getElementById("simulator");
      setActive(simulator && simulator.getBoundingClientRect().top <= line ? "simulator" : "overview");
    };
    mark();
    window.addEventListener("scroll", mark, { passive: true });
    return () => window.removeEventListener("scroll", mark);
  }, [menu, engine]);

  function setTheme(next: boolean) {
    if (next) document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function showSimulator() {
    const node = document.getElementById("simulator");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    setActive("simulator");
    setMenu(null);
    setHalo(true);
    window.setTimeout(() => setHalo(false), 1600);
  }

  function toggleMenu(next: Menu) {
    setDrawer(false);
    setMenu((current) => (current === next ? null : next));
  }

  async function takeFile(file: File) {
    setAdding(true);
    setDropMessage(null);
    const body = new FormData();
    body.set("file", file);
    body.set("company", company);
    try {
      const patch = await ingestUpload(body);
      if (patch.error) setDropMessage(patch.error);
      if (patch.check) {
        setCards((current) => [...current.filter((item) => item.filename !== patch.filename), patch.check!]);
        setFresh(patch.filename);
      }
      setEngine((current) => {
        if (!current) return current;
        let next = current;
        if (patch.people && patch.conventionalHours) {
          next = { ...next, people: patch.people, conventionalHours: patch.conventionalHours };
        }
        if (patch.quarter) next = { ...next, quarters: mergeQuarter(next.quarters, patch.quarter) };
        return next;
      });
      if (patch.callCode && patch.callCode !== engine?.contract.callCode) setNewCall(true);
      setDrawer(false);
    } catch {
      setDropMessage("This file could not be read. Replace it with the original export.");
    } finally {
      setAdding(false);
    }
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void takeFile(file);
  }

  const fileCount = documents.entries.filter((entry) => entry.tone !== "missing").length;

  function sectionNav() {
    return (
      <ul className="flex w-max items-center gap-1">
        <li>
          <a
            href="#overview"
            aria-current={menu === null && active === "overview" ? "true" : undefined}
            onClick={() => setMenu(null)}
            className={tabClass(menu === null && active === "overview")}
          >
            <Dot color={menu === null && active === "overview" ? "var(--accent)" : "var(--nav-dot)"} />
            Overview
          </a>
        </li>
        <li>
          <a
            href="#simulator"
            aria-current={menu === null && active === "simulator" ? "true" : undefined}
            onClick={(event) => {
              event.preventDefault();
              showSimulator();
            }}
            className={tabClass(menu === null && active === "simulator")}
          >
            <Dot color={menu === null && active === "simulator" ? "var(--accent)" : "var(--nav-dot)"} />
            Simulator
          </a>
        </li>
        <li>
          <button
            type="button"
            aria-expanded={menu === "documents"}
            onClick={() => toggleMenu("documents")}
            className={tabClass(menu === "documents")}
          >
            <Dot color={menu === "documents" ? "var(--accent)" : "var(--nav-dot)"} />
            Documents · {fileCount}
            <Caret open={menu === "documents"} />
          </button>
        </li>
        <li>
          <button type="button" aria-expanded={menu === "mask"} onClick={() => toggleMenu("mask")} className={tabClass(menu === "mask")}>
            <Dot color="var(--light)" />
            What the AI sees
            <Caret open={menu === "mask"} />
          </button>
        </li>
      </ul>
    );
  }

  return (
    <>
      {menu || drawer ? (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default"
          aria-label="Close menu"
          onClick={() => {
            setMenu(null);
            setDrawer(false);
          }}
        />
      ) : null}
      <header className="surface-alt fixed inset-x-0 top-0 z-40 border-b border-line bg-nav text-nav-ink">
        <div className="flex items-center justify-between gap-2 px-3 pt-2 min-[1100px]:hidden">
          <Brand />
          <div className="flex shrink-0 items-center gap-2">
            <ThemeSwitch onLight={() => setTheme(false)} onDark={() => setTheme(true)} />
            <AddDocument
              onClick={() => {
                setMenu(null);
                setDrawer((open) => !open);
              }}
            />
          </div>
        </div>
        <nav aria-label="Sections" className="overflow-x-auto px-3 pt-2 pb-2 [scrollbar-width:none] min-[1100px]:hidden">
          {sectionNav()}
        </nav>
        <div className="hidden h-[60px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-[max(1.25rem,calc((100vw-1440px)/2+1.25rem))] min-[1100px]:grid">
          <div className="justify-self-start">
            <Brand />
          </div>
          <nav aria-label="Sections" className="min-w-0 overflow-x-auto [scrollbar-width:none] min-[1100px]:justify-self-center">
            {sectionNav()}
          </nav>
          <div className="flex items-center justify-end gap-2 justify-self-end">
            <ThemeSwitch onLight={() => setTheme(false)} onDark={() => setTheme(true)} />
            <AddDocument
              onClick={() => {
                setMenu(null);
                setDrawer((open) => !open);
              }}
            />
          </div>
        </div>
        {menu === "documents" ? (
          <div className="absolute top-full left-1/2 z-40 mt-2 max-h-[min(72vh,38rem)] w-[min(760px,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-line bg-nav p-4 text-ink shadow-[var(--pop-shadow)]">
            <DocumentsMenu documents={documents} checks={cards} freshFilename={fresh} />
          </div>
        ) : null}
        {menu === "mask" ? (
          <div className="absolute top-full left-1/2 z-40 mt-2 max-h-[min(72vh,38rem)] w-[min(560px,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-line bg-nav p-4 text-ink shadow-[var(--pop-shadow)]">
            <WhatAiSees masked={masked} note={note} />
          </div>
        ) : null}
        {drawer ? (
          <div className="absolute top-full right-3 z-40 mt-1 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-line bg-nav p-4 text-ink shadow-[var(--pop-shadow)]">
            <p className="text-sm font-medium">Add a document</p>
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={onDrop}
              className="mt-3 flex min-h-28 cursor-pointer items-center justify-center rounded-xl border border-dashed border-line px-4 text-center text-sm text-soft hover:bg-panel2"
            >
              {adding ? "Reading…" : "Drop a file here, or click to choose one."}
              <input
                type="file"
                className="sr-only"
                disabled={adding}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void takeFile(file);
                }}
              />
            </label>
            {dropMessage ? <p className="mt-3 text-sm text-pretty">{dropMessage}</p> : null}
          </div>
        ) : null}
      </header>
      <div className="pt-[108px] min-[1100px]:pt-[60px]">
        {newCall ? (
          <div className="mx-auto w-full max-w-[760px] px-5 pt-6">
            <ConfirmCall
              card={ruleCardSchema.parse(freshCard)}
              compared={`This is a new call. The panel stays on ${engine?.contract.callCode ?? "this project"} until you open that project.`}
              onConfirm={() => setNewCall(false)}
            />
          </div>
        ) : engine ? (
          <Monitor
            input={engine}
            lexicon={lexicon}
            documentCount={documents.readCount}
            halo={halo}
            company={company}
            choices={choices}
          />
        ) : (
          <p className="mx-auto max-w-[760px] px-5 pt-20 text-base text-pretty">{blocked}</p>
        )}
      </div>
    </>
  );
}

function Brand() {
  return (
    <span className="flex items-center gap-3">
      <span className="relative block h-8 w-[68px] shrink-0">
        <Image src="/bf-logo-clear.png" alt="BF Consultores" fill priority sizes="68px" className="logo object-contain" />
      </span>
      <span className="h-6 w-px bg-line" aria-hidden />
      <span className="font-display text-lg font-semibold tracking-[-0.01em] whitespace-nowrap">MetaCheck</span>
    </span>
  );
}

function ThemeSwitch({ onLight, onDark }: { onLight: () => void; onDark: () => void }) {
  return (
    <div className="flex items-center rounded-full border border-line bg-panel2 p-0.5" role="group" aria-label="Theme">
      <button
        type="button"
        onClick={onLight}
        className="grid h-[38px] w-[38px] place-items-center rounded-full bg-ink text-elevated transition-colors dark:bg-transparent dark:text-nav-muted dark:hover:text-ink"
      >
        <span className="sr-only">Light theme</span>
        <Sun />
      </button>
      <button
        type="button"
        onClick={onDark}
        className="grid h-[38px] w-[38px] place-items-center rounded-full text-nav-muted transition-colors hover:text-ink dark:bg-ink dark:text-elevated dark:hover:text-elevated"
      >
        <span className="sr-only">Dark theme</span>
        <Moon />
      </button>
    </div>
  );
}

function AddDocument({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 shrink-0 items-center rounded-[10px] bg-action px-4 text-sm font-semibold whitespace-nowrap text-on-accent transition-colors hover:bg-action-hover"
    >
      + Add document
    </button>
  );
}

function tabClass(active: boolean): string {
  return `inline-flex h-11 items-center gap-2 rounded-[10px] px-3.5 text-sm font-semibold whitespace-nowrap ${
    active ? "bg-elevated text-ink shadow-[var(--shadow)]" : "text-nav-muted hover:bg-panel2 hover:text-ink"
  }`;
}

function Dot({ color }: { color: string }) {
  return <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />;
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={`h-3 w-3 ${open ? "rotate-180" : ""}`} aria-hidden>
      <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function mergeQuarter(quarters: QuarterInput[], quarter: QuarterInput): QuarterInput[] {
  const rest = quarters.filter((item) => item.quarter !== quarter.quarter);
  return [...rest, quarter].sort((a, b) => a.quarter - b.quarter);
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="currentColor" d="M14.5 3.2a8.5 8.5 0 1 0 6.3 14.2A8.2 8.2 0 0 1 14.5 3.2z" />
    </svg>
  );
}

function Sun() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
      </g>
    </svg>
  );
}
