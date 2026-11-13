import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { WALL_HALF } from '@/cube/shared/lib/room-shape';

import { placed } from './frame';
import { holesOf } from './hole';
import { maze } from './maze';
import type { SignMount } from './mount';
import { planted } from './planted';
import { type Room, roomKey } from './room';
import {
  endsOf,
  type Holdings,
  lotSign,
  priceOf,
  signFacets,
  signPost,
} from './sale';
import { mazeWalls, type Walls } from './walls';

describe('priceOf', () => {
  it('prices floor 2 at $10M and every floor at the same $/m³', () => {
    assert.equal(priceOf(2), 10_000_000);
    assert.equal(priceOf(3), 1_250_000);
    assert.ok(Math.abs(priceOf(8) - 38.147) < 0.001);
    const perCube = (n: number) => priceOf(n) / (5 / 2 ** (n - 1)) ** 3;
    for (const n of [5, 8]) {
      assert.ok(Math.abs(perCube(n) / perCube(2) - 1) < 1e-12);
    }
  });

  it('sells floor 9 and every floor below at $4.99', () => {
    for (const n of [9, 10, 30]) assert.equal(priceOf(n), 4.99);
  });
});

/** Walls with exactly `open` open, each wall named by the room west or north of it. */
const wallsOpen = (
  east: readonly string[],
  south: readonly string[],
): Walls => ({
  isOpenEast: (n, x, y) => east.includes(roomKey({ n, x, y })),
  isOpenSouth: (n, x, y) => south.includes(roomKey({ n, x, y })),
});

const room = (n: number, x: number, y: number): Room => ({
  n,
  x: BigInt(x),
  y: BigInt(y),
});

const noEnds = () => false;
const asked = (): boolean => {
  throw new Error('asked');
};

const owned = (...rooms: Room[]): Holdings =>
  new Map(
    rooms.map((r) => [
      roomKey(r),
      { at: { u: 0, v: 0.5 }, facing: { u: 1, v: 0 }, onPost: false },
    ]),
  );

const on = (
  u: number,
  v: number,
  fu: number,
  fv: number,
  onPost = false,
): SignMount => ({ at: { u, v }, facing: { u: fu, v: fv }, onPost });

/** Floor 2's ends in the planted world: its landing room and its holed one. */
const isEnd = (r: Room): boolean => ['2/0/1', '2/1/0'].includes(roomKey(r));

describe('lotSign, nothing bought', () => {
  // Floor 2 as the planted world has it: (0, 0) opens east and south, (0, 1)
  // east too. Floor 1's hole lands in (0, 1); floor 2's is in (1, 0).
  const floorTwo = wallsOpen(['2/0/0', '2/0/1'], ['2/0/0']);
  const rooms = [room(2, 0, 0), room(2, 1, 0), room(2, 0, 1), room(2, 1, 1)];

  it('sells floor 2’s one dead end off the path, signed on its far wall', () => {
    const sold = rooms.flatMap((r) => {
      const sign = lotSign(floorTwo, new Map(), r, isEnd);
      return sign === null ? [] : [[roomKey(r), sign] as const];
    });
    assert.deepEqual(sold, [
      ['2/1/1', { ...on(1, 0.5, -1, 0), kind: 'for-sale' }],
    ]);
  });

  it('sells nothing on floor 1', () => {
    assert.equal(lotSign(floorTwo, new Map(), room(1, 0, 0), noEnds), null);
  });

  it('asks no end of a room the walls leave unsold', () => {
    assert.equal(lotSign(floorTwo, new Map(), room(2, 0, 0), asked), null);
  });

  it('agrees with the planted world: floor 2 sells room (1, 1)', async () => {
    const walls = mazeWalls(maze(planted.seed));
    const known = await holesOf(planted, [room(1, 0, 0), ...rooms]);
    const sold = rooms.filter(
      (r) => lotSign(walls, new Map(), r, endsOf(known)) !== null,
    );
    assert.deepEqual(
      sold.map((r) => roomKey(r)),
      ['2/1/1'],
    );
  });
});

describe('lotSign, rooms bought', () => {
  // A T on floor 3: (1, 0) opens west to (0, 0), east to (2, 0) and south to
  // (1, 1), which opens on south to (1, 2); the rest is wall.
  const tee = wallsOpen(['3/0/0', '3/1/0'], ['3/1/0', '3/1/1']);

  it('reads a bought room as its own, where its sign hung', () => {
    const bought = owned(room(3, 0, 0));
    assert.deepEqual(lotSign(tee, bought, room(3, 0, 0), asked), {
      ...on(0, 0.5, 1, 0),
      kind: 'yours',
    });
  });

  it('does not sell a bought room’s neighbour that has another opening', () => {
    const bought = owned(room(3, 0, 0));
    assert.equal(lotSign(tee, bought, room(3, 1, 0), noEnds), null);
  });

  it('sells, as buy more, a neighbour whose only other openings are bought', () => {
    const bought = owned(room(3, 0, 0), room(3, 2, 0));
    // Its far side, across from the opening south, is the floor's edge.
    assert.deepEqual(lotSign(tee, bought, room(3, 1, 0), noEnds), {
      ...on(0.5, 0, 0, 1),
      kind: 'buy-more',
    });
  });

  it('hangs the sign on the next wall clockwise when the far side is bought', () => {
    const bought = owned(room(3, 0, 0), room(3, 2, 0), room(3, 1, 0));
    // (1, 1)'s opening on sale is south, its far side north is bought, and
    // clockwise from north the first wall is east.
    assert.deepEqual(lotSign(tee, bought, room(3, 1, 1), noEnds), {
      ...on(1, 0.5, -1, 0),
      kind: 'buy-more',
    });
  });

  it('never sells a landing or holed room', () => {
    const bought = owned(room(3, 0, 0), room(3, 2, 0));
    assert.equal(
      lotSign(tee, bought, room(3, 1, 0), () => true),
      null,
    );
  });
});

