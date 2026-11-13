import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CEILING_HEIGHT,
  SLAB_THICK,
  WALL_HALF,
} from '@/cube/shared/lib/room-shape';

import { descend, eyeInFrame } from './frame';
import { faces, HOLE_SIDE } from './geometry';
import type { HoleOf } from './hole';
import { isOpenEast, maze } from './maze';
import type { Pose } from './pose';
import type { Quad } from './quad';
import { type InRoomOf, type Room, roomKey } from './room';
import { sight, withBelow } from './rooms';
import { mazeWalls } from './walls';

const rolled = maze('8675309');
const walls = mazeWalls(rolled);

const at = (pose: Partial<Pose>): Pose => ({
  n: 1,
  x: 0n,
  y: 0n,
  u: 0.5,
  v: 0.5,
  eyeAbove: 0.32,
  scale: 1,
  yaw: 0,
  elevation: 0,
  ...pose,
});

const noHoles: HoleOf = () => null;

/** A hole in the north-west quarter of every room above floor `last`. */
const holedTo =
  (last: number): HoleOf =>
  ({ n }) =>
    n < last ? { qx: 0, qy: 0 } : null;

const nobody = (): boolean => false;
const noPillars = (): number => 0;
const mine = (room: Room): boolean => roomKey(room) === '2/1/0';

/** The faces of what an eye at `pose` sees, holes by `holeOf`. */
const facesAt = (
  pose: Pose,
  holeOf: HoleOf,
  taken: InRoomOf | null = null,
  owns: (room: Room) => boolean = nobody,
): Quad[] =>
  faces(
    rolled,
    pose,
    withBelow(sight(pose, 24, walls), holeOf),
    holeOf,
    taken,
    owns,
    noPillars,
  );

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
    const floor = facesAt(pose, oneHole).filter(
      (quad) => quad.room.n === 1 && quad.surface === 'floor',
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

  it('draws a bought room’s floor owned, and only its floor', () => {
    const pose = at({ n: 2, x: 1n, y: 0n });
    const owned = facesAt(pose, holedTo(3), null, mine).filter(
      (quad) => quad.surface === 'owned',
    );
    assert.ok(owned.length > 0);
    for (const { room, normal, corners } of owned) {
      assert.equal(room.n, 2);
      assert.deepEqual(
        normal.map((c) => c + 0),
        [0, 1, 0],
      );
      assert.ok(corners.every(([east]) => east >= 0 && east <= 1));
    }
  });

  it('stacks the floors at the heights their rooms make', () => {
    const pose = at({ n: 2, x: 1n, y: 0n });
    const quads = facesAt(pose, holedTo(3));
    const of = (floor: number, surface: Quad['surface']) =>
      heights(quads.filter((q) => q.room.n === floor && q.surface === surface));
    assert.deepEqual(of(3, 'floor'), [-0.25]);
    assert.deepEqual(of(2, 'floor'), [0]);
    // A ceiling hangs a slab's thickness under the floor over it.
    assert.deepEqual(of(3, 'ceiling'), [-SLAB_THICK / 2]);
    assert.deepEqual(of(2, 'ceiling'), [CEILING_HEIGHT]);
    assert.deepEqual(of(1, 'floor'), [0.5]);
    assert.deepEqual(of(1, 'ceiling'), [0.5 + 2 * CEILING_HEIGHT]);
  });

  it('reaches the floor below only through a hole', () => {
    const pose = at({ n: 3, x: 1n, y: 1n });
    assert.ok(!facesAt(pose, noHoles).some((q) => q.room.n === 4));
    const under = facesAt(pose, holedTo(4)).filter((q) => q.room.n === 4);
    assert.ok(under.some((q) => q.surface === 'ceiling'));
    assert.ok(!facesAt(pose, holedTo(5)).some((q) => q.room.n === 5));
  });

  it('draws a wall where the maze closes one and none where it opens', () => {
    const pose = at({ n: 3, x: 1n, y: 1n });
    const floor: Room[] = [0n, 1n, 2n, 3n].flatMap((y) =>
      [0n, 1n, 2n, 3n].map((x) => ({ n: 3, x, y })),
    );
    const view = { near: floor, above: [], overhead: null, topmost: null };
    const quads = faces(
      rolled,
      pose,
      withBelow(view, noHoles),
      noHoles,
      null,
      nobody,
      noPillars,
    );
    const eastward = new Set(
      quads
        .filter(
          (q) => q.room.n === 3 && q.surface === 'wall' && q.normal[0] > 0,
        )
        .map(({ corners: [[east, , south]] }) => {
          // Each face stands half the wall's thickness into its room.
          assert.ok(Math.abs(east - Math.round(east) - WALL_HALF) < 1e-9);
          return `${Math.round(east)} ${south}`;
        }),
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
    const quads = facesAt(pose, holedTo(66));
    const coordinates = quads.flatMap(({ corners }) => corners.flat());
    assert.ok(coordinates.every((c) => Math.abs(c) <= 28));
    assert.ok(quads.some((q) => q.room.n === 61 && q.surface === 'floor'));
  });

  it('closes floor 1 with the lid', () => {
    const pose = at({});
    const quads = facesAt(pose, noHoles);
    const ceiling = quads.filter(
      (q) => q.surface === 'ceiling' && q.room.n === 1,
    );
    assert.deepEqual(heights(ceiling), [CEILING_HEIGHT]);
    assert.ok(!quads.some((q) => q.room.n === 0));
  });

  it('draws a shelf in each holed room it walls, and only there', () => {
    const quads = facesAt(at({ n: 2, x: 1n, y: 0n }), holedTo(3));
    const floors = new Set(
      quads.filter((q) => q.surface === 'handle').map((q) => q.room.n),
    );
    // Floor 2's rooms and the one overhead are holed; floor 3's are not.
    assert.deepEqual(
      [...floors].toSorted((a, b) => a - b),
      [1, 2],
    );
    assert.ok(!facesAt(at({}), noHoles).some((q) => q.surface === 'plate'));
  });

  it('takes the taken pill off its shelf, and no other', () => {
    const pose = at({ n: 2, x: 1n, y: 0n });
    const pills = (taken: InRoomOf | null) =>
      facesAt(pose, holedTo(3), taken).filter((q) => q.surface === 'plastic');
    const all = pills(null);
    const { n, x, y } = pose;
    const left = pills({ room: { n, x, y } });
    const here = all.filter((q) => roomKey(q.room) === roomKey(pose));
    assert.ok(here.length > 0);
    assert.equal(left.length, all.length - here.length);
    assert.ok(!left.some((q) => roomKey(q.room) === roomKey(pose)));
  });
});

