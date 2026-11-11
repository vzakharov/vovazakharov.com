/** 0 up to `from`, 1 from `to` on, and a smooth rise with no kink between. */
export function ramp(t: number, from: number, to: number): number {
  const s = Math.min(1, Math.max(0, (t - from) / (to - from)));
  return s * s * (3 - 2 * s);
}

/** A rise over `[a, b]`, a hold, and a fall over `[c, d]`. */
export const hump = (
  t: number,
  [a, b, c, d]: readonly [number, number, number, number],
): number => ramp(t, a, b) * (1 - ramp(t, c, d));
