import { askModel } from "@/ai/door";
import { documentKindSchema, type DocumentKind } from "@/domain/schemas";
import type { MaskLexicon } from "@/ingest/mask";

const KINDS = "call, acceptance_term, trial_balance, staff_map, single_report, ies, social_security, certificate, irrelevant";

function hasNames(lexicon: MaskLexicon): boolean {
  return lexicon.workers.length + lexicon.people.length + lexicon.companies.length > 0;
}

/**
 * Used only when the rules do not recognise a file.
 * The name list from the company's structured documents is applied first.
 * With an empty list the text is not sent.
 */
export async function classifyUnknownText(text: string, lexicon: MaskLexicon): Promise<DocumentKind | null> {
  if (!process.env.XAI_API_KEY || !hasNames(lexicon)) return null;
  const { reply } = await askModel({
    filename: "unclassified.txt",
    kind: "unreadable",
    text: text.slice(0, 8000),
    isPublic: false,
    lexicon,
    instructions: `Reply with JSON only: {"kind": one of ${KINDS}}. Use irrelevant when the file does not change the grant targets.`,
    purpose: "classify",
  });
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start < 0 || end < start) return null;
  try {
    const parsed = documentKindSchema.safeParse(
      (JSON.parse(reply.slice(start, end + 1)) as { kind?: unknown }).kind,
    );
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
