import { describe, expect, it } from "vitest";

import { answerQuestion } from "@/ai/chat";
import type { ResponseItem } from "@/ai/xai";
import { companyAPeople, companyAQuarters } from "@/app/operation";
import { AS_OF } from "@/domain/clock";
import { companyAContract } from "@/domain/contract";
import { GRADUATE_MONTHLY_SALARY } from "@/domain/cost";
import type { EngineInput } from "@/domain/engine";
import { ruleCardSchema } from "@/domain/rule-card";
import type { Lever } from "@/domain/simulate";
import { maskText } from "@/ingest/mask";
import savedCard from "../data/rule-cards/MPR-2024-3.json";

function companyAInput(): EngineInput {
  return {
    asOf: AS_OF,
    contract: companyAContract,
    rule: ruleCardSchema.parse(savedCard),
    people: companyAPeople(),
    conventionalHours: 40,
    staffFile: "mapa pessoal 2026.xlsx",
    quarters: companyAQuarters,
  };
}

const lexicon = {
  workers: ["Inês Carvalho"],
  people: [] as string[],
  companies: ["Demo Têxtil, Lda."],
  addresses: [] as string[],
};

const engine = companyAInput();

describe("chat grounding", () => {
  it("drops a reply that invents €999,999.00 and does not send the real name", async () => {
    const question = "Will Demo Têxtil still pay Inês Carvalho if the cut is €999,999.00?";
    const masked = maskText(question, lexicon).text;
    expect(masked).not.toContain("Carvalho");
    expect(masked).not.toContain("Têxtil");

    let packet = "";
    let hasSignal = false;
    const outcome = await answerQuestion({
      question,
      engine,
      referenceDate: AS_OF,
      lexicon,
      complete: async (request) => {
        hasSignal = request.signal instanceof AbortSignal;
        packet = JSON.stringify({
          instructions: request.instructions,
          input: request.input,
          tools: request.tools,
        });
        return { output: [], text: "The cut is €999,999.00.", calls: [] };
      },
    });

    const sent = JSON.parse(packet) as { input: { content?: string }[]; tools: { name: string }[] };
    expect(hasSignal).toBe(true);
    expect(sent.input[0]?.content).toBe(masked);
    expect(packet).not.toContain("Carvalho");
    expect(packet).not.toContain("Inês");
    expect(packet).not.toContain("Têxtil");
    expect(packet).not.toContain("search_parameters");
    expect(sent.tools.some((tool) => tool.name === "web_search")).toBe(false);
    expect(outcome.fromCache).toBe(true);
    expect(outcome.levers).toBeNull();
    expect(outcome.text).not.toContain("999");
    expect(outcome.text).toBe(
      "The model is not reachable right now. The three suggested questions still answer from saved engine figures.",
    );
  });

  it("shows a simulate reply whose numbers come from the tool output and returns the levers", async () => {
    const levers: Lever[] = [
      {
        kind: "hire",
        count: 1,
        qualified: true,
        startOn: "2026-11-01",
        monthlySalary: GRADUATE_MONTHLY_SALARY,
      },
    ];
    const functionCall: ResponseItem = {
      type: "function_call",
      call_id: "call_sim",
      name: "simulate",
      arguments: JSON.stringify({ levers }),
    };
    const seen: unknown[] = [];
    let echoed = "";

    const outcome = await answerQuestion({
      question: "What would happen if we hire one graduate?",
      engine,
      referenceDate: AS_OF,
      lexicon,
      complete: async (request) => {
        seen.push(request.input);
        if (seen.length === 1) {
          return {
            output: [functionCall],
            text: "",
            calls: [
              { callId: "call_sim", name: "simulate", arguments: JSON.stringify({ levers }) },
            ],
          };
        }

        const items = Array.isArray(request.input) ? request.input : [];
        const raw = (items[2] as { output?: unknown } | undefined)?.output;
        const json = typeof raw === "string" ? raw : "";
        const payload = JSON.parse(json) as { after: { roPct: number; cutEuro: number } };
        const ro = JSON.stringify(payload.after.roPct);
        const cut = JSON.stringify(payload.after.cutEuro);
        echoed = `Result ${ro} and cut ${cut}.`;
        return { output: [], text: echoed, calls: [] };
      },
    });

    expect(seen).toHaveLength(2);
    const items = seen[1] as ResponseItem[];
    expect(Array.isArray(items)).toBe(true);
    expect(items[0]).toMatchObject({
      type: "message",
      role: "user",
      content: "What would happen if we hire one graduate?",
    });
    expect(items[1]).toEqual(functionCall);
    expect(items[2]).toMatchObject({ type: "function_call_output", call_id: "call_sim" });
    const json = String(items[2]?.output ?? "");
    expect(json).not.toContain("Demo");
    expect(json).not.toContain("Joined");
    expect(json).not.toContain("Worker");
    expect(json).not.toContain("Scenario");
    expect(echoed).toMatch(/\d/);
    expect(outcome.levers).toEqual(levers);
    expect(outcome.fromCache).toBe(false);
    expect(outcome.text).toBe(echoed);
    expect(outcome.text).not.toContain("999");
  });
});
