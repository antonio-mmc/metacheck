import { z } from "zod";

import { readPdfPlain } from "@/ingest/pdf-text";

export type AcceptanceTerm = {
  companyName: string | null;
  signatory: string | null;
  address: string | null;
};

const acceptanceTermSchema = z.object({
  companyName: z.string().nullable(),
  signatory: z.string().nullable(),
  address: z.string().nullable(),
});

export async function readAcceptanceTerm(bytes: Uint8Array): Promise<AcceptanceTerm> {
  const text = (await readPdfPlain(bytes, 3)).replace(/\s+/g, " ");
  const signatory = text.match(/Pelo benefici[aá]rio:\s*([^,]{3,80}),\s*s[oó]cio-gerente/i)?.[1]?.trim() ?? null;
  return acceptanceTermSchema.parse({
    companyName: text.match(/Benefici[aá]rio\s+([\p{L}0-9 .,'’-]+?Lda\.)/u)?.[1] ?? null,
    signatory,
    address: text.match(/(?:Rua|Avenida|Largo|Praça|Travessa|Lugar)\s+[^.]{8,140}?\d{4}-\d{3}\s+[\p{L} ]+/u)?.[0] ?? null,
  });
}

/** The academic officer signs the certificate and is not on the staff map. */
export function certificateSignatories(text: string): string[] {
  const names: string[] = [];
  for (const match of text.matchAll(/([\p{L}][\p{L} ]{6,80}?), Chefe de Sec[cç][aã]o/gu)) {
    const name = match[1]?.trim();
    if (name) names.push(name);
  }
  return names;
}
