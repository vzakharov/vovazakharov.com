/** Seconds since the latest of `hits` at or before `t`; `Infinity` before the first. */
export function sinceHit(hits: readonly number[], t: number): number {
  let low = 0;
  let high = hits.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if ((hits[middle] ?? Infinity) <= t) low = middle + 1;
    else high = middle;
  }
  const last = hits[low - 1];
  return last === undefined ? Infinity : t - last;
}

/**
 * A hit's punch at `t`, in `[0, 1]`: 1 as it lands, falling to `1/e` after
 * `decay` seconds, 0 before the first.
 */
export const punch = (
  hits: readonly number[],
  t: number,
  decay = 0.12,
): number => Math.exp(-sinceHit(hits, t) / decay);
