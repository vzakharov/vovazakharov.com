import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  beamPatches,
  INTERIOR_TURN,
  QUARTER_TURNS,
  type Quarters,
  SUN_DIR,
  toRoom,
} from '@/cube/shared/cube-boundary';
import { ROOM_METRES } from '@/cube/shared/lib/room-shape';

import { holeQuarter, type Quarter } from './hole';
import { planted } from './planted';

/** The quarter of floor 1's room a point of the shell's frame is over, the interior turned `turn`. */
function quarterOver(
  [east, , south]: readonly number[],
  turn: Quarters,
): Quarter {
  const [x, , z] = toRoom([east ?? 0, 0, south ?? 0], ROOM_METRES, turn);
  return { qx: x < ROOM_METRES / 2 ? 0 : 1, qy: z < ROOM_METRES / 2 ? 0 : 1 };
}

/** Whether the doorway's beam lands anywhere in or over `quarter` of floor 1, the interior turned `turn`. */
const lit = ({ qx, qy }: Quarter, turn: Quarters): boolean =>
  beamPatches(SUN_DIR, 0.05).some(({ middle }) => {
    const over = quarterOver(middle, turn);
    return over.qx === qx && over.qy === qy;
  });

describe("the interior's turn in its shell", () => {
  it("is the one turn at which the doorway's beam misses the quarter of floor 1 its hole is in", async () => {
    const hole = await holeQuarter(planted, 1, 0n, 0n);
    assert.ok(hole !== null);
    assert.deepEqual(
      QUARTER_TURNS.filter((turn) => !lit(hole, turn)),
      [INTERIOR_TURN],
    );
  });
});
