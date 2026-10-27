"use server";

import { answerQuestion, type ChatOutcome } from "@/ai/chat";
import type { EngineInput } from "@/domain/engine";
import type { MaskLexicon } from "@/ingest/mask";

export async function askPanel(
  question: string,
  engine: EngineInput,
  referenceDate: string,
  lexicon: MaskLexicon,
): Promise<ChatOutcome> {
  return answerQuestion({ question, engine, referenceDate, lexicon });
}
