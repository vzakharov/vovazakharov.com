import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import type { Vec3 } from '@/cube/shared/lib/vec';
import type { Beyond } from '@/cube/entities/world';

import { doorwayOpening, seenBeyond } from './portal-frame';

/** A view-projection that is the identity, so a clip point is a frame point. */
const IDENTITY = Float32Array.of(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

/** Through an east wall into a south one: the far frame turns a quarter back. */
const BEYOND: Beyond = {
  from: { u: 0.5, v: 0 },
  to: { u: 2, v: 0.5 },
  turn: -Math.PI / 2,
};

/** Where the far frame's `point` lands in the eye's. */
function placed(point: Vec3): number[] {
  const { viewProjection: m } = seenBeyond(BEYOND, {
    viewProjection: IDENTITY,
    eye: [0, 0, 0],
  });
  return [0, 1, 2].map(
    (row) =>
      (m[row] ?? 0) * point[0] +
      (m[4 + row] ?? 0) * point[1] +
      (m[8 + row] ?? 0) * point[2] +
      (m[12 + row] ?? 0),
  );
}

const close = (actual: readonly number[], expected: readonly number[]) => {
  assert.equal(actual.length, expected.length);
  for (const [i, value] of actual.entries()) {
    assert.ok(Math.abs(value - (expected[i] ?? Number.NaN)) < 1e-6);
  }
};

describe('seenBeyond', () => {
  it('lays the far doorway on the near one', () => {
    close(placed([0.5, 0, 0]), [2, 0, 0.5]);
  });

  it('turns the way out of the far door along the way into the near one', () => {
    // A step south past the far wall is a step east past the near one.
    close(placed([0.5, 0.2, 0.3]), [2.3, 0.2, 0.5]);
    // West of the far doorway's middle is south of the near one's.
    close(placed([0.4, 0, 0]), [2, 0, 0.6]);
  });

  it('puts the eye where it would stand in the far frame', () => {
    const { eye } = seenBeyond(BEYOND, {
      viewProjection: IDENTITY,
      eye: [1.7, 0.4, 0.6],
    });
    close([...eye], [0.4, 0.4, -0.3]);
    close(placed(eye), [1.7, 0.4, 0.6]);
  });
});

describe('doorwayOpening', () => {
  it('spans the cut on the wall line, floor to head', () => {
    const half = (DOORWAY_CUT.to - DOORWAY_CUT.from) / 2;
    const east = doorwayOpening({ u: 2, v: 0.5 }, true);
    assert.equal(east.length, 18);
    close([...east.subarray(0, 3)], [2, 0, 0.5 - half]);
    close([...east.subarray(6, 9)], [2, DOORWAY_CUT.height, 0.5 + half]);
    const south = doorwayOpening({ u: 0.5, v: 1 }, false);
    close([...south.subarray(3, 6)], [0.5 + half, 0, 1]);
  });
});
