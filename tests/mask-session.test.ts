import { describe, expect, it } from "vitest";

import { createMaskSession, maskText, sessionPairs } from "@/ingest/mask";

const lexicon = { workers: ["Inês Marques", "Tiago Sousa"], people: [], companies: [], addresses: [] };

describe("mask session", () => {
  it("keeps one label per person across documents and shows the value whole", () => {
    const session = createMaskSession();
    const first = maskText("Certifica que Tiago Sousa concluiu.", lexicon, session).text;
    const second = maskText("Certifica que Inês Marques e Tiago Sousa concluíram.", lexicon, session).text;
    expect(first).toBe("Certifica que [WORKER_1] concluiu.");
    expect(second).toBe("Certifica que [WORKER_2] e [WORKER_1] concluíram.");
    expect(sessionPairs(session)).toEqual([
      { value: "Tiago Sousa", token: "[WORKER_1]" },
      { value: "Inês Marques", token: "[WORKER_2]" },
    ]);
  });
});
