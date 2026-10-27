import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { completeTurn, type ToolDefinition } from "@/ai/xai";
import type { DocumentKind } from "@/domain/schemas";
import { maskText, type MaskLexicon, type MaskSession } from "@/ingest/mask";

export type DoorCall = {
  filename: string;
  kind: DocumentKind;
  isPublic: boolean;
  payload: string;
};

function maskFilename(filename: string, lexicon: MaskLexicon, session?: MaskSession): string {
  const fold = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "");
  return maskText(
    fold(filename),
    {
      workers: lexicon.workers.map(fold),
      people: lexicon.people.map(fold),
      companies: lexicon.companies.map(fold),
      addresses: lexicon.addresses.map(fold),
    },
    session,
  ).text;
}

const sent: DoorCall[] = [];

export function resetDoor(): void {
  sent.length = 0;
}

export function doorCalls(): readonly DoorCall[] {
  return sent;
}

/**
 * The only function that prepares text for the model.
 * Irrelevant documents are refused here. An unread file may be sent only to be classified.
 */
export function sendToModel(input: {
  filename: string;
  kind: DocumentKind;
  text: string;
  isPublic: boolean;
  lexicon: MaskLexicon;
  /** Labels shared across one project. Without it each text is numbered on its own. */
  session?: MaskSession;
  purpose?: "classify";
}): DoorCall {
  if (input.kind === "irrelevant" || (input.kind === "unreadable" && input.purpose !== "classify")) {
    throw new Error("This document is not sent to the model.");
  }
  const payload = input.isPublic ? input.text : maskText(input.text, input.lexicon, input.session).text;
  const filename = input.isPublic ? input.filename : maskFilename(input.filename, input.lexicon, input.session);
  const call: DoorCall = {
    filename,
    kind: input.kind,
    isPublic: input.isPublic,
    payload,
  };
  sent.push(call);
  writeCall(call, null);
  return call;
}

function callId(call: DoorCall): string {
  return createHash("sha256").update(`${call.kind}\n${call.filename}\n${call.payload}`).digest("hex").slice(0, 16);
}

/** Masks nothing here: the caller already masked the question. Logs the whole turn. */
export async function askChatTurn(input: {
  instructions: string;
  input: unknown;
  tools: ToolDefinition[];
  signal?: AbortSignal;
}): Promise<Awaited<ReturnType<typeof completeTurn>>> {
  const payload = JSON.stringify({
    instructions: input.instructions,
    input: input.input,
    tools: input.tools.map((tool) => tool.name),
  });
  recordChat(payload, null);
  try {
    const turn = await completeTurn(input);
    recordChat(payload, turn.text || null);
    return turn;
  } catch (error) {
    const message = error instanceof Error ? error.message : "The model did not answer.";
    recordChat(payload, message);
    throw error;
  }
}

/** Logs a chat turn that was already masked. The key never comes through here. */
export function recordChat(payload: string, reply: string | null): void {
  const id = createHash("sha256").update(payload).digest("hex").slice(0, 16);
  const directory = path.join(process.cwd(), "data", "ai-log");
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, `chat-${id}.json`),
    `${JSON.stringify({ kind: "chat", isPublic: false, payload, reply })}\n`,
    "utf8",
  );
}

function writeCall(call: DoorCall, reply: string | null): void {
  const directory = path.join(process.cwd(), "data", "ai-log");
  mkdirSync(directory, { recursive: true });
  writeFileSync(
    path.join(directory, `${callId(call)}.json`),
    `${JSON.stringify({ filename: call.filename, kind: call.kind, isPublic: call.isPublic, payload: call.payload, reply })}\n`,
    "utf8",
  );
}

/** Masks, logs, and calls the model. This is the only network call. */
export async function askModel(input: {
  filename: string;
  kind: DocumentKind;
  text: string;
  isPublic: boolean;
  lexicon: MaskLexicon;
  instructions: string;
  purpose?: "classify";
}): Promise<{ call: DoorCall; reply: string }> {
  const call = sendToModel(input);
  const { complete } = await import("@/ai/xai");
  const reply = await complete({ instructions: input.instructions, prompt: call.payload });
  writeCall(call, reply);
  return { call, reply };
}
