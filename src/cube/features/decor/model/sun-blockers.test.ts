import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { type Box, crossesBeam, SUN_DIR, toShell } from '@/cube/shared/outside';
import { themeOf } from '@/cube/entities/theme';
import {
  holesOf,
  maze,
  mazeWalls,
  planted,
  type Room,
  settingOf,
  traits,
} from '@/cube/entities/world';

import { standingBoxes } from './furnish';
import { sunBlockers } from './sun-blockers';

const FLOOR_ONE: Room = { n: 1, x: 0n, y: 0n };
const { decor } = themeOf(1);

/** A box of the room's frame, in metres, as the shell's frame has it. */
function inShell({ min, max }: Box): Box {
  const a = toShell(min, ROOM_METRES);
  const b = toShell(max, ROOM_METRES);
  return {
    min: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2])],
    max: [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])],
  };
}

/** The planted world's setting of `room`. */
async function plantedSetting(room: Room) {
  const holeOf = await holesOf(planted, [room]);
  return settingOf(
    mazeWalls(maze(planted.seed)),
    traits(planted.seed),
    room,
    holeOf(room),
  );
}

describe('sunBlockers, in the planted world', () => {
  it('lists parts, a ray of the doorway through each, of the standing things but the plants', async () => {
    const setting = await plantedSetting(FLOOR_ONE);
    const blockers = sunBlockers(setting, decor, 99);
    const things = standingBoxes(setting, decor)
      .filter(({ thing }) => thing !== 'potted-plant')
      .map(({ min, max }) => inShell({ min, max }));
    assert.ok(blockers.length > things.length);
    for (const { min, max } of blockers) {
      assert.ok(crossesBeam({ min, max }, SUN_DIR));
      assert.ok(min.every((least, axis) => least <= (max[axis] ?? Infinity)));
      assert.ok(
        things.some((thing) =>
          ([0, 1, 2] as const).every(
            (axis) =>
              thing.min[axis] - 1e-9 <= min[axis] &&
              max[axis] <= thing.max[axis] + 1e-9,
          ),
        ),
      );
    }
  });

  it('lists the largest first and no more than asked', async () => {
    const setting = await plantedSetting(FLOOR_ONE);
    const all = sunBlockers(setting, decor, 99);
    const volumes = all.map(
      ({ min, max }) =>
        (max[0] - min[0]) * (max[1] - min[1]) * (max[2] - min[2]),
    );
    assert.deepEqual(
      volumes,
      volumes.toSorted((a, b) => b - a),
    );
    assert.deepEqual(sunBlockers(setting, decor, 1), all.slice(0, 1));
    assert.deepEqual(sunBlockers(setting, decor, 0), []);
  });

  it('lists none above floor 1', async () => {
    const setting = await plantedSetting({ n: 2, x: 0n, y: 0n });
    assert.deepEqual(sunBlockers(setting, themeOf(2).decor, 99), []);
  });
});
