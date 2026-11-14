import { cross3, scaled, unit3, type Vec3 } from '@/cube/shared/lib/vec';

import { loft, type Ring } from './loft';
import { plus, type Quad, UP } from './quad';
import type { Room } from './room';

/**
 * The pill, a two-part capsule, in room sides of the floor it lies on: 6 cm
 * long and 2.4 cm through on floor 1, a size nobody swallows gladly.
 */
export const PILL_LENGTH = 0.012;
export const PILL_RADIUS = 0.0024;

/**
 * The capsule's halves, the cube's own black and its pale grey: the black
 * half shows on the paper under it, the grey one against a dark wall.
 */
const PILL_PAINTS = [0x14_15_18, 0xc6_c8_cc] as const;

/** How many rings round off an end, and how many quads go round the capsule. */
const CAP_RINGS = 4;
const PILL_SIDES = 8;

/**
 * A pill's quads in a frame where a room side is `side` long: its middle at
 * `centre`, its length along `axis`, a unit vector, the black half that way.
 */
export function pillQuads(
  centre: Vec3,
  axis: Vec3,
  side: number,
  room: Room,
): Quad[] {
  const across = unit3(
    cross3(axis, Math.abs(axis[1]) > 0.9 ? ([1, 0, 0] as const) : UP),
  );
  const through = cross3(axis, across);
  const radius = PILL_RADIUS * side;
  const straight = (PILL_LENGTH / 2) * side - radius;
  const ringAt = (along: number, half: number): Ring => ({
    centre: plus(centre, scaled(axis, along)),
    wide: scaled(across, half),
    thick: scaled(through, half),
  });
  return ([1, -1] as const).flatMap((end, index) => {
    const cap = Array.from({ length: CAP_RINGS }, (_, ring) => {
      const angle = (Math.PI / 2) * (1 - ring / CAP_RINGS);
      return ringAt(
        end * (straight + radius * Math.sin(angle)),
        // The tip is drawn nearly shut, as a loft's rounded end is.
        radius * Math.max(Math.cos(angle), 0.02),
      );
    });
    return loft(
      [...cap, ringAt(end * straight, radius), ringAt(0, radius)],
      room,
      {
        surface: 'plastic',
        paint: PILL_PAINTS[index] ?? PILL_PAINTS[0],
        sides: PILL_SIDES,
      },
    );
  });
}
