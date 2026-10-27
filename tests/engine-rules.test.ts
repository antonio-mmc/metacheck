import { describe, expect, it } from "vitest";

import { leaksIn, maskText } from "@/ingest/mask";
import { penaltyPp } from "@/domain/penalty";

describe("person labels", () => {
  it("keeps company people as workers and a certificate signatory as a person", () => {
    const masked = maskText("Assinado por Carla Nunes, Chefe de Secção. A trabalhadora é Inês Marques.", {
      workers: ["Inês Marques"],
      people: ["Carla Nunes"],
      companies: [],
      addresses: [],
    }).text;
    expect(masked).toContain("[WORKER_1]");
    expect(masked).toContain("[PERSON_1]");
    expect(masked).toMatch(/\[PERSON_1\], Chefe de Sec/);
    expect(masked).not.toMatch(/Carla|Inês|Ines|Nunes|Marques/);
  });
});

describe("phone labels", () => {
  const empty = { workers: [], people: [], companies: [], addresses: [] };

  it("masks international, grouped and bare numbers, and keeps a valid NIF as a NIF", () => {
    const masked = maskText("Tel +351 912 345 678, 00351 253111222, nacional 912 000 111, direto 934567890. NIF 999999990.", empty).text;
    expect(masked).toMatch(/\[PHONE_\d+\]/);
    expect(masked).toContain("[NIF_1]");
    expect(masked).not.toMatch(/912\s*345\s*678|00351|912\s*000\s*111|934567890|999999990/);
    expect(leaksIn(masked, empty)).toEqual([]);
  });
});

describe("penalty steps", () => {
  it("counts an incomplete step and stops at 3 points", () => {
    expect(penaltyPp(70, 70, 2, 0.5, 3)).toBe(0);
    expect(penaltyPp(69, 70, 2, 0.5, 3)).toBe(0.5);
    expect(penaltyPp(64.5, 70, 2, 0.5, 3)).toBe(1.5);
    expect(penaltyPp(50, 70, 2, 0.5, 3)).toBe(3);
  });
});
