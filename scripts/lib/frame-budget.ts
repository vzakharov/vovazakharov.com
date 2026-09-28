/**
 * What a rendered frame may cost the play run's page: the median JS time of
 * `game.step` on the frames the run draws, per screen, under the software
 * rasterizer. The backdrop and the buttons are baked once a paint, and a look
 * that goes back to drawing its shapes every frame shows here long before a
 * tablet drops a frame.
 */

/**
 * The bound, in ms: with the backdrop and buttons baked the run's frames
 * measure about 14–20 ms at the median (the top of that range with other
 * builds on the machine), and drawn afresh every frame about 31 ms, so this
 * leaves room for a busy machine and still fails that.
 */
export const FRAME_BUDGET_MS = 26;

export function median(values: readonly number[]): number {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const [low, high] = [sorted[middle - 1], sorted[middle]];
  if (high === undefined) return Number.NaN;
  return sorted.length % 2 === 0 && low !== undefined ? (low + high) / 2 : high;
}

/** Why `rendered`, one screen's frame times in ms, breaks the budget, or `undefined` when it keeps it. */
export function overBudget(
  rendered: readonly number[],
  budget = FRAME_BUDGET_MS,
): string | undefined {
  if (rendered.length === 0) return 'no rendered frame was timed';
  const middle = median(rendered);
  if (middle <= budget) return undefined;
  return `a rendered frame's JS takes ${middle.toFixed(1)} ms at the median of ${String(rendered.length)}, over the ${String(budget)} ms budget (lib/frame-budget.ts)`;
}
