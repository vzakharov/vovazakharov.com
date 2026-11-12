import {
  CEILING_HEIGHT,
  ROOM_METRES,
  WALL_HALF,
} from '@/cube/shared/lib/room-shape';
import type { Vec3 } from '@/cube/shared/lib/vec';
import { DOORWAY } from '@/cube/shared/outside';

import { face, type Quad } from './quad';
import type { Room } from './room';

/** A rect of a wall: along it from its north end, then up from the slab. */
type Pane = readonly [from: number, to: number, foot: number, top: number];

/**
 * Floor 1's east wall round the doorway, as the room sees it: the wall's
 * face from `corner`, its north end on the slab, in a frame where the room is
 * `side` across, with the doorway left open. The side stays a closed one to
 * everything that asks — lamps, decor, the body — since only the eye and the
 * sun go through it.
 */
export function doorwayWall(corner: Vec3, side: number, room: Room): Quad[] {
  const [x, y, z] = corner;
  const metre = side / ROOM_METRES;
  const top = side * CEILING_HEIGHT;
  const [north, south, head] = [
    DOORWAY.from * metre,
    DOORWAY.to * metre,
    DOORWAY.height * metre,
  ];
  const panes: Pane[] = [
    [0, north, 0, top],
    [south, side, 0, top],
    [north, south, head, top],
  ];
  return panes.map(([from, to, foot, upTo]) =>
    face(
      [x - side * WALL_HALF, y + foot, z + from],
      [0, 0, to - from],
      [0, upTo - foot, 0],
      room,
      'wall',
    ),
  );
}
