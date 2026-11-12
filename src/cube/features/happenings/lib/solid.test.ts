import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  cross,
  minus,
  type Quad,
  type Room,
  UP,
  type Vec3,
} from '@/cube/entities/world';

import { next, SIDE_FRAMES, SIDES } from './side';
import { about, bar, block, forward, heading, turned, yawTo } from './solid';

const ROOM: Room = { n: 3, x: 1n, y: 2n };
const WOOD = { stuff: 'wood' } as const;

const close = (a: Vec3, b: Vec3) => {
  assert.ok(
    a.every((part, axis) => Math.abs(part - (b[axis] ?? 0)) < 1e-12),
    `${a.join(', ')} is not ${b.join(', ')}`,
  );
};

/** Fails unless every face of `quads` looks away from `centre`. */
function assertOutward(quads: readonly Quad[], centre: Vec3): void {
  for (const { corners, normal } of quads) {
    const [x, y, z] = minus(corners[0], centre);
    assert.ok(x * normal[0] + y * normal[1] + z * normal[2] > 0);
  }
}

describe('turns', () => {
  it('turn right-handed about an axis', () => {
    close(about(UP, Math.PI / 2)([1, 0, 0]), [0, 0, -1]);
    close(about([0, 0, 1], Math.PI / 2)([1, 0, 0]), [0, 1, 0]);
  });

  it('apply in the order given', () => {
    const both = turned(about(UP, Math.PI / 2), about([1, 0, 0], Math.PI / 2));
    close(both([1, 0, 0]), [0, 1, 0]);
  });

  it('head a thing built looking east along a yaw', () => {
    close(heading(Math.PI / 2)([1, 0, 0]), forward(Math.PI / 2));
    close(heading(0)([0, 0, 1]), [0, 0, 1]);
    assert.equal(yawTo([0, 0, 0], [0, 0, 2]), Math.PI / 2);
  });
});

describe('block and bar', () => {
  it('face outward however they are turned', () => {
    const centre: Vec3 = [0.5, 0.2, 0.5];
    const turn = turned(about(UP, 0.7), about([1, 0, 0], 1.1));
    const quads = block(ROOM, centre, [0.1, 0.2, 0.3], turn, WOOD);
    assert.equal(quads.length, 6);
    assertOutward(quads, centre);
  });

  it('run a bar from end to end, whatever side it is asked to be wide to', () => {
    for (const side of [UP, [1, 0, 0], [0, 0, 1]] as const) {
      const quads = bar(
        ROOM,
        [
          [0.2, 0.1, 0.2],
          [0.2, 0.4, 0.2],
        ],
        [0.02, 0.04],
        side,
        WOOD,
      );
      assert.equal(quads.length, 6);
      assertOutward(quads, [0.2, 0.25, 0.2]);
      const heights = quads.flatMap(({ corners }) => corners.map(([, y]) => y));
      assert.ok(Math.abs(Math.min(...heights) - 0.1) < 1e-12);
      assert.ok(Math.abs(Math.max(...heights) - 0.4) < 1e-12);
    }
  });
});

describe('the side frames', () => {
  it('are right-handed, each starting where the one before ends', () => {
    for (const side of SIDES) {
      const { base, along, into } = SIDE_FRAMES[side];
      close(cross(along, UP), into);
      const after = SIDE_FRAMES[next(side)];
      close([base[0] + along[0], 0, base[2] + along[2]], after.base);
    }
  });
});
