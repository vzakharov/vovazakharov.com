import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';

import type { Placed } from './frame';
import { walledRooms } from './geometry';
import type { RolledMaze } from './maze';
import { boardFacets, type BoardShape, type Hung } from './mount';
import { PORTALS } from './portal-counts';
import { portalsOf } from './portals';
import type { InRoom } from './pose';
import type { Facet } from './quad';
import { roomKey } from './room';
import type { View } from './rooms';
import type { DoorWall } from './wall-frame';

/** A hint board on one face of a door's wall, the door to its reader's right or left. */
export type Hint = Hung & { doorOnRight: boolean };

/** A hint board: 1.3 m wide and 65 cm tall on floor 1, its middle 1.5 m up. */
const HINT: BoardShape = { width: 0.26, height: 0.13, hungAt: 0.3 };

/** The wall left bare between a doorway's edge and the board, in room sides. */
const GAP = 0.03;

/**
 * The board's middle along its wall, from the wall's north or west end: beside
 * the doorway, on the side of it the wall's middle is on, where the wall is
 * long enough to hold it.
 */
const BESIDE =
  DOORWAY_CUT.middle < 0.5
    ? DOORWAY_CUT.to + GAP + HINT.width / 2
    : DOORWAY_CUT.from - GAP - HINT.width / 2;

/**
 * The hint boards beside the door in `wall`, one on each face: a portal is
 * gone through from either side, so each room it stands between reads one.
 */
export function hintsBeside({ n, x, y, isEast }: DoorWall): Hint[] {
  const faced = (toward: 1 | -1): Hint => {
    // The wall's line in the frame of the room the board faces into.
    const line = toward === 1 ? 0 : 1;
    const at: InRoom = isEast ? { u: line, v: BESIDE } : { u: BESIDE, v: line };
    const facing: InRoom = isEast ? { u: toward, v: 0 } : { u: 0, v: toward };
    // Rightward for a reader is `(facing.v, −facing.u)`; the door lies along
    // the wall from the board, which is +v on an east wall and +u on a south.
    const right = isEast ? 0 - facing.u : facing.v;
    const step = toward === 1 ? 1n : 0n;
    return {
      room: isEast ? { n, x: x + step, y } : { n, x, y: y + step },
      mount: { at, facing, onPost: false },
      doorOnRight: right * (DOORWAY_CUT.middle - BESIDE) > 0,
    };
  };
  return [faced(-1), faced(1)];
}

/**
 * The hint boards among the rooms whose walls `view` draws: those beside the
 * first portal of the first floor that has any, the first a body meets on its
 * way down.
 */
export function hintsSeen(rolled: RolledMaze, view: View): Hint[] {
  const seen = new Set(
    walledRooms(view)
      .filter(({ n }) => n === PORTALS.first)
      .map((room) => roomKey(room)),
  );
  if (seen.size === 0) return [];
  return portalsOf(rolled, PORTALS.first)
    .filter(({ number }) => number === 0n)
    .flatMap(({ wall }) => hintsBeside(wall))
    .filter(({ room }) => seen.has(roomKey(room)));
}

/** The board of `hint`, at `place` in the eye's frame. */
export const hintFacets = ({ mount, room }: Hint, place: Placed): Facet[] =>
  boardFacets(mount, HINT, room, place);
