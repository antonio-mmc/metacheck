"use client";

import type { ChatOutcome } from "@/ai/chat";
import { CONSULTANT_LINE } from "@/domain/rehearsed";
import type { Lever } from "@/domain/simulate";
import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
  sources?: string[];
  fromCache?: boolean;
};

const SAVED = "The model is not reachable right now. The three suggested questions still answer from saved engine figures.";

/** A little above the server's 20 s budget, so the server's own fallback arrives first. */
const CLIENT_BUDGET_MS = 22_000;

/** What the turn is doing, in order. Moves on every few seconds so a long answer never looks stuck. */
const STAGES = ["Reading the figures", "Running the engine", "Checking every number"] as const;
const STAGE_MS = 3_500;

export function ChatBar(props: {
  suggestions: readonly string[];
  onAsk: (question: string) => Promise<ChatOutcome>;
  onLevers: (levers: Lever[]) => void;
}) {
  const { suggestions, onAsk, onLevers } = props;
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [stage, setStage] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sheet, setSheet] = useState(false);
  const [hideTranscript, setHideTranscript] = useState(false);
  const seq = useRef(0);
  const live = useRef(true);
  const transcript = useRef<HTMLDivElement>(null);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  useEffect(() => {
    const node = transcript.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, pending]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setInterval(
      () => setStage((current) => Math.min(current + 1, STAGES.length - 1)),
      STAGE_MS,
    );
    return () => window.clearInterval(timer);
  }, [pending]);

  async function ask(raw: string) {
    const question = raw.trim();
    if (!question || pending) return;
    setDraft("");
    setSheet(true);
    setHideTranscript(false);
    seq.current += 1;
    const userId = seq.current;
    setMessages((current) => [...current, { id: userId, role: "user", text: question }]);
    setStage(0);
    setPending(true);
    let timer = 0;
    try {
      const outcome = await Promise.race([
        onAsk(question),
        new Promise<ChatOutcome>((_, reject) => {
          timer = window.setTimeout(() => reject(new Error("slow")), CLIENT_BUDGET_MS);
        }),
      ]);
      if (!live.current) return;
      if (outcome.levers) onLevers(outcome.levers);
      seq.current += 1;
      setMessages((current) => [
        ...current,
        {
          id: seq.current,
          role: "assistant",
          text: outcome.text,
          sources: outcome.sources,
          fromCache: outcome.fromCache,
        },
      ]);
    } catch {
      if (!live.current) return;
      seq.current += 1;
      setMessages((current) => [
        ...current,
        { id: seq.current, role: "assistant", text: SAVED, fromCache: true },
      ]);
    } finally {
      window.clearTimeout(timer);
      if (live.current) setPending(false);
    }
  }

  const talking = pending || messages.length > 0;
  const showBar = sheet || talking;

  return (
    <>
      <button
        type="button"
        onClick={() => setSheet(true)}
        className={`fixed right-4 bottom-4 z-30 inline-flex h-11 items-center rounded-full bg-action px-4 text-sm font-semibold text-on-accent hover:bg-action-hover min-[721px]:hidden ${
          showBar ? "hidden" : ""
        }`}
      >
        Ask anything
      </button>
      <div
        id="chat-dock"
        className={`surface-alt fixed inset-x-0 bottom-0 z-30 border-t border-line bg-dock px-[max(1.25rem,calc((100vw-1440px)/2+1.25rem))] py-2.5 ${
          showBar ? "" : "max-[720px]:hidden"
        }`}
      >
        <div className="mb-2 flex items-center justify-between min-[721px]:hidden">
          <p className="text-sm font-semibold text-ink">Ask anything</p>
          <button type="button" onClick={() => setSheet(false)} className="text-sm font-medium text-ink">
            Hide
          </button>
        </div>

        {talking && !hideTranscript ? (
          <section
            aria-label="Conversation"
            className="card-in absolute bottom-full left-[max(1.25rem,calc((100vw-1440px)/2+1.25rem))] mb-2.5 w-[min(680px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-line bg-elevated shadow-[var(--pop-shadow)]"
          >
            <header className="flex items-center justify-between gap-3 border-b border-line py-2 pr-2 pl-4">
              <div className="flex items-baseline gap-2.5">
                <h2 className="text-base font-semibold text-ink">Ask the panel</h2>
                <p className="text-xs text-soft">Personal data pseudonymised</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setMessages([])}
                  className="text-xs font-medium text-soft hover:text-ink disabled:opacity-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  aria-label="Hide conversation"
                  onClick={() => setHideTranscript(true)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-soft transition-colors hover:bg-panel2 hover:text-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </header>

            <div ref={transcript} aria-live="polite" className="max-h-[min(30rem,58vh)] overflow-y-auto px-4 py-3">
              <ol className="flex flex-col gap-4">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <li key={message.id} className="card-in ml-auto max-w-[85%]">
                      <p className="rounded-2xl rounded-br-md bg-action px-3.5 py-2 text-pretty text-sm text-on-accent">
                        {message.text}
                      </p>
                    </li>
                  ) : (
                    <Answer key={message.id} message={message} />
                  ),
                )}
              </ol>
              {pending ? (
                <p className="mt-4 flex items-center gap-2 text-sm text-soft" role="status">
                  <span className="flex gap-1" aria-hidden>
                    <span className="chat-dot h-1.5 w-1.5 rounded-full bg-soft" />
                    <span className="chat-dot h-1.5 w-1.5 rounded-full bg-soft" />
                    <span className="chat-dot h-1.5 w-1.5 rounded-full bg-soft" />
                  </span>
                  {STAGES[stage]}…
                </p>
              ) : null}
            </div>
          </section>
        ) : null}

        <form
          aria-busy={pending}
          onSubmit={(event) => {
            event.preventDefault();
            void ask(draft);
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="chat-question">
              Question
            </label>
            <div className="flex h-[46px] min-w-[12rem] flex-1 items-center rounded-xl border border-line bg-elevated pr-1 focus-within:border-action">
              <input
                id="chat-question"
                value={draft}
                disabled={pending}
                autoComplete="off"
                placeholder="Ask anything about this project…"
                onChange={(event) => setDraft(event.target.value)}
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-ink outline-none placeholder:text-soft"
              />
              <button
                type="submit"
                disabled={pending || draft.trim().length === 0}
                aria-label="Send"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-action text-on-accent transition-opacity hover:bg-action-hover disabled:opacity-40"
              >
                <Arrow />
              </button>
            </div>
            {hideTranscript && messages.length > 0 ? (
              <button
                type="button"
                onClick={() => setHideTranscript(false)}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-soft hover:text-ink"
              >
                Show conversation ({messages.filter((message) => message.role === "assistant").length})
              </button>
            ) : null}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Suggested questions">
              {suggestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={pending}
                  onClick={() => void ask(question)}
                  className="inline-flex min-h-11 max-w-full items-center rounded-full border border-line bg-elevated px-3 text-left text-sm text-ink transition-colors hover:border-action disabled:opacity-60"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

function Answer({ message }: { message: Message }) {
  const failed = message.text === SAVED;
  const body = message.text.replace(CONSULTANT_LINE, "").trim();
  const suggests = message.text.includes(CONSULTANT_LINE);
  return (
    <li className="card-in max-w-[92%]">
      <p className="mb-1 flex items-center gap-2 text-xs text-soft">
        <span className="font-semibold text-ink">Answer</span>
        {failed ? (
          <span className="rounded-full bg-at-risk-bg px-2 py-0.5 font-medium text-at-risk">Model unavailable</span>
        ) : message.fromCache ? (
          <span className="rounded-full bg-panel2 px-2 py-0.5 font-medium">Saved answer</span>
        ) : (
          <span className="rounded-full bg-on-track-bg px-2 py-0.5 font-medium text-on-track">
            Live · numbers checked
          </span>
        )}
      </p>
      <p className="text-pretty text-[15px] leading-relaxed text-ink">{body}</p>
      {suggests ? (
        <p className="mt-2 border-l-2 border-action pl-2 text-xs font-medium text-soft">{CONSULTANT_LINE}</p>
      ) : null}
      {message.sources && message.sources.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Sources">
          {message.sources.map((source) => (
            <li key={source} className="rounded-md border border-line px-1.5 py-0.5 text-[11px] text-soft">
              {source}
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
      <path d="M5 12h12M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
