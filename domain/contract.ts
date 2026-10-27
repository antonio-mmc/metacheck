import type { Provenance } from "@/domain/schemas";

/**
 * Checked reading of the acceptance term for company A.
 * Phase 4c replaces this object with the term reader. The engine does not open the PDF.
 */
export type CompanyContract = {
  companyName: string;
  callCode: string;
  cruiseYear: number;
  preProjectYear: number;
  preProjectEti: number;
  preProjectQualifiedEti: number;
  preProjectTurnover: number;
  preProjectValueAdded: number;
  jobsTargetEti: number;
  qualifiedTargetEti: number;
  turnoverTargetGrowthPct: number;
  valueAddedTargetGrowthPct: number;
  eligibleEuro: number;
  ratePct: number;
  source: Provenance;
};

export const companyAContract: CompanyContract = {
  companyName: "Demo Têxtil, Lda.",
  callCode: "MPR-2024-3",
  cruiseYear: 2026,
  preProjectYear: 2023,
  preProjectEti: 22,
  preProjectQualifiedEti: 3,
  preProjectTurnover: 2_400_000,
  preProjectValueAdded: 720_000,
  jobsTargetEti: 3,
  qualifiedTargetEti: 2,
  turnoverTargetGrowthPct: 25,
  valueAddedTargetGrowthPct: 15,
  eligibleEuro: 2_500_000,
  ratePct: 45,
  source: { file: "Termo Aceitacao assinado.pdf", location: "contracted targets" },
};

/** Checked reading of the acceptance term for company B (signed 14 Feb 2024). Pre-project value added is 35,000 €/FTE × 30 FTE. */
export const companyBContract: CompanyContract = {
  companyName: "Demo Precisão Metalomecânica, Lda.",
  callCode: "MPr-2023-1",
  cruiseYear: 2026,
  preProjectYear: 2022,
  preProjectEti: 30,
  preProjectQualifiedEti: 4,
  preProjectTurnover: 3_200_000,
  preProjectValueAdded: 1_050_000,
  jobsTargetEti: 4,
  qualifiedTargetEti: 1,
  turnoverTargetGrowthPct: 20,
  valueAddedTargetGrowthPct: 10,
  eligibleEuro: 1_600_000,
  ratePct: 30,
  source: { file: "Termo de Aceitacao - DemoPrecisao.pdf", location: "3. Indicadores e metas contratualizadas" },
};
