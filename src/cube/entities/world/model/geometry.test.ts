import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { faces, HOLE_SIDE, type Quad } from './geometry';
import type { HoleOf } from './hole';
import { isOpenEast, maze } from './maze';
import type { Pose } from './pose';
import { view } from './rooms';

const rolled = maze('8675309');

const at = (pose: Partial<Pose>): Pose => ({
  n: 1,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  h: 0.32,
  yaw: 0,
  pitch: 0,
  ...pose,
});

const noHoles: HoleOf = () => null;

/** The hole in the east-north quarter of floor 1's room, and nowhere else. */
const oneHole: HoleOf = ({ n }) => (n === 1 ? { qx: 1, qy: 0 } : null);

const area = ({ corners: [a, b, , d] }: Quad): number =>
  Math.abs(b[0] - a[0] + (b[2] - a[2])) * Math.abs(d[0] - a[0] + (d[2] - a[2]));

const heights = (quads: readonly Quad[]): number[] => [
  ...new Set(quads.map(({ corners }) => corners[0][1])),
];

describe('faces', () => {
  it('cuts the hole out of its slab, in the middle of its quarter', () => {
    const pose = at({});
    const floor = faces(rolled, pose, view(pose, 1, 3), oneHole).filter(
      (quad) => quad.n === 1 && quad.surface === 'floor',
    );
    assert.equal(floor.length, 4);
    const total = floor.reduce((sum, quad) => sum + area(quad), 0);
    assert.ok(Math.abs(total - (1 - HOLE_SIDE ** 2)) < 1e-12);
    const covers = ({ corners }: Quad, east: number, south: number) => {
      const xs = corners.map(([x]) => x);
      const zs = corners.map((corner) => corner[2]);
      return (
        east > Math.min(...xs) &&
        east < Math.max(...xs) &&
        south > Math.min(...zs) &&
        south < Math.max(...zs)
      );
    };
    assert.ok(!floor.some((quad) => covers(quad, 0.75, 0.25)));
    assert.ok(floor.some((quad) => covers(quad, 0.25, 0.25)));
  });

  it('stacks the floors at the heights their rooms make', () => {
    const pose = at({ n: 2, x: 1n, y: 0n });
    const quads = faces(rolled, pose, view(pose, 1, 3), noHoles);
    const of = (floor: number, surface: Quad['surface']) =>
      heights(quads.filter((q) => q.n === floor && q.surface === surface));
    assert.deepEqual(of(3, 'floor'), [-0.25]);
    assert.deepEqual(of(2, 'floor'), [0]);
    assert.deepEqual(of(2, 'ceiling'), [0.5]);
    assert.deepEqual(of(1, 'floor'), [0.5]);
    assert.deepEqual(of(1, 'ceiling'), [1.5]);
  });

  it('draws a wall where the maze closes one and none where it opens', () => {
    const pose = at({ n: 3, x: 1n, y: 1n });
    const quads = faces(rolled, pose, view(pose, 3, 3), noHoles);
    const eastward = new Set(
      quads
        .filter((q) => q.n === 3 && q.surface === 'wall' && q.normal[0] !== 0)
        .map(({ corners: [[east, , south]] }) => `${east} ${south}`),
    );
    for (let y = 0n; y < 4n; y += 1n) {
      for (let x = 0n; x < 3n; x += 1n) {
        const drawn = eastward.has(`${Number(x - 1n) + 1} ${Number(y - 1n)}`);
        assert.equal(drawn, !isOpenEast(rolled, 3, x, y), `east of ${x}, ${y}`);
      }
      assert.ok(eastward.has(`-1 ${Number(y - 1n)}`), 'the cube is walled');
    }
  });

  it('keeps a deep floor as close to the eye as floor 1', () => {
    const pose = at({ n: 60, x: (1n << 59n) - 2n, y: 1n << 58n });
    const quads = faces(rolled, pose, view(pose, 2, 66), noHoles);
    const coordinates = quads.flatMap(({ corners }) => corners.flat());
    assert.ok(coordinates.every((c) => Math.abs(c) <= 4));
    assert.ok(quads.some((q) => q.n === 61 && q.surface === 'floor'));
  });

  it('closes floor 1 with the lid', () => {
    const pose = at({});
    const quads = faces(rolled, pose, view(pose, 2, 3), noHoles);
    const ceiling = quads.filter((q) => q.surface === 'ceiling' && q.n === 1);
    assert.deepEqual(heights(ceiling), [0.5]);
    assert.ok(!quads.some((q) => q.n === 0));
  });
});
