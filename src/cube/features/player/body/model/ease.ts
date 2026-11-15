import { ramp, smooth } from '@/cube/shared/lib/ease';

/** 0 up to `from`, 1 from `to` on, and a smooth rise with no kink between. */
export const rise = (t: number, from: number, to: number): number =>
  smooth(ramp(t, from, to));

/** A rise over `[a, b]`, a hold, and a fall over `[c, d]`. */
export const hump = (
  t: number,
  [a, b, c, d]: readonly [number, number, number, number],
): number => rise(t, a, b) * (1 - rise(t, c, d));
