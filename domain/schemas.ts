import { z } from "zod";

export const provenanceSchema = z.object({
  file: z.string().min(1),
  location: z.string().min(1),
});

export type Provenance = z.infer<typeof provenanceSchema>;

export const documentKindSchema = z.enum([
  "call",
  "acceptance_term",
  "trial_balance",
  "staff_map",
  "single_report",
  "ies",
  "social_security",
  "certificate",
  "irrelevant",
  "unreadable",
]);

export type DocumentKind = z.infer<typeof documentKindSchema>;

export const accountRowSchema = z.object({
  code: z.string(),
  description: z.string(),
  debit: z.number(),
  credit: z.number(),
  source: provenanceSchema,
});

export type AccountRow = z.infer<typeof accountRowSchema>;

export const personRecordSchema = z.object({
  name: z.string().min(1),
  nif: z.string().nullable(),
  niss: z.string().nullable(),
  weeklyHours: z.number().positive(),
  startedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  habilitationCode: z.string().nullable(),
  source: provenanceSchema,
});

export type PersonRecord = z.infer<typeof personRecordSchema>;
