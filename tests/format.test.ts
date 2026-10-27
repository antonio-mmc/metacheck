import { formatEuro, formatPercent, formatPp } from "@/domain/format";
import { expectsCut, indicatorState, targetsSourceLabel } from "@/domain/panel";
import { reviewSnapshot } from "@/domain/review-snapshot";
import { describe, expect, it } from "vitest";

describe("figures", () => {
  it("formats money, percents and steps in English", () => {
    expect(formatPercent(64.5)).toBe("64.50%");
    expect(formatEuro(37500)).toBe("€37,500.00");
    expect(formatEuro(8767.5)).toBe("€8,767.50");
    expect(formatPp(1.5)).toBe("1.5 p.p.");
  });
});

describe("indicator state", () => {
  it("follows the 100% and 70% bands", () => {
    expect(indicatorState(104)).toBe("on_track");
    expect(indicatorState(100)).toBe("on_track");
    expect(indicatorState(99.99)).toBe("at_risk");
    expect(indicatorState(70)).toBe("at_risk");
    expect(indicatorState(69.99)).toBe("off_track");
  });

  it("expects a cut only below the threshold", () => {
    expect(expectsCut(64.5, 70)).toBe(true);
    expect(expectsCut(70, 70)).toBe(false);
  });
});

describe("review snapshot", () => {
  it("shows the company A result and keeps targets with the consultant", () => {
    expect(reviewSnapshot.roPct).toBe(64.5);
    expect(reviewSnapshot.penaltyPp).toBe(1.5);
    expect(reviewSnapshot.cutEuro).toBe(37500);
    expect(reviewSnapshot.indicators.map((indicator) => indicator.ratioPct)).toEqual([
      104, 25, 22.22, 20.83,
    ]);
    expect(reviewSnapshot.targetsSource).toBe("consultant");
    expect(targetsSourceLabel(reviewSnapshot.targetsSource)).toBe(
      "Targets confirmed by the consultant",
    );
    expect(JSON.stringify(reviewSnapshot)).not.toContain("read by AI");
  });
});
