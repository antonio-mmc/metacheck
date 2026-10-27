export type TargetsSource = "consultant" | "ai";

export type IndicatorState = "on_track" | "at_risk" | "off_track";

export type IndicatorView = {
  code: string;
  label: string;
  ratioPct: number;
  basis: string;
  lines: string[];
};

export type PathFact = {
  label: string;
  value: string;
};

export type PanelView = {
  companyName: string;
  callCode: string;
  cruiseYear: number;
  figuresTo: string;
  roPct: number;
  thresholdPct: number;
  penaltyPp: number;
  cutEuro: number;
  deadline: string;
  roLines: string[];
  indicators: IndicatorView[];
  suggestionLines: string[];
  path: PathFact[];
  targetsSource: TargetsSource;
};

/** On track at 100%, at risk from 70% up to 100%, off track below 70%. */
export function indicatorState(ratioPct: number): IndicatorState {
  if (ratioPct >= 100) return "on_track";
  if (ratioPct >= 70) return "at_risk";
  return "off_track";
}

export function expectsCut(roPct: number, thresholdPct: number): boolean {
  return roPct < thresholdPct;
}

export function stateLabel(state: IndicatorState): string {
  if (state === "on_track") return "On track";
  if (state === "at_risk") return "At risk";
  return "Off track";
}

export function targetsSourceLabel(source: TargetsSource): string {
  if (source === "consultant") return "Targets confirmed by the consultant";
  return "Targets read by AI";
}
