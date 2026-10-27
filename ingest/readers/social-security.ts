import { z } from "zod";

import { readPdfPlain } from "@/ingest/pdf-text";

export type SocialSecurityReturn = {
  year: number;
  month: number;
  companyName: string | null;
  address: string | null;
  people: { name: string; niss: string }[];
};

const socialSecuritySchema = z.object({
  year: z.number().int().min(1990).max(2100),
  month: z.number().int().min(1).max(12),
  companyName: z.string().nullable(),
  address: z.string().nullable(),
  people: z.array(z.object({ name: z.string().min(1), niss: z.string().regex(/^\d{11}$/) })),
});

export async function readSocialSecurity(bytes: Uint8Array): Promise<SocialSecurityReturn> {
  const text = (await readPdfPlain(bytes, 2)).replace(/\s+/g, " ");
  const reference = text.match(/Ano\/M[eê]s de refer[eê]ncia\s*(\d{4})\/(\d{2})/i);
  const people = new Map<string, string>();
  for (const match of text.matchAll(/(\d{11})\s+((?:[A-ZÁÉÍÓÚÂÊÔÃÕÇ]+\s+){1,5}?)(?=\d{4}\/)/g)) {
    const niss = match[1] ?? "";
    const name = (match[2] ?? "").trim();
    if (niss && name) people.set(niss, name);
  }
  return socialSecuritySchema.parse({
    year: Number(reference?.[1] ?? "0"),
    month: Number(reference?.[2] ?? "0"),
    companyName: text.match(/Entidade\s+([\p{L}0-9 .,'’-]+?Lda\.)/u)?.[1] ?? null,
    address: text.match(/(?:Rua|Avenida|Largo|Praça|Travessa|Lugar)\s+[^.]{8,140}?\d{4}-\d{3}\s+[\p{L} ]+/u)?.[0] ?? null,
    people: [...people.entries()].map(([niss, name]) => ({ niss, name })),
  });
}
