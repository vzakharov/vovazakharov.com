/**
 * Looking up and down: the view raised or lowered from the pitch its height
 * gives (`pitchAt`) by an offset the eye holds, so the eyes stay where they
 * were raised to as the eye climbs, until a limit stops them.
 */

import { R } from '@/island/shared/globe';

import { clamp } from './clamp';

/** How far below the horizon the eye looks near the ground. */
export const GROUND_PITCH = (10 * Math.PI) / 180;

/** The height up to which the eye keeps `GROUND_PITCH`. */
const GROUND_PITCH_BELOW = 20;

/**
 * The height from which the eye looks straight down. With
 * `GROUND_PITCH_BELOW` it sets where the look turns toward the horizon on the
 * way down: the point below leaves the frame at about 100 km.
 */
const STRAIGHT_DOWN_ABOVE = 18_000_000;

/**
 * How far below the horizon the eye looks at `height`, radians: from
 * `GROUND_PITCH` near the ground, smoothly in the logarithm of height to
 * straight down at `STRAIGHT_DOWN_ABOVE`.
 */
export function pitchAt(height: number): number {
  const share =
    Math.log(height / GROUND_PITCH_BELOW) /
    Math.log(STRAIGHT_DOWN_ABOVE / GROUND_PITCH_BELOW);
  const t = clamp(share, 0, 1);
  const eased = t * t * (3 - 2 * t);
  return GROUND_PITCH + (Math.PI / 2 - GROUND_PITCH) * eased;
}

export type Looked = {
  /** Radians the view is raised above the pitch its height gives; negative lowers it. */
  readonly look: number;
};

/**
 * What the player asks of the look over one frame, beside `Intent`: `tilt` is
 * held, in `[-1, 1]` and applied per second; `nod` is what arrived since the
 * last frame, applied whole.
 */
export type Tilting = {
  /** Held tilt: `1` raises the view at `TILT_RADIANS_PER_SECOND`, `-1` lowers it. */
  readonly tilt: number;
  /** Radians the view is raised; negative lowers it. */
  readonly nod: number;
};

export const UNTILTED: Tilting = { tilt: 0, nod: 0 };

/** How fast a held look key tilts the view: as fast as a held turn key turns. */
export const TILT_RADIANS_PER_SECOND = (80 * Math.PI) / 180;

/** How far above the horizon the view can be raised. */
export const ABOVE_HORIZON = (5 * Math.PI) / 180;

/** How far below the level the sea's horizon lies from `height` above it, radians. */
export const dipAt = (height: number) => Math.acos(R / (R + height));

/**
 * How far below the level the eye looks at `height` raised by `look`,
 * radians: never past straight down, nor more than `ABOVE_HORIZON` over the
 * horizon.
 */
export const pitchFor = (height: number, look: number) =>
  clamp(pitchAt(height) - look, dipAt(height) - ABOVE_HORIZON, Math.PI / 2);

/** `look` brought within what `pitchFor` lets show at `height`. */
export const lookWithin = (look: number, height: number) =>
  clamp(
    look,
    pitchAt(height) - Math.PI / 2,
    pitchAt(height) - dipAt(height) + ABOVE_HORIZON,
  );
