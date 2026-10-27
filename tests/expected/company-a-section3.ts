/** Company A answer sheet, section 3, including the quarter-by-quarter year-end projections. */

export const section3 = {
  bestCodes: ["RPR001", "RPR002"] as const,
  roPct: 64.5,
  penaltyPp: 1.5,
  cutEuro: 37_500,
  incentiveBefore: 1_125_000,
  incentiveAfter: 1_087_500,
  penaltyNote: "Conservative reading: partial steps count.",
  deadline: "1 hire would have been enough by September. Today: 2, starting 1 November.",
  deadlineHeadline: "1 Nov",
  quarters: [
    { label: "Q1", roPct: 58.99, penaltyPp: 3, cutEuro: 75_000 },
    { label: "Q2", roPct: 73.39, penaltyPp: 0, cutEuro: 0 },
    { label: "Q3", roPct: 64.5, penaltyPp: 1.5, cutEuro: 37_500 },
  ],
  graduates: { count: 2, costToYearEnd: 8_767.5, roPct: 70.75, cutEuro: 0 },
  sales: { euro: 67_000, roPct: 70.08, cutEuro: 0 },
} as const;
