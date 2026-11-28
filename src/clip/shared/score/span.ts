/**
 * A stretch of the clip's time is a `Ranged`, in seconds: from `from` up to,
 * not including, `to`.
 */

import type { Ranged } from '@/kernel/shared/typings';

/** Whether `t` falls in `span`. */
export const within = ({ from, to }: Ranged, t: number): boolean =>
  t >= from && t < to;

/** How far through `span` `t` is, 0 at its start to 1 at its end, held at both. */
export const through = ({ from, to }: Ranged, t: number): number =>
  to > from ? Math.min(1, Math.max(0, (t - from) / (to - from))) : 1;
