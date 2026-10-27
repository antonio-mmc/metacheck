import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { loadDotEnv, readCallCard } from "@/ai/extract-call";
import { cardDifferences, ruleCardSchema, type RuleCard } from "@/domain/rule-card";
import saved2024 from "../data/rule-cards/MPR-2024-3.json";
import saved2026 from "../data/rule-cards/MPR-2026-6.json";

const calls = [
  {
    file: "aviso-MPR-2024-3-InovacaoProdutiva-BaixaDensidade.pdf",
    code: "MPR-2024-3",
    expected: ruleCardSchema.parse(saved2024),
  },
  {
    file: "aviso-MPR-2026-6-InovacaoProdutiva.pdf",
    code: "MPR-2026-6",
    expected: ruleCardSchema.parse(saved2026),
  },
];

describe.skipIf(process.env.READ_CALLS !== "1")("live call reading", () => {
  it("reads both calls through the door and stores the replies", async () => {
    loadDotEnv();
    const directory = path.join(process.cwd(), "data", "ai-cache");
    mkdirSync(directory, { recursive: true });
    const mismatches: string[] = [];
    for (const call of calls) {
      const bytes = new Uint8Array(readFileSync(path.join(process.cwd(), "dados-demo", "avisos", call.file)));
      const read = await readCallCard(call.file, bytes);
      writeFileSync(
        path.join(directory, `${call.code}.json`),
        `${JSON.stringify({ callCode: call.code, reply: read.reply, extracted: read.card, reason: read.reason }, null, 2)}\n`,
        "utf8",
      );
      const differ = read.card ? cardDifferences(read.card, call.expected) : [`invalid: ${read.reason ?? "no card"}`];
      console.log(`\n${call.code}`);
      console.log(JSON.stringify(read.card ?? { reason: read.reason, reply: read.reply }, null, 2));
      console.log(differ.length === 0 ? "MATCH" : `DIFFER ${differ.join(", ")}`);
      if (differ.length > 0) mismatches.push(`${call.code}: ${differ.join(", ")}`);
    }
    expect(mismatches).toEqual([]);
  }, 300_000);
});

describe("saved cards", () => {
  it("keeps a card for each call in the section 11 table we use offline", () => {
    const cards: RuleCard[] = [ruleCardSchema.parse(saved2024), ruleCardSchema.parse(saved2026)];
    expect(cards.map((card) => card.thresholdPct)).toEqual([70, 70]);
    expect(cards.every((card) => card.bestN === 2 && card.roModel === "best_n")).toBe(true);
  });
});
