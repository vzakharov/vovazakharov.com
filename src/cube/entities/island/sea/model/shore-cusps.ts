import type { Vec2 } from '@/scene/shared/lib/vec2';

import { cusped } from '@/nature/shared/shore';
import { SWELL_RUNS } from '@/nature/shared/swell';

/** `cusped` at `xz` in the world frame. */
export const cuspAt = ([x, z]: Vec2): number =>
  cusped(x * SWELL_RUNS[1] - z * SWELL_RUNS[0]);
