/**
 * When the player is told the look can move: up once the horizon shows at the
 * frame's top corners, down once the height's pitch has reached its floor —
 * neither once the player has moved the look.
 */

import type { Elevated } from '@/island/shared/globe';

import { dipAt, GROUND_PITCH, type Looked, pitchAt, pitchFor } from './look';
import { fovFor } from './pose';

export type LookHint = 'up' | 'down';

/**
 * The pitch below the level at or under which the horizon shows at the top
 * corners of a screen `aspect` wide per unit of height, from `height`,
 * radians: the ray through a top corner then grazes the horizon.
 */
export function upHintPitch(
  height: number,
  aspect: number,
): number | undefined {
  const up = fovFor(aspect) / 2;
  return grazingPitch(dipAt(height), up, Math.atan(Math.tan(up) * aspect));
}

/**
 * The pitch below the level at which the ray through a top corner of a frame
 * with half fields `across` and `up` grazes a horizon `dip` below the level,
 * radians: `θv + asin(sin δ · √(1 + tan²θh · cos²θv))`. `undefined` where no
 * pitch up to straight down puts a corner ray on the horizon — the asin's
 * argument past 1, or the pitch past `π/2` — the planet fitting in the frame.
 */
export function grazingPitch(
  dip: number,
  up: number,
  across: number,
): number | undefined {
  const share = Math.sin(dip) * Math.hypot(1, Math.tan(across) * Math.cos(up));
  if (share > 1) return undefined;
  const pitch = up + Math.asin(share);
  return pitch > Math.PI / 2 ? undefined : pitch;
}

/** The hint `eye` earns on a screen `aspect` wide per unit of height, if any. */
export function lookHint(
  { height, look }: Elevated & Looked,
  aspect: number,
): LookHint | undefined {
  if (look !== 0) return undefined;
  if (pitchAt(height) <= GROUND_PITCH) return 'down';
  const threshold = upHintPitch(height, aspect);
  if (threshold !== undefined && pitchFor(height, look) <= threshold) {
    return 'up';
  }
  return undefined;
}
