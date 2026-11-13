import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Furnishing, Thing } from '@/cube/shared/lib/thing';
import { type Box, crossesBeam, SUN_DIR, toShell } from '@/cube/shared/outside';
import type { Setting, Vec3 } from '@/cube/entities/world';

import { standingParts } from './furnish';

/** What the beam's shade draws finer than a box, so no box stands for it. */
const FINER: ReadonlySet<Thing> = new Set(['potted-plant']);

/** `box` of the room's frame, in metres, as the shell's frame has it. */
function inShell({ min, max }: Box): Box {
  const [a, b] = [toShell(min, ROOM_METRES), toShell(max, ROOM_METRES)];
  const each = (pick: (...of: number[]) => number): Vec3 => [
    pick(a[0], b[0]),
    pick(a[1], b[1]),
    pick(a[2], b[2]),
  ];
  return { min: each(Math.min), max: each(Math.max) };
}

const volume = ({ min, max }: Box): number =>
  (max[0] - min[0]) * (max[1] - min[1]) * (max[2] - min[2]);

/**
 * What stands in the sun's beam through floor 1's doorway: the boxes, in
 * metres of the shell's frame, of the `most` largest parts of the things of
 * `furnish`'s room that stand on the floor with a doorway's ray through them
 * — largest first, equals from the north-west. A thing shades by its parts
 * so that light passes between them.
 */
export function sunBlockers(
  setting: Setting,
  decor: readonly Furnishing[],
  most: number,
): Box[] {
  if (setting.room.n !== 1) return [];
  return standingParts(setting, decor)
    .filter(({ thing }) => !FINER.has(thing))
    .flatMap(({ parts }) => parts.map((part) => inShell(part)))
    .filter((box) => crossesBeam(box, SUN_DIR))
    .toSorted(
      (a, b) =>
        volume(b) - volume(a) ||
        a.min[0] - b.min[0] ||
        a.min[2] - b.min[2] ||
        a.min[1] - b.min[1],
    )
    .slice(0, most);
}
