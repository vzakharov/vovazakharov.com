import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { moved, type Vec3 } from '@/cube/shared/lib/vec';
import { SUN_DIR } from '@/cube/shared/outside';
import {
  CUBE_BOX,
  DOOR_LADDER,
  LADDER_OUT,
  LADDER_UP,
} from '@/cube/entities/island';

import { cubeShadow } from './cube-shadow';

describe("the ladder's shadow", () => {
  it('shades what lies down-sun of a stile and of a rung, not between rungs', () => {
    const rung = DOOR_LADDER.rungs[4] ?? DOOR_LADDER.foot;
    const stile = moved(rung, [0, 0, 1], DOOR_LADDER.wide / 2);
    const between = moved(rung, LADDER_UP, DOOR_LADDER.pitch / 2);
    const downSun = (from: Vec3): number =>
      cubeShadow(moved(from, SUN_DIR, -0.5));
    assert.ok(downSun(rung) < 0.2);
    assert.ok(downSun(stile) < 0.2);
    assert.equal(downSun(between), 1);
  });

  it('casts nothing on itself or up-sun', () => {
    const rung = DOOR_LADDER.rungs[4] ?? DOOR_LADDER.foot;
    assert.equal(cubeShadow(moved(rung, LADDER_OUT, 0.03)), 1);
    assert.equal(cubeShadow(moved(rung, SUN_DIR, 1)), 1);
  });
});

describe("the cube's own faces", () => {
  it('are in the sun where they face it and dark behind', () => {
    const [x, y, z] = [
      (CUBE_BOX.min[0] + CUBE_BOX.max[0]) / 2,
      (CUBE_BOX.min[1] + CUBE_BOX.max[1]) / 2,
      (CUBE_BOX.min[2] + CUBE_BOX.max[2]) / 2,
    ];
    assert.equal(cubeShadow([CUBE_BOX.max[0] + 0.001, y + 1, z + 1.5]), 1);
    assert.equal(cubeShadow([x - 1, CUBE_BOX.max[1] + 0.001, z]), 1);
    assert.equal(cubeShadow([CUBE_BOX.min[0] - 0.2, y, z]), 0);
    assert.equal(cubeShadow([x, CUBE_BOX.min[1] - 0.2, z]), 0);
  });
});
