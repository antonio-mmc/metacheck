import { z } from "zod";

/** Codes the engine knows. The model may only pick from this list. */
export const catalogCodeSchema = z.enum([
  "RPR003",
  "RCR01",
  "RSR23",
  "RPR001",
  "RPR031",
  "RPR002",
  "RPR080",
]);

export type CatalogCode = z.infer<typeof catalogCodeSchema>;

const gcStepSchema = z.object({
  abovePct: z.number().nullable(),
  upToPct: z.number(),
  penaltyPp: z.number().nonnegative(),
});

export const ruleCardSchema = z
  .object({
    callCode: z.string().min(1),
    resultIndicators: z.array(catalogCodeSchema).min(1),
    roModel: z.enum(["best_n", "weighted"]),
    bestN: z.number().int().positive(),
    weights: z.array(z.number().positive()).min(1),
    thresholdPct: z.number().gt(0).lte(100),
    penaltyStepPp: z.number().positive(),
    penaltyEveryPp: z.number().positive(),
    penaltyMaxPp: z.number().positive(),
    gcSteps: z.array(gcStepSchema).min(1),
    preProjectYear: z.union([
      z.object({ source: z.literal("term") }),
      z.object({ source: z.literal("fixed"), year: z.number().int() }),
    ]),
    pages: z.string().min(1),
    supported: z.literal(true),
  })
  .superRefine((card, context) => {
    if (card.roModel === "weighted") {
      context.addIssue({
        code: "custom",
        message: "not supported",
        path: ["roModel"],
      });
    }
    if (card.weights.length !== card.bestN) {
      context.addIssue({
        code: "custom",
        message: "weights must match the count of indicators that enter the result",
        path: ["weights"],
      });
    }
    const weightSum = card.weights.reduce((total, weight) => total + weight, 0);
    if (Math.abs(weightSum - 1) > 1e-9) {
      context.addIssue({
        code: "custom",
        message: "weights must sum to 1",
        path: ["weights"],
      });
    }
  });

export type RuleCard = z.infer<typeof ruleCardSchema>;

/** What failed validation, in plain language, so the screen can ask for a person. */
export function explainRuleCard(raw: unknown): { card: RuleCard } | { card: null; reason: string } {
  const parsed = ruleCardSchema.safeParse(raw);
  if (parsed.success) return { card: parsed.data };
  const issue = parsed.error.issues[0];
  const field = issue?.path.join(".") || "card";
  return { card: null, reason: `${field}: ${issue?.message ?? "invalid"}` };
}

function pagesKey(value: string): string {
  return value.replace(/[–—-]/g, "-").replace(/\s+/g, "");
}

/** Field names that differ. Empty means the two cards are the same call. */
export function cardDifferences(actual: RuleCard, expected: RuleCard): string[] {
  const differ: string[] = [];
  const fields: (keyof RuleCard)[] = [
    "callCode",
    "roModel",
    "bestN",
    "thresholdPct",
    "penaltyStepPp",
    "penaltyEveryPp",
    "penaltyMaxPp",
    "supported",
  ];
  for (const field of fields) {
    if (actual[field] !== expected[field]) differ.push(field);
  }
  if (pagesKey(actual.pages) !== pagesKey(expected.pages)) differ.push("pages");
  const actualCodes = [...actual.resultIndicators].sort().join(",");
  const expectedCodes = [...expected.resultIndicators].sort().join(",");
  if (actualCodes !== expectedCodes) differ.push("resultIndicators");
  if (actual.weights.join(",") !== expected.weights.join(",")) differ.push("weights");
  if (JSON.stringify(actual.preProjectYear) !== JSON.stringify(expected.preProjectYear)) {
    differ.push("preProjectYear");
  }
  if (JSON.stringify(actual.gcSteps) !== JSON.stringify(expected.gcSteps)) differ.push("gcSteps");
  return differ;
}
