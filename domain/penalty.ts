/** Shown in Verify. An incomplete step counts as a whole step. */
export const CONSERVATIVE_PENALTY = "Conservative reading: partial steps count.";

/**
 * Half a point for every two points under the threshold, incomplete bands included, capped.
 * The result is not rounded before this runs.
 */
export function penaltyPp(
  roPct: number,
  thresholdPct: number,
  everyPp: number,
  stepPp: number,
  maxPp: number,
): number {
  if (roPct >= thresholdPct) return 0;
  const bands = Math.ceil((thresholdPct - roPct) / everyPp - 1e-9);
  return Math.min(maxPp, bands * stepPp);
}

export function cutEuro(penalty: number, eligibleEuro: number): number {
  return (penalty / 100) * eligibleEuro;
}
