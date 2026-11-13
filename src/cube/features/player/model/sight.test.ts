import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Box } from '@/cube/shared/outside';

import { seesWhole } from './sight';

/** A 5 m cube standing on the ground, its middle 2.5 m up at the origin. */
const BOX: Box = { min: [-2.5, 0, -2.5], max: [2.5, 5, 2.5] };

/** An eye at a person's height `far` metres east of the box. */
const from = (far: number, yaw: number, elevation = 0) => ({
  eye: [far, 1.6, 0] as const,
  yaw,
  elevation,
});

describe('seesWhole', () => {
  it('sees the box whole from afar, looking at it', () => {
    assert.ok(seesWhole(from(30, Math.PI), BOX));
  });

  it('does not see it looking away, or aside past the edge of view', () => {
    assert.ok(!seesWhole(from(30, 0), BOX));
    assert.ok(!seesWhole(from(30, Math.PI + 0.5), BOX));
    assert.ok(seesWhole(from(30, Math.PI + 0.3), BOX));
  });

  it('does not see it whole from too near, or looking too far up', () => {
    assert.ok(!seesWhole(from(6, Math.PI), BOX));
    assert.ok(!seesWhole(from(30, Math.PI, 0.7), BOX));
    assert.ok(seesWhole(from(30, Math.PI, 0.3), BOX));
  });

  it('turns its square of view with the yaw', () => {
    const north = {
      eye: [0, 1.6, -30] as const,
      yaw: Math.PI / 2,
      elevation: 0,
    };
    assert.ok(seesWhole(north, BOX));
    assert.ok(!seesWhole({ ...north, yaw: -Math.PI / 2 }, BOX));
  });
});
