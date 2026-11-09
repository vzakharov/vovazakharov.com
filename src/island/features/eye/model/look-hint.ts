/**
 * When the player is told the look can move: up once the horizon sits at or
 * below the middle of the frame's side edges, down once the height's pitch
 * has reached its floor — neither once the player has moved the look.
 */

import type { Elevated } from '@/island/shared/globe';

import { dipAt, type Looked, pitchFor } from './look';
import { fovFor, GROUND_PITCH, pitchAt } from './pose';

export type LookHint = 'up' | 'down';

/**
 * The pitch below the level at or under which the horizon at the side edges
 * of a screen `aspect` wide per unit of height sits at or below their middle,
 * from `height`, radians: the ray through a side edge at mid-height then
 * grazes the horizon, `asin(sin δ / cos(φ/2))` with `δ` the horizon's dip and
 * `φ` the horizontal field of view. High enough that those rays miss the
 * planet at every pitch, it is straight down.
 */
export function upHintPitch(height: number, aspect: number): number {
  const across = 2 * Math.atan(Math.tan(fovFor(aspect) / 2) * aspect);
  const share = Math.sin(dipAt(height)) / Math.cos(across / 2);
  return share >= 1 ? Math.PI / 2 : Math.asin(share);
}

/** The hint `eye` earns on a screen `aspect` wide per unit of height, if any. */
export function lookHint(
  { height, look }: Elevated & Looked,
  aspect: number,
): LookHint | undefined {
  if (look !== 0) return undefined;
  if (pitchAt(height) <= GROUND_PITCH) return 'down';
  if (pitchFor(height, look) <= upHintPitch(height, aspect)) return 'up';
  return undefined;
}
