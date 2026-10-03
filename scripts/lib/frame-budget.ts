/**
 * What a rendered frame should cost the play run's page: the median JS time
 * of `game.step` on the frames the run draws, per screen, under the software
 * rasterizer. The run reports a frame time against the budget and never fails
 * on it: the game plays fine on a real machine at what the run measures, so
 * a miss is a number to watch, not a red.
 */

/**
 * The bound, in ms: with the backdrop and buttons baked the run's frames
 * measure about 14–20 ms at the median (the top of that range with other
 * builds on the machine), and drawn afresh every frame about 31 ms, so this
 * leaves room for a busy machine and still flags that.
 */
export const FRAME_BUDGET_MS = 26;

export function median(values: readonly number[]): number {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const [low, high] = [sorted[middle - 1], sorted[middle]];
  if (high === undefined) return Number.NaN;
  return sorted.length % 2 === 0 && low !== undefined ? (low + high) / 2 : high;
}

/** How `ms` stands against the budget, labelled as a report rather than a verdict. */
export function againstBudget(ms: number, budget = FRAME_BUDGET_MS): string {
  return ms <= budget
    ? `within the ${String(budget)} ms budget`
    : `over the ${String(budget)} ms budget — reported, not failing`;
}

/** The frame-budget line for `rendered`, one span's frame times in ms: its median against the budget. */
export function budgetReport(
  rendered: readonly number[],
  budget = FRAME_BUDGET_MS,
): string {
  if (rendered.length === 0) return 'frame budget: no rendered frame was timed';
  const middle = median(rendered);
  return `frame budget: ${middle.toFixed(1)} ms median over ${String(rendered.length)} frames, ${againstBudget(middle, budget)}`;
}
