import { askChatTurn } from "@/ai/door";
import type { FunctionCallItem, ResponseItem, ToolDefinition } from "@/ai/xai";
import { runOperation, type EngineInput } from "@/domain/engine";
import { formatEti, formatEuro, formatPercent, formatPp } from "@/domain/format";
import {
  CONSULTANT_LINE,
  numbersNotGrounded,
  rehearsedAnswers,
  SUGGESTED_QUESTIONS,
} from "@/domain/rehearsed";
import { leverSchema, simulate, type Lever, type SimulationResult } from "@/domain/simulate";
import { maskText, type MaskLexicon } from "@/ingest/mask";
import { z } from "zod";

export type ChatOutcome = {
  text: string;
  sources: string[];
  fromCache: boolean;
  levers: Lever[] | null;
};

const INSTRUCTIONS = [
  "You explain the engine's figures.",
  "You never invent a number.",
  "The panel figures are given below; call read_indicators only for another date.",
  "You call simulate only when the user asks what would happen if they hire or sell more.",
  "Salary changes cost only, not the result.",
  `End with "${CONSULTANT_LINE}" only when you recommend an action.`,
  "Reply in plain sentences, no markdown.",
].join(" ");

const FALLBACK_TEXT = "The model is not reachable right now. The three suggested questions still answer from saved engine figures.";

const MAX_TOOL_ROUNDS = 3;

/** grok-4.7 takes up to ~10 s for the writing round alone, so the whole turn gets 20 s. */
export const CHAT_BUDGET_MS = 20_000;

const TOOLS: ToolDefinition[] = [
  {
    type: "function",
    name: "read_indicators",
    description:
      "Read the projected result, each indicator, the deadline, and the priced paths. Call this first. Returns numbers and labels only.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {
        referenceDate: {
          type: "string",
          description: "ISO date YYYY-MM-DD. Omit to use the panel date.",
        },
      },
    },
  },
  {
    type: "function",
    name: "simulate",
    description:
      "Price a hire or extra sales. Call only when the user asks what would happen if they hire or sell more. Salary changes the cost only, not the result.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["levers"],
      properties: {
        referenceDate: {
          type: "string",
          description: "ISO date YYYY-MM-DD. Omit to use the panel date.",
        },
        levers: {
          type: "array",
          items: {
            oneOf: [
              {
                type: "object",
                additionalProperties: false,
                required: ["kind", "count", "qualified", "startOn", "monthlySalary"],
                properties: {
                  kind: { type: "string", enum: ["hire"] },
                  count: { type: "integer", minimum: 1 },
                  qualified: { type: "boolean" },
                  startOn: { type: "string", description: "YYYY-MM-DD, first day of a month." },
                  monthlySalary: {
                    type: "number",
                    exclusiveMinimum: 0,
                    description: "Gross monthly salary in euros. Cost only.",
                  },
                },
              },
              {
                type: "object",
                additionalProperties: false,
                required: ["kind", "euro"],
                properties: {
                  kind: { type: "string", enum: ["extra_sales"] },
                  euro: { type: "number", minimum: 0 },
                },
              },
            ],
          },
        },
      },
    },
  },
];

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const readArgsSchema = z.object({
  referenceDate: isoDate.optional(),
});

const simulateArgsSchema = z.object({
  referenceDate: isoDate.optional(),
  levers: z.array(leverSchema).min(1),
});

type UserMessage = { type: "message"; role: "user"; content: string };

type FunctionCallOutput = { type: "function_call_output"; call_id: string; output: string };

type TurnItem = UserMessage | ResponseItem | FunctionCallOutput;

type Priced = { result: SimulationResult; levers: Lever[] };

function isSuggested(question: string): question is (typeof SUGGESTED_QUESTIONS)[number] {
  return (SUGGESTED_QUESTIONS as readonly string[]).includes(question);
}

function fallback(engine: EngineInput, question: string): ChatOutcome {
  if (isSuggested(question)) {
    const saved = rehearsedAnswers(engine).find((item) => item.question === question);
    if (saved) {
      return { text: saved.answer, sources: [...saved.sources], fromCache: true, levers: null };
    }
  }
  return { text: FALLBACK_TEXT, sources: [], fromCache: true, levers: null };
}

function sourcesFor(engine: EngineInput): string[] {
  const files = new Set<string>([
    engine.staffFile,
    ...engine.quarters.map((quarter) => quarter.file),
  ]);
  return [...files, engine.contract.callCode];
}

/** Two decimals, as the panel shows them, so the model repeats "64.5" and not "64.49996840958607". */
function rounded(value: unknown): unknown {
  if (typeof value === "number") return Number.isFinite(value) ? Math.round(value * 100) / 100 : value;
  if (Array.isArray(value)) return value.map(rounded);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, rounded(nested)]));
  }
  return value;
}

function indicatorView(engine: EngineInput, referenceDate: string) {
  const operation = runOperation(engine, referenceDate);
  return {
    roPct: operation.roPct,
    thresholdPct: operation.thresholdPct,
    penaltyPp: operation.penaltyPp,
    cutEuro: operation.cutEuro,
    gapPp: operation.gapPp,
    indicators: operation.indicators.map((indicator) => ({
      code: indicator.code,
      label: indicator.label,
      ratioPct: indicator.ratioPct,
      countsInRo: indicator.countsInRo,
    })),
    bestCodes: operation.bestCodes,
    deadlineHeadline: operation.deadlineHeadline,
    deadlineSentence: operation.deadlineSentence,
    paths: operation.paths.map((path) => ({
      title: path.title,
      roPct: path.roPct,
      cutEuro: path.cutEuro,
      costToYearEnd: path.costToYearEnd,
    })),
  };
}