const near = (a: readonly number[], b: readonly number[]) => {
  for (const [i, value] of a.entries()) {
    assert.ok(
      Math.abs(value - (b[i] ?? Number.NaN)) < 1e-9,
      `${a.join(',')} vs ${b.join(',')}`,
    );
  }
};

/** The room the descent tests measure from, on the floor fallen from. */
const frame = { n: 4, x: 5n, y: 2n };

/** How big a body at `pose` stands, in `frame`'s room sides. */
const size = (pose: Pose) => eyeInFrame(frame, pose).side * pose.scale;

describe('descend', () => {
  it('leaves the eye where it was, its gaze and its size in the cube', () => {
    for (const pose of [
      at({ n: 4, x: 5n, y: 2n, u: 0.31, v: 0.77, eyeAbove: -0.09, scale: 0.5 }),
      at({ n: 4, x: 6n, y: 1n, u: 0.6, v: 0.2, eyeAbove: 0.1, yaw: 2 }),
    ]) {
      const below = descend(pose);
      assert.equal(below.n, 5);
      near(eyeInFrame(frame, below).eye, eyeInFrame(frame, pose).eye);
      near([size(below)], [size(pose)]);
      assert.deepEqual(
        [below.yaw, below.elevation],
        [pose.yaw, pose.elevation],
      );
      assert.ok(below.u >= 0 && below.u < 1 && below.v >= 0 && below.v < 1);
    }
  });

  it('turns a half-size eye on the slab below into a whole one on its floor', () => {
    const landed = descend(at({ eyeAbove: -0.25 + 0.16, scale: 0.5 }));
    near([landed.eyeAbove, landed.scale], [0.32, 1]);
  });
});
