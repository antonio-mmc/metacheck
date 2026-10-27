import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { companyAContract } from "@/domain/contract";
import { buildDocumentChecks } from "@/ingest/document-checks";
import { readPdfPlain } from "@/ingest/pdf-text";
import { readCertificate } from "@/ingest/readers/certificate";
import { readProject } from "@/ingest/project";
import { companyAInputs } from "@/tests/demo-files";

describe("certificate reader", () => {
  it("reads a level 5 course and a master's degree", () => {
    const ctesp = readCertificate(
      "scan_0057.pdf",
      "CERTIFICA que Ana Rita Gomes , filha de pais, concluiu o Curso Técnico Superior Profissional. Diploma de técnico superior profissional, nível 5 do Quadro Nacional de Qualificações.",
    );
    const master = readCertificate(
      "Certificado Ricardo.pdf",
      "CERTIFICA que Ricardo Manuel Antunes , filho de pais, concluiu o Curso de Mestrado. nível 7 do Quadro Nacional de Qualificações.",
    );
    expect(ctesp.holder).toBe("Ana Rita Gomes");
    expect(ctesp.level).toBe(5);
    expect(ctesp.foreignDegree).toBe(false);
    expect(master.level).toBe(7);
  });
});

describe("company A document cards", () => {
  it("checks the balances, the term, and the five certificates", async () => {
    const reading = await readProject(companyAInputs());
    const cards = buildDocumentChecks(reading, companyAContract);
    const balances = cards.filter((card) => card.title === "Trial balance");
    expect(balances).toHaveLength(3);
    expect(balances.every((card) => card.checks.some((check) => check.ok && check.label === "Debit equals credit"))).toBe(
      true,
    );
    const term = cards.find((card) => card.title === "Acceptance term");
    expect(term?.checks.some((check) => check.label === "Targets confirmed by the consultant" && check.ok)).toBe(true);
    const certificates = cards.filter((card) => card.title === "Certificate");
    expect(certificates).toHaveLength(5);
    const qualified = certificates.filter((card) =>
      card.checks.some((check) => check.ok && check.label.startsWith("Counts as qualified")),
    );
    expect(qualified).toHaveLength(4);
    const folder = path.join(process.cwd(), "dados-demo", "empresa-a");
    const level5 = await readPdfPlain(new Uint8Array(readFileSync(path.join(folder, "scan_0057.pdf"))));
    expect(readCertificate("scan_0057.pdf", level5).level).toBe(5);
  }, 60_000);
});
