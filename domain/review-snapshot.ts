import type { PanelView } from "@/domain/panel";

/**
 * Layout figures for the phase 0 screen, copied from the company A answer sheet.
 * The end of phase 1 replaces this object with the same PanelView from the pipeline.
 * Targets stay "consultant" until phase 4c reads the acceptance term.
 */
export const reviewSnapshot: PanelView = {
  companyName: "Demo Têxtil",
  callCode: "MPR-2024-3",
  cruiseYear: 2026,
  figuresTo: "30 Sep",
  roPct: 64.5,
  thresholdPct: 70,
  penaltyPp: 1.5,
  cutEuro: 37500,
  deadline: "1 hire would have been enough by 1 Sep. Today: 2, starting 1 Nov.",
  targetsSource: "consultant",
  roLines: [
    "The two best results are turnover at 104.00% and value added per worker at 25.00%.",
    "Result = (104.00 + 25.00) / 2 = 64.50%.",
    "Threshold 70%. Gap of 5.5 percentage points.",
    "Conservative reading: partial steps count. Three steps × 0.5 = 1.5 percentage points.",
    "Cut = 1.5% × €2,500,000.00 eligible investment = €37,500.00.",
  ],
  indicators: [
    {
      code: "RPR001",
      label: "Turnover",
      ratioPct: 104,
      basis: "€3,024,000.00 projected · target +25%",
      lines: [
        "September turnover €2,268,000.00, accounts 71 and 72, Balancete_Set2026.csv.",
        "At the current pace: €2,268,000.00 × 12 / 9 = €3,024,000.00.",
        "Pre-project €2,400,000.00. Achieved +26.00% against a contracted +25.00%.",
        "26.00 / 25.00 = 104.00% of the target.",
      ],
    },
    {
      code: "RPR002",
      label: "Value added per worker",
      ratioPct: 25,
      basis: "€33,954.54 per worker · target +15%",
      lines: [
        "Projected value added €769,636.29 over 22.67 FTE = €33,954.54 per worker.",
        "Pre-project €32,727.27. Achieved +3.75% against a contracted +15.00%.",
        "3.75 / 15.00 = 25.00% of the target.",
        "Value added from Balancete_Set2026.csv. FTE from the staff map.",
      ],
    },
    {
      code: "RPR003",
      label: "Jobs created",
      ratioPct: 22.22,
      basis: "+0.67 FTE · target +3.00",
      lines: [
        "Projected FTE 22.67. Pre-project 22.00. Achieved +0.67 against a contracted +3.00.",
        "0.67 / 3.00 = 22.22% of the target.",
        "Staff map to 30 Sep 2026. People still employed are kept until 31 Dec.",
      ],
    },
    {
      code: "RSR23",
      label: "Qualified jobs created",
      ratioPct: 20.83,
      basis: "+0.42 FTE · target +2.00",
      lines: [
        "Projected qualified FTE 3.42. Pre-project 3.00. Achieved +0.42 against a contracted +2.00.",
        "0.42 / 2.00 = 20.83% of the target.",
        "The August graduate counts for 5 months out of 12. Qualifications come from the staff map.",
      ],
    },
  ],
  suggestionLines: [
    "2 graduates from 1 Nov: €8,767.50 until 31 Dec, avoids €37,500.00.",
    "Or sell €67,000.00 more by 31 Dec, no direct cost.",
  ],
  path: [
    { label: "Hires", value: "2" },
    { label: "Profile", value: "Graduate" },
    { label: "Monthly salary", value: "€1,500.00" },
    { label: "Starts", value: "1 Nov" },
  ],
};
