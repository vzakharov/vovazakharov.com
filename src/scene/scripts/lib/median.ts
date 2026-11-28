/** The middle of `values`, the mean of the two middles for an even count; `NaN` for none. */
export function median(values: readonly number[]): number {
  const sorted = values.toSorted((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const [low, high] = [sorted[middle - 1], sorted[middle]];
  if (high === undefined) return Number.NaN;
  return sorted.length % 2 === 0 && low !== undefined ? (low + high) / 2 : high;
}
