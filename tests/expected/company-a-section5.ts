/** Company A answer sheet, section 5. The three rehearsed chat questions. */

export const section5 = {
  questions: [
    "Are we going to lose part of the grant?",
    "Is it worth hiring one graduate at 1,500 a month?",
    "Why is value added per worker at risk?",
  ],
  loss: {
    roPct: 64.5,
    turnover: 104,
    valueAdded: 25,
    gapPp: 5.5,
    thresholdPct: 70,
    penaltyPp: 1.5,
    cutEuro: 37_500,
  },
  oneGraduate: { roPct: 66.58, cutEuro: 25_000, savedEuro: 12_500, costToYearEnd: 4_383.75 },
  twoGraduates: { roPct: 70.75, costToYearEnd: 8_767.5, annualEach: 26_302.5 },
  salesEuro: 67_000,
  valueAdded: {
    growthPct: 6.89,
    preEuro: 720_000,
    projectedEuro: 769_636.29,
    preEti: 22,
    eti: 22.67,
    preMarginPct: 30,
    marginPct: 25.45,
    perWorkerGrowthPct: 3.75,
    targetPct: 15,
    ratioPct: 25,
  },
  sources: [
    [
      "Acceptance term (targets)",
      "Balancete_Set2026.csv (turnover, VA)",
      "staff map (FTE)",
      "call MPR-2024-3 p. 21",
    ],
    ["Staff map", "call p. 14–15 and 21", "cost rules (14 salaries, 23.75% social security)"],
    ["Balancete_Set2026.csv (61, 62)", "staff map", "acceptance term"],
  ],
} as const;
