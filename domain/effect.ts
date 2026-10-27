import { formatEuro, formatPercent } from "@/domain/format";
import type { Lever, SimulationResult } from "@/domain/simulate";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function hirePhrase(levers: Extract<Lever, { kind: "hire" }>[]): string {
  const counted = (qualified: boolean, who: string): string | null => {
    const count = levers
      .filter((lever) => lever.qualified === qualified)
      .reduce((total, lever) => total + lever.count, 0);
    if (count === 0) return null;
    return `${count} ${count === 1 ? who : `${who}s`}`;
  };
  const who = [counted(true, "graduate"), counted(false, "non-graduate")]
    .filter((part): part is string => part !== null)
    .join(" and ");
  const start = levers[0]?.startOn ?? "";
  const month = MONTHS[Number(start.slice(5, 7)) - 1] ?? "";
  return `${who} from 1 ${month}`;
}

/** The sentence under the simulator. It follows the levers that are actually on. */
export function effectCopy(result: SimulationResult, levers: Lever[]): string {
  const hires = levers.filter(
    (lever): lever is Extract<Lever, { kind: "hire" }> => lever.kind === "hire",
  );
  const parts: string[] = [];
  if (hires.length > 0) parts.push(hirePhrase(hires));
  if (result.salesEuro > 0) parts.push(`${formatEuro(result.salesEuro)} more sales by 31 December`);
  const cut = result.after.cutEuro === 0 ? "no cut" : `cut ${formatEuro(result.after.cutEuro)}`;
  const cost =
    result.costToYearEnd === null
      ? "No staff cost."
      : `Cost ${formatEuro(result.costToYearEnd)} until 31 December.`;
  const saved = result.before.cutEuro - result.after.cutEuro;
  const saving = saved > 0 ? ` Saves ${formatEuro(saved)}.` : "";
  return `${parts.join(" and ")}: result ${formatPercent(result.after.roPct)}, ${cut}. ${cost}${saving}`;
}
