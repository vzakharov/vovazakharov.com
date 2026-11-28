import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';

import type { Placed } from './frame';
import { walledRooms } from './geometry';
import type { RolledMaze } from './maze';
import { boardFacets, type BoardShape, type Hung } from './mount';
import { PORTALS } from './portal-counts';
import { type Portal, portalNumbered } from './portals';
import type { InRoom } from './pose';
import type { Facet } from './quad';
import { roomKey } from './room';
import type { View } from './rooms';
import type { DoorWall } from './wall-frame';

/** A hint board: a sheet of A4 on its side on floor 1, its middle 1.5 m up. */
const HINT: BoardShape = { width: 0.0594, height: 0.042, hungAt: 0.3 };

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
export function hintsBeside({ n, x, y, isEast }: DoorWall): Hung[] {
  const faced = (toward: 1 | -1): Hung => {
    // The wall's line in the frame of the room the board faces into.
    const line = toward === 1 ? 0 : 1;
    const at: InRoom = isEast ? { u: line, v: BESIDE } : { u: BESIDE, v: line };
    const facing: InRoom = isEast ? { u: toward, v: 0 } : { u: 0, v: toward };
    const step = toward === 1 ? 1n : 0n;
    return {
      room: isEast ? { n, x: x + step, y } : { n, x, y: y + step },
      mount: { at, facing, onPost: false },
    };
  };
  return [faced(-1), faced(1)];
}

/**
 * The first portal door in the game: portal 0 of the first floor that has
 * any, which a body going down meets before every other.
 */
export const firstPortal = (rolled: RolledMaze): Portal =>
  portalNumbered(rolled, PORTALS.first, 0n);

/**
 * The hint boards among the rooms whose walls `view` draws: those beside
 * `firstPortal`, and no other door.
 */
export function hintsSeen(rolled: RolledMaze, view: View): Hung[] {
  const seen = new Set(
    walledRooms(view)
      .filter(({ n }) => n === PORTALS.first)
      .map((room) => roomKey(room)),
  );
  if (seen.size === 0) return [];
  return hintsBeside(firstPortal(rolled).wall).filter(({ room }) =>
    seen.has(roomKey(room)),
  );
}

/** The board of `hint`, at `place` in the eye's frame. */
export const hintFacets = ({ mount, room }: Hung, place: Placed): Facet[] =>
  boardFacets(mount, HINT, room, place);
