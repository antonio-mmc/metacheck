import mammoth from "mammoth";
import Papa from "papaparse";

import type { DocumentKind } from "@/domain/schemas";
import { readPdfPlain } from "@/ingest/pdf-text";
import { gridText, readGrid } from "@/ingest/spreadsheet";

export type Classified = {
  kind: DocumentKind;
  text: string;
  detail: string | null;
};

const PNG = [0x89, 0x50, 0x4e, 0x47];

function isPng(bytes: Uint8Array): boolean {
  return PNG.every((byte, index) => bytes[index] === byte);
}

function looksPdf(bytes: Uint8Array): boolean {
  return bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
}

function looksZip(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes[0] === 0x50 && bytes[1] === 0x4b;
}

async function extractText(bytes: Uint8Array): Promise<string> {
  if (isPng(bytes)) return "";
  if (looksPdf(bytes)) return readPdfPlain(bytes, 2);
  if (looksZip(bytes)) {
    try {
      const docx = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
      if (docx.value.trim()) return docx.value;
    } catch {
      // Not a Word file. Try it as a workbook below.
    }
    return gridText(readGrid(bytes));
  }
  const decoded = new TextDecoder("utf-8").decode(bytes);
  if (decoded.includes(";") && /conta/i.test(decoded)) {
    const parsed = Papa.parse<string[]>(decoded, { delimiter: ";" });
    return parsed.data.map((row) => row.join(" ")).join("\n");
  }
  return decoded;
}

/**
 * Kind comes from the text, never from the file name.
 * The first matching rule wins, so an invoice is not also a certificate.
 */
export function kindFromText(text: string): Pick<Classified, "kind" | "detail"> {
  const sample = text.normalize("NFD").replace(/\p{M}/gu, "");
  if (/fatura/i.test(sample) && /atcud|total iliquido|\biva\b/i.test(sample) && !/balancete/i.test(sample)) {
    return { kind: "irrelevant", detail: "Invoice. It does not change the targets." };
  }
  if (/apresentacao institucional|quem somos/i.test(sample)) {
    return { kind: "irrelevant", detail: "Presentation. It does not change the targets." };
  }
  if (/comunicacao de utilizacao|comunicacao, para utilizacao|licenciamento de obras|controlo previo/i.test(sample)) {
    return { kind: "irrelevant", detail: "Licence. It does not change the targets." };
  }
  if (/termo de aceitacao/i.test(sample)) return { kind: "acceptance_term", detail: null };
  if (/balancete/i.test(sample) || (/\bconta\b/i.test(sample) && /\bdebito\b/i.test(sample) && /\bcredito\b/i.test(sample))) {
    return { kind: "trial_balance", detail: null };
  }
  if (/mapa de pessoal/i.test(sample)) return { kind: "staff_map", detail: null };
  if (/quadro de pessoal/i.test(sample)) return { kind: "single_report", detail: null };
  if (/informacao empresarial simplificada|ies\/da/i.test(sample)) return { kind: "ies", detail: null };
  if (/declaracao de remuneracoes|extracto da declaracao/i.test(sample)) {
    return { kind: "social_security", detail: null };
  }
  if (/certidao|certificado de conclusao|certificamos que|quadro nacional de qualificacoes|chefe de seccao/i.test(sample)) {
    return { kind: "certificate", detail: null };
  }
  if (/aviso para apresentacao de candidaturas|codigo do aviso/i.test(sample)) {
    return { kind: "call", detail: null };
  }
  if (!sample.trim()) {
    return {
      kind: "unreadable",
      detail: "This file has no text the app can read.",
    };
  }
  return {
    kind: "unreadable",
    detail: "This file is not a call, a balance, or a staff document the app knows.",
  };
}

export async function classifyBytes(
  bytes: Uint8Array,
  askModel?: (text: string) => Promise<DocumentKind | null>,
): Promise<Classified> {
  if (isPng(bytes)) {
    return {
      kind: "unreadable",
      text: "",
      detail: "This is an image. Export a text PDF, a spreadsheet, or a CSV.",
    };
  }
  try {
    const text = await extractText(bytes);
    const kind = kindFromText(text);
    const unknown = kind.kind === "unreadable" && /not a call/i.test(kind.detail ?? "") && text.trim().length > 40;
    if (askModel && unknown) {
      try {
        const guessed = await askModel(text);
        if (guessed && guessed !== "unreadable") {
          return { kind: guessed, text, detail: "Classified by the model." };
        }
      } catch {
        return { ...kind, text };
      }
    }
    return { ...kind, text };
  } catch {
    return {
      kind: "unreadable",
      text: "",
      detail: "This file could not be read. Replace it with the original export.",
    };
  }
}
