import { companyAContract, companyBContract, type CompanyContract } from "@/domain/contract";
import { ruleCardSchema, type RuleCard } from "@/domain/rule-card";
import cardA from "@/data/rule-cards/MPR-2024-3.json";
import cardB from "@/data/rule-cards/MPr-2023-1.json";

export type ProjectId = "a" | "b";

export type DemoProject = {
  id: ProjectId;
  folder: string;
  callFile: string;
  contract: CompanyContract;
  card: RuleCard;
};

/** One entry per demo project: the company folder, its public call, the checked term and the call's rule card. */
export const projects: Record<ProjectId, DemoProject> = {
  a: {
    id: "a",
    folder: "empresa-a",
    callFile: "aviso-MPR-2024-3-InovacaoProdutiva-BaixaDensidade.pdf",
    contract: companyAContract,
    card: ruleCardSchema.parse(cardA),
  },
  b: {
    id: "b",
    folder: "empresa-b",
    callFile: "aviso-MPr-2023-1-InovacaoProdutiva.pdf",
    contract: companyBContract,
    card: ruleCardSchema.parse(cardB),
  },
};

export function projectId(value: unknown): ProjectId {
  return value === "b" ? "b" : "a";
}
