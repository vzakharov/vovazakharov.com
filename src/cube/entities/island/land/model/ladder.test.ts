import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DOORWAY } from '@/cube/shared/cube-boundary';

import { islandHeight } from './island-height';
import { DOOR_LADDER, LADDER_UP } from './ladder';
import { CUBE_AT, CUBE_BOX } from './place';

describe('the ladder', () => {
  it('stands in the sand east of the cube and leans to the sill', () => {
    const [x, y, z] = DOOR_LADDER.foot;
    assert.ok(x > CUBE_BOX.max[0] + 0.5);
    assert.ok(Math.abs(y - islandHeight([x, z])) < 0.06);
    assert.ok(DOOR_LADDER.top[0] - CUBE_BOX.max[0] < 0.05);
    assert.ok(Math.abs(DOOR_LADDER.top[1] - CUBE_AT[1]) < 0.05);
    assert.ok(z > CUBE_AT[2] + DOORWAY.from && z < CUBE_AT[2] + DOORWAY.to);
  });

  it('has rungs a step apart, the highest a step under the sill', () => {
    const heights = DOOR_LADDER.rungs.map((rung) => rung[1]);
    for (const [k, height] of heights.entries()) {
      const next = heights[k + 1];
      if (next === undefined) {
        assert.ok(DOOR_LADDER.top[1] - height < 0.3);
      } else {
        const apart = (next - height) / LADDER_UP[1];
        assert.ok(apart >= 0.28 && apart <= 0.3, String(apart));
      }
    }
    assert.ok(heights.length >= 10);
  });
});
