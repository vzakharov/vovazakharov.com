import { ROOM_METRES } from '../lib/room-shape';
import type { Vec3 } from '../lib/vec';
import { toRoom } from './turn';

/** The cube's side in metres: one side of floor 1's room. */
export const CUBE_METRES = ROOM_METRES;

/** A box square to the axes, by its least and greatest corners. */
export type Box = { min: Vec3; max: Vec3 };

/**
 * The doorway in the cube's east face, in metres: `from` and `to` south of
 * the face's north end, its sill on floor 1's slab.
 */
export const DOORWAY = { from: 0.274, to: 1.244, height: 2.1 };

/** A wall of a room, by the side of the room it stands on. */
export type WallSide = 'east' | 'south' | 'west' | 'north';

/**
 * The doorway as floor 1's room has it: the wall it opens in, and `from` and
 * `to` in metres along that wall from its north or west end.
 */
export const ROOM_DOORWAY: typeof DOORWAY & { wall: WallSide } = (() => {
  const { height } = DOORWAY;
  const [ax, , az] = toRoom([CUBE_METRES, 0, DOORWAY.from], CUBE_METRES);
  const [bx, , bz] = toRoom([CUBE_METRES, 0, DOORWAY.to], CUBE_METRES);
  const along = Math.abs(ax - bx) > Math.abs(az - bz);
  const [from, to] = along ? [ax, bx] : [az, bz];
  const across = along ? az : ax;
  const far = across > CUBE_METRES / 2;
  return {
    wall: along ? (far ? 'south' : 'north') : far ? 'east' : 'west',
    from: Math.min(from, to),
    to: Math.max(from, to),
    height,
  };
})();

/**
 * The cut every doorway makes in its wall, floor 1's way out and every door
 * alike: `from`, `to` and their `middle` along the wall from its north or west
 * end, and the head's height over the slab, in room sides, so it fits a room
 * of any floor.
 */
export const DOORWAY_CUT = {
  from: ROOM_DOORWAY.from / CUBE_METRES,
  to: ROOM_DOORWAY.to / CUBE_METRES,
  middle: (ROOM_DOORWAY.from + ROOM_DOORWAY.to) / 2 / CUBE_METRES,
  height: ROOM_DOORWAY.height / CUBE_METRES,
};