describe('lotSign, no wall to hang on', () => {
  // A plus on floor 3: (1, 1) opens onto all four of its neighbours, each of
  // which has no other opening.
  const plus = wallsOpen(['3/0/1', '3/1/1'], ['3/1/0', '3/1/1']);
  const middle = room(3, 1, 1);
  const around = [room(3, 2, 1), room(3, 1, 2), room(3, 0, 1), room(3, 1, 0)];

  it('stands the sign on a post when every neighbour is bought', () => {
    const sign = lotSign(plus, owned(...around), middle, noEnds);
    // Counted from the east: in from the east doorway, facing west.
    assert.deepEqual(sign, { ...on(0.8, 0.5, -1, 0, true), kind: 'buy-more' });
  });

  it('stands it on a post in from a bought far side with no wall beside it', () => {
    const sign = lotSign(
      plus,
      owned(...around.slice(0, 1), ...around.slice(2)),
      middle,
      noEnds,
    );
    // Open south, so the far side is north, bought, and no side is wall.
    assert.deepEqual(sign, { ...on(0.5, 0.2, 0, 1, true), kind: 'buy-more' });
  });

  it('keeps it on the wall when the far side is a closed wall', () => {
    // (1, 0) of the plus opens south only; its far side is the floor's edge.
    assert.deepEqual(lotSign(plus, new Map(), room(3, 1, 0), noEnds), {
      ...on(0.5, 0, 0, 1),
      kind: 'for-sale',
    });
  });
});

describe('signPost', () => {
  const eye = room(2, 0, 0);
  const place = placed(eye, eye);

  it('stands no post under a wall sign', () => {
    assert.deepEqual(signPost(on(1, 0.5, -1, 0), eye, place), []);
  });

  it('stands a closed box from the slab up to the board under a post sign', () => {
    const sign = on(0.8, 0.5, -1, 0, true);
    const quads = signPost(sign, eye, place);
    assert.equal(quads.length, 6);
    const corners = quads.flatMap((q) => q.corners);
    const ys = corners.map((c) => c[1]);
    assert.equal(Math.min(...ys), place.origin[1]);
    const us = corners.map((c) => (c[0] - place.origin[0]) / place.roomSide);
    assert.ok(Math.min(...us) < 0.8 && Math.max(...us) > 0.8);
    assert.ok(quads.every((q) => q.surface === 'trim'));
  });
});

describe('signFacets', () => {
  const eye = room(2, 0, 0);

  it('reads a post sign from both faces, either side of the post', () => {
    const sign = on(0.8, 0.5, -1, 0, true);
    const place = placed(eye, eye);
    const facets = signFacets(sign, eye, place);
    assert.equal(facets.length, 2);
    const normals = facets.map(({ normal }) => Math.round(normal[0]) + 0);
    assert.deepEqual(normals, [-1, 1]);
    for (const { corners, normal } of facets) {
      const x = corners.reduce((sum, corner) => sum + corner[0], 0) / 4;
      const mu = (x - place.origin[0]) / place.roomSide;
      // Each face stands off the post's middle on its own side.
      assert.ok((mu - 0.8) * normal[0] > 0);
    }
  });

  for (const [du, dv] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const) {
    it(`faces into the room off its wall, facing (${du}, ${dv})`, () => {
      const sign = on((1 - du) / 2, (1 - dv) / 2, du, dv);
      const facets = signFacets(sign, eye, placed(eye, eye));
      assert.equal(facets.length, 1);
      const [only] = facets;
      assert.ok(only !== undefined);
      const { corners, normal, room: lot } = only;
      assert.equal(lot, eye);
      assert.deepEqual(
        normal.map((c) => Math.round(c) + 0),
        [du, 0, dv],
      );
      const middle = (axis: 0 | 2) =>
        corners.reduce((sum, corner) => sum + corner[axis], 0) / 4;
      const [mu, mv] = [middle(0), middle(2)];
      assert.ok(Math.abs(mu - sign.at.u) <= WALL_HALF + 0.01);
      assert.ok(Math.abs(mv - sign.at.v) <= WALL_HALF + 0.01);
      // Off the wall's face, into the room.
      assert.ok((mu - sign.at.u) * du + (mv - sign.at.v) * dv > 0);
      // Bottom edge first, top edge last.
      assert.ok(corners[0][1] < corners[3][1]);
    });
  }
});
