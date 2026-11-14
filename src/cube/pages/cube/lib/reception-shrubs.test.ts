import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { SHRUB, shrubHeight } from '@/cube/shared/lib/shrub';
import { themeOf } from '@/cube/entities/theme';
import { RECEPTION_SHRUBS } from '@/cube/entities/theme/index.test-only';
import {
  holesOf,
  maze,
  mazeWalls,
  planted,
  type Room,
  settingOf,
  traits,
} from '@/cube/entities/world';
import { furnish } from '@/cube/features/decor';

/** The paint of a potted plant's pot, which nothing else in the room wears. */
const POT = 0x9a_50_30;

/** How far from its axis a plant's widest turn of leaves reaches, with a little over. */
const FOLIAGE_REACH =
  Math.max(...SHRUB.foliage.map(({ radius }) => radius)) + 0.03;

const FLOOR_ONE: Room = { n: 1, x: 0n, y: 0n };

type Corner = Awaited<ReturnType<typeof corners>>[number];

/** The mean of `some` corners along `axis`. */
const mean = (some: readonly Corner[], axis: 0 | 2): number =>
  some.reduce((sum, { at }) => sum + at[axis], 0) / some.length;

/** How high the top turn of a plant's leaves stands, for its draw of height. */
const crownOf = (draw: number): number =>
  shrubHeight(SHRUB.foliage[3].at, draw);

/** Every corner of what the planted world stands in floor 1's room, in metres, with its quad's paint. */
async function corners() {
  const holeOf = await holesOf(planted, [FLOOR_ONE]);
  const setting = settingOf(
    mazeWalls(maze(planted.seed)),
    traits(planted.seed),
    FLOOR_ONE,
    holeOf(FLOOR_ONE),
  );
  return furnish(setting, themeOf(1).decor).flatMap(
    ({ corners: four, paint }) =>
      four.map(([x, y, z]) => ({
        at: [x * ROOM_METRES, y * ROOM_METRES, z * ROOM_METRES] as const,
        paint,
      })),
  );
}

describe("the reception's potted plants, as its light has them", () => {
  it('stand where the decor puts them, as tall as it grows them', async () => {
    const all = await corners();
    const pots = all.filter(({ paint }) => paint === POT);
    const claimed = new Set<Corner>();
    for (const {
      at: [east, south],
      draw,
    } of RECEPTION_SHRUBS) {
      const near = ({ at }: Corner, within: number) =>
        Math.hypot(at[0] - east, at[2] - south) < within;
      const pot = pots.filter((corner) => near(corner, 2 * SHRUB.pot.rim));
      assert.ok(pot.length > 0, `no pot at ${String(east)}, ${String(south)}`);
      for (const corner of pot) claimed.add(corner);
      assert.ok(
        Math.abs(mean(pot, 0) - east) < 0.005,
        `east ${String(mean(pot, 0))}`,
      );
      assert.ok(
        Math.abs(mean(pot, 2) - south) < 0.005,
        `south ${String(mean(pot, 2))}`,
      );
      const top = Math.max(
        ...all
          .filter((corner) => near(corner, FOLIAGE_REACH))
          .map(({ at }) => at[1]),
      );
      assert.ok(Math.abs(top - crownOf(draw)) < 0.005, `top ${String(top)}`);
    }
    assert.equal(claimed.size, pots.length, 'a plant the light does not know');
  });
});
