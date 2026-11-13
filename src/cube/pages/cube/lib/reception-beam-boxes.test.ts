import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { type Box, crossesBeam, SUN_DIR, toShell } from '@/cube/shared/outside';
import { themeOf } from '@/cube/entities/theme';
import { RECEPTION_BEAM_BOXES } from '@/cube/entities/theme/index.test-only';
import {
  holesOf,
  maze,
  mazeWalls,
  planted,
  type Room,
  settingOf,
  traits,
} from '@/cube/entities/world';
import { standingBoxes } from '@/cube/features/decor';

const FLOOR_ONE: Room = { n: 1, x: 0n, y: 0n };

/** The most boxes the beam's shade is given. */
const MOST = 8;

const volume = ({ min, max }: Box): number =>
  (max[0] - min[0]) * (max[1] - min[1]) * (max[2] - min[2]);

/** A box of the room frame, in metres, as the shell frame has it. */
function inShell({ min, max }: Box): Box {
  const a = toShell(min, ROOM_METRES);
  const b = toShell(max, ROOM_METRES);
  return {
    min: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2])],
    max: [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])],
  };
}

/** What the planted world stands in floor 1's beam besides its plants, the largest first. */
async function blockers(): Promise<Box[]> {
  const holeOf = await holesOf(planted, [FLOOR_ONE]);
  const setting = settingOf(
    mazeWalls(maze(planted.seed)),
    traits(planted.seed),
    FLOOR_ONE,
    holeOf(FLOOR_ONE),
  );
  return standingBoxes(setting, themeOf(1).decor)
    .filter(({ thing }) => thing !== 'potted-plant')
    .map((box) => inShell(box))
    .filter((box) => crossesBeam(box, SUN_DIR))
    .toSorted((a, b) => volume(b) - volume(a))
    .slice(0, MOST);
}

describe("what stands in the reception's beam, as its light has it", () => {
  it('is every standing thing of the decor the beam crosses, as large', async () => {
    const stood = await blockers();
    const said = JSON.stringify(
      stood.map(({ min, max }) => ({
        min: min.map((value) => Number(value.toFixed(3))),
        max: max.map((value) => Number(value.toFixed(3))),
      })),
    );
    assert.equal(RECEPTION_BEAM_BOXES.length, stood.length, said);
    for (const [index, { min, max }] of stood.entries()) {
      const held = RECEPTION_BEAM_BOXES[index];
      for (const axis of [0, 1, 2] as const) {
        assert.ok(Math.abs((held?.min[axis] ?? NaN) - min[axis]) < 0.005, said);
        assert.ok(Math.abs((held?.max[axis] ?? NaN) - max[axis]) < 0.005, said);
      }
    }
  });
});
