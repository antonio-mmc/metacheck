import { describe, expect, it } from "vitest";

import { classifyBytes } from "@/ingest/classify";
import { readProject } from "@/ingest/project";

const letter = new TextEncoder().encode(
  "Minutes of the harvest festival committee. The choir rehearses on Thursday. No accounts are attached.",
);

describe("unknown files", () => {
  it("asks the model only when no rule matches", async () => {
    let asked = 0;
    const result = await classifyBytes(letter, async () => {
      asked += 1;
      return "irrelevant";
    });
    expect(asked).toBe(1);
    expect(result.kind).toBe("irrelevant");
    expect(result.detail).toMatch(/model/i);

    asked = 0;
    const invoice = new TextEncoder().encode("Fatura ATCUD 123 Total iliquido 10 IVA 2.3");
    const known = await classifyBytes(invoice, async () => {
      asked += 1;
      return "certificate";
    });
    expect(asked).toBe(0);
    expect(known.kind).toBe("irrelevant");
  });

  it("asks the model only when a name list already exists", async () => {
    let asked = 0;
    const alone = await readProject([{ filename: "nota.txt", bytes: letter }], {
      askModel: async () => {
        asked += 1;
        return "irrelevant";
      },
    });
    expect(asked).toBe(0);
    expect(alone.files[0]?.kind).toBe("unreadable");

    let seenWorkers: string[] = [];
    const withNames = await readProject([{ filename: "nota.txt", bytes: letter }], {
      lexicon: { workers: ["Inês Marques"], people: [], companies: ["Demo Têxtil, Lda."], addresses: [] },
      askModel: async (_text, lexicon) => {
        asked += 1;
        seenWorkers = lexicon.workers;
        return "irrelevant";
      },
    });
    expect(asked).toBe(1);
    expect(seenWorkers).toEqual(["Inês Marques"]);
    expect(withNames.files[0]?.kind).toBe("irrelevant");
    expect(withNames.files[0]?.detail).toMatch(/model/i);
  });
});
