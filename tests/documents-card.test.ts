import { describe, expect, it } from "vitest";

import { readProject } from "@/ingest/project";
import { companyAInputs } from "@/tests/demo-files";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const corrupt = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0xff, 0x00]);

describe("documents card", () => {
  it("keeps going when one file is corrupt and another is an image", async () => {
    const reading = await readProject([
      ...companyAInputs(),
      { filename: "photo.png", bytes: png },
      { filename: "broken.pdf", bytes: corrupt },
    ]);
    const broken = reading.card.entries.filter((entry) => entry.tone === "error");
    expect(broken.map((entry) => entry.filename).sort()).toEqual(["broken.pdf", "photo.png"]);
    expect(broken.every((entry) => entry.detail && entry.detail.length > 10)).toBe(true);
    expect(reading.card.continueHint).toMatch(/unchanged/i);
    expect(reading.card.readCount).toBeGreaterThan(10);
  }, 60_000);

  it("asks for Q3 when the September balance is removed and ignores the invoice", async () => {
    const reading = await readProject(
      companyAInputs().filter((file) => file.filename !== "Balancete_Set2026.csv"),
    );
    expect(reading.card.missing.some((line) => /Q3/i.test(line))).toBe(true);
    expect(reading.card.setAside).toBe(2);
  }, 60_000);

  it("asks for nothing when the company A set is complete", async () => {
    const reading = await readProject(companyAInputs());
    expect(reading.card.missing).toEqual([]);
    expect(reading.card.notCrossChecked).toEqual([]);
    expect(reading.card.setAside).toBe(2);
  }, 60_000);
});
