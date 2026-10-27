import { describe, expect, it } from "vitest";

import { doorCalls, resetDoor, sendToModel } from "@/ai/door";
import { leaksIn } from "@/ingest/mask";
import { readProject } from "@/ingest/project";
import { companyAInputs } from "@/tests/demo-files";

describe("masking", () => {
  it("keeps person names out of the five certificates and never sends the irrelevant files", async () => {
    resetDoor();
    const inputs = companyAInputs();
    const reading = await readProject(inputs);
    const people = [
      ...(reading.staff?.people.map((person) => person.name) ?? []),
      ...(reading.singleReport?.people.map((person) => person.name) ?? []),
      ...reading.socialSecurity.flatMap((item) => item.people.map((person) => person.name)),
    ];
    const companies = reading.balances.flatMap((balance) =>
      balance.rows.filter((row) => row.code.startsWith("21")).map((row) => row.description),
    );
    const certificates = doorCalls().filter((call) => call.kind === "certificate");
    expect(certificates).toHaveLength(5);

    const leaks = certificates.flatMap((call) =>
      leaksIn(`${call.filename}\n${call.payload}`, { workers: people, people: [], companies, addresses: [] }),
    );
    expect(leaks).toEqual([]);
    const masked = certificates.map((call) => call.payload).join("\n");
    expect(masked).toMatch(/\[WORKER_\d+\]/);
    expect(masked).toMatch(/\[PERSON_\d+\]/);
    expect(masked).not.toMatch(/\[WORKER_\d+\], Chefe de Sec/);
    const folded = certificates.map((call) => call.filename.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase());
    for (const person of people) {
      for (const part of person.normalize("NFD").replace(/\p{M}/gu, "").split(/\s+/)) {
        const clean = part.replace(/[.,]/g, "").toLowerCase();
        if (clean.length < 4) continue;
        expect(folded.some((name) => name.includes(clean))).toBe(false);
      }
    }

    const sentNames = doorCalls().map((call) => call.filename);
    expect(sentNames.some((name) => /FT 2026-0815/i.test(name))).toBe(false);
    expect(sentNames.some((name) => /Apresentacao/i.test(name))).toBe(false);
    expect(doorCalls().some((call) => call.kind === "irrelevant")).toBe(false);

    expect(() =>
      sendToModel({
        filename: "FT 2026-0815.pdf",
        kind: "irrelevant",
        text: "Fatura with a name",
        isPublic: false,
        lexicon: { workers: people, people: [], companies, addresses: [] },
      }),
    ).toThrow(/not sent/i);
  }, 60_000);
});