/** Every shape of an engine number the reply is allowed to repeat. */
function allowNumber(value: number, into: string[]): void {
  if (!Number.isFinite(value)) return;
  const grouped = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const loose = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 }).format(value);
  into.push(
    String(value),
    JSON.stringify(value),
    value.toFixed(2),
    grouped,
    loose,
    formatPercent(value),
    formatEuro(value),
    formatPp(value),
    formatEti(value, 2),
  );
}

function walk(value: unknown, into: string[]): void {
  if (typeof value === "number") {
    allowNumber(value, into);
    return;
  }
  if (typeof value === "string") {
    into.push(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item, into);
    return;
  }
  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) walk(nested, into);
  }
}

function allowPayload(payload: unknown, json: string, into: string[]): void {
  into.push(json);
  walk(payload, into);
}

function writtenSentence(result: SimulationResult): string {
  const cost = result.costToYearEnd === null ? "none" : formatEuro(result.costToYearEnd);
  return `Result ${formatPercent(result.after.roPct)}, cut ${formatEuro(result.after.cutEuro)}, cost ${cost}.`;
}

function runTool(
  call: FunctionCallItem,
  engine: EngineInput,
  referenceDate: string,
): { payload: unknown; priced: Priced | null } {
  let args: unknown;
  try {
    args = JSON.parse(call.arguments) as unknown;
  } catch {
    return { payload: { error: "The tool arguments could not be read." }, priced: null };
  }

  if (call.name === "read_indicators") {
    const parsed = readArgsSchema.safeParse(args);
    if (!parsed.success)
      return { payload: { error: "The reference date could not be read." }, priced: null };
    const date = parsed.data.referenceDate ?? referenceDate;
    return { payload: indicatorView(engine, date), priced: null };
  }

  if (call.name === "simulate") {
    const parsed = simulateArgsSchema.safeParse(args);
    if (!parsed.success)
      return { payload: { error: "The levers could not be read." }, priced: null };
    const date = parsed.data.referenceDate ?? referenceDate;
    const result = simulate(engine, parsed.data.levers, date);
    const payload = { ...result, levers: parsed.data.levers };
    return { payload, priced: { result, levers: parsed.data.levers } };
  }

  return { payload: { error: "Unknown tool." }, priced: null };
}

function finish(
  text: string,
  priced: Priced | null,
  allowed: string,
  engine: EngineInput,
  question: string,
): ChatOutcome {
  const sentence = text.trim();
  const usedTools = priced !== null || allowed.trim().length > 0;
  const grounded = usedTools && sentence.length > 0 && numbersNotGrounded(sentence, allowed).length === 0;
  if (grounded) {
    return {
      text: sentence,
      sources: sourcesFor(engine),
      fromCache: false,
      levers: priced?.levers ?? null,
    };
  }
  if (priced) {
    return {
      text: writtenSentence(priced.result),
      sources: sourcesFor(engine),
      fromCache: false,
      levers: priced.levers,
    };
  }
  return fallback(engine, question);
}

export async function answerQuestion(input: {
  question: string;
  engine: EngineInput;
  referenceDate: string;
  lexicon: MaskLexicon;
  complete?: typeof askChatTurn;
}): Promise<ChatOutcome> {
  const question = input.question.trim();
  if (!question) return fallback(input.engine, question);
  // Rehearsed questions answer from the saved copy: instant and identical on stage.
  if (isSuggested(question)) return fallback(input.engine, question);

  const complete = input.complete ?? askChatTurn;
  const referenceDate = input.referenceDate || input.engine.asOf;
  const masked = maskText(question, input.lexicon).text;
  const allowed: string[] = [];
  // Each model round takes 7–13 s, so the panel figures ride along instead of costing a read_indicators round.
  const panel = rounded(indicatorView(input.engine, referenceDate));
  const panelJson = JSON.stringify(panel);
  allowPayload(panel, panelJson, allowed);
  const instructions = `${INSTRUCTIONS}\nPanel figures: ${panelJson}`;
  let items: TurnItem[] = [{ type: "message", role: "user", content: masked }];
  let text = "";
  let priced: Priced | null = null;

  try {
    const signal = AbortSignal.timeout(CHAT_BUDGET_MS);
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
      const turn = await complete({
        instructions,
        input: items,
        tools: TOOLS,
        signal,
      });
      text = turn.text;
      if (turn.calls.length === 0 || round === MAX_TOOL_ROUNDS) break;

      const outputs: FunctionCallOutput[] = [];
      for (const call of turn.calls) {
        const ran = runTool(call, input.engine, referenceDate);
        const payload = rounded(ran.payload);
        const json = JSON.stringify(payload);
        allowPayload(payload, json, allowed);
        if (ran.priced) priced = ran.priced;
        outputs.push({ type: "function_call_output", call_id: call.callId, output: json });
      }
      items = [...items, ...turn.output, ...outputs];
    }
  } catch {
    // A finished simulation still moves the panel and shows the engine's own sentence.
    if (priced) return finish("", priced, allowed.join(" "), input.engine, question);
    return fallback(input.engine, question);
  }

  return finish(text, priced, allowed.join(" "), input.engine, question);
}
