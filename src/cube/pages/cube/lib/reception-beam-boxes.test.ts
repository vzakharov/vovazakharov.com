import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

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
import { sunBlockers } from '@/cube/features/decor';

const FLOOR_ONE: Room = { n: 1, x: 0n, y: 0n };

/** The most boxes the beam's shade is given: every pixel of the room tests each. */
const MOST = 12;

describe("what stands in the reception's beam, as its light has it", () => {
  it("is the parts of the decor's standing things the beam crosses, the largest first", async () => {
    const holeOf = await holesOf(planted, [FLOOR_ONE]);
    const setting = settingOf(
      mazeWalls(maze(planted.seed)),
      traits(planted.seed),
      FLOOR_ONE,
      holeOf(FLOOR_ONE),
    );
    const stood = sunBlockers(setting, themeOf(1).decor, MOST);
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
        assert.ok(
          Math.abs((held?.min[axis] ?? Number.NaN) - min[axis]) < 0.005,
          said,
        );
        assert.ok(
          Math.abs((held?.max[axis] ?? Number.NaN) - max[axis]) < 0.005,
          said,
        );
      }
    }
  });
});
