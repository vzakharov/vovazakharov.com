import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type CubeCell, type Face, neighbour } from '@/island/shared/globe';
import { cubeTileId, tileCap } from '@/island/entities/terrain';

import {
  type CoverPiece,
  distanceTo,
  finestCover,
  nearestFirst,
} from './tile-cover';

const key = (
  level: number,
  x: number,
  y: number,
  face: Face = 'pz',
): CubeCell => ({
  face,
  level,
  x,
  y,
});
const ids = (keys: readonly CubeCell[]) =>
  keys.map((k) => cubeTileId(k)).toSorted();
const holding =
  (...keys: CubeCell[]) =>
  (id: string) =>
    keys.some((k) => cubeTileId(k) === id);

/** Whether `inner` lies inside `outer`, `outer` itself included. */
const within = (inner: CubeCell, outer: CubeCell) =>
  inner.face === outer.face &&
  inner.level >= outer.level &&
  Math.floor(inner.x / 2 ** (inner.level - outer.level)) === outer.x &&
  Math.floor(inner.y / 2 ** (inner.level - outer.level)) === outer.y;

/** Every tile at `level` inside `outer`. */
const cellsOf = (outer: CubeCell, level: number): CubeCell[] => {
  const n = 2 ** (level - outer.level);
  return Array.from({ length: n * n }, (_, i) =>
    key(
      level,
      outer.x * n + (i % n),
      outer.y * n + Math.floor(i / n),
      outer.face,
    ),
  );
};

/** How many pieces draw `cell`, which is no coarser than any cut. */
const drawsOf = (pieces: readonly CoverPiece[], cell: CubeCell) =>
  pieces.filter(
    ({ key: drawn, except }) =>
      within(cell, drawn) && !except.some((cut) => within(cell, cut)),
  ).length;

/** Asserts no two pieces overlap and every `needed` tile is drawn, at `level`. */
function assertTiles(
  pieces: readonly CoverPiece[],
  needed: readonly CubeCell[],
  level: number,
) {
  for (const { key: drawn } of pieces) {
    for (const cell of cellsOf(drawn, level)) {
      assert.ok(drawsOf(pieces, cell) <= 1, `${cubeTileId(cell)} overlaps`);
    }
  }
  for (const tile of needed) {
    for (const cell of cellsOf(tile, level)) {
      assert.equal(drawsOf(pieces, cell), 1, `${cubeTileId(cell)} is a hole`);
    }
  }
}

/** The pieces as `id` or `id−cut,cut`, sorted. */
const shapes = (pieces: readonly CoverPiece[]) =>
  pieces
    .map(({ key: drawn, except }) =>
      except.length === 0
        ? cubeTileId(drawn)
        : `${cubeTileId(drawn)}−${ids(except).join(',')}`,
    )
    .toSorted();

const root = key(2, 0, 0);

/** `tile`, split on to level 6 with odds 0.6 a split: a selection tiling it. */
const split = (tile: CubeCell, random: () => number): CubeCell[] =>
  tile.level < 6 && random() < 0.6
    ? cellsOf(tile, tile.level + 1).flatMap((t) => split(t, random))
    : [tile];

/** `tile` and its ancestors up to level 3. */
const ancestors = (tile: CubeCell): CubeCell[] =>
  tile.level <= 3
    ? [tile]
    : [tile, ...ancestors(key(tile.level - 1, tile.x >> 1, tile.y >> 1))];

describe('finestCover', () => {
  const quad = [key(4, 0, 0), key(4, 1, 0), key(4, 0, 1), key(4, 1, 1)];

  it('draws a selection wholly in hand as it is', () => {
    const pieces = finestCover(quad, [], holding(root, ...quad));
    assert.deepEqual(shapes(pieces), ids(quad));
  });

  it('draws the finer tiles in hand and stands the parent in for the rest only', () => {
    const has = holding(root, key(3, 0, 0), key(4, 0, 0), key(4, 1, 0));
    const pieces = finestCover(quad, [], has);
    assert.deepEqual(shapes(pieces), [
      'pz/3/0/0−pz/4/0/0,pz/4/1/0',
      'pz/4/0/0',
      'pz/4/1/0',
    ]);
    assertTiles(pieces, quad, 4);
  });

  it('takes the finest stand-in for each region, cut around what is finer', () => {
    const selected = [key(6, 0, 0), key(6, 3, 3)];
    const pieces = finestCover(selected, [], holding(root, key(5, 0, 0)));
    assert.deepEqual(shapes(pieces), ['pz/2/0/0−pz/5/0/0', 'pz/5/0/0']);
    assertTiles(pieces, selected, 6);
  });

  it('takes no stand-in from another face at the same place', () => {
    const has = holding(root, key(3, 0, 0, 'px'));
    assert.deepEqual(shapes(finestCover([key(4, 0, 0)], [], has)), [
      'pz/2/0/0',
    ]);
  });

  it('draws a selected tile from its four children when it is missing', () => {
    const pieces = finestCover([key(3, 0, 0)], [], holding(root, ...quad));
    assert.deepEqual(shapes(pieces), ids(quad));
  });

  it('keeps the finer shown tiles while their coarser parent loads', () => {
    const has = holding(root, ...quad);
    assert.deepEqual(shapes(finestCover([key(3, 0, 0)], quad, has)), ids(quad));
  });

  it('draws a selected tile holding shown ones once it is in hand', () => {
    const has = holding(root, key(3, 0, 0), ...quad);
    assert.deepEqual(shapes(finestCover([key(3, 0, 0)], quad, has)), [
      'pz/3/0/0',
    ]);
  });

  it('keeps a shown tile beyond the selection', () => {
    const has = holding(root, ...quad);
    assert.deepEqual(
      shapes(finestCover(quad.slice(0, 2), quad, has)),
      ids(quad),
    );
  });

  it('leaves no hole where a turn selects tiles not in hand', () => {
    // The old view in hand; the turned one adds tiles nothing finer holds.
    const turned = [...quad.slice(1), key(4, 2, 0), key(4, 2, 1), key(5, 6, 6)];
    const pieces = finestCover(turned, quad, holding(root, ...quad));
    assertTiles(pieces, [...turned, ...quad], 5);
    assert.deepEqual(shapes(pieces), [
      `pz/2/0/0−${ids(quad).join(',')}`,
      ...ids(quad),
    ]);
  });

  it('never overlaps nor leaves a hole, whatever is in hand', () => {
    let seed = 7;
    const random = () => {
      seed = (seed * 1_103_515_245 + 12_345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    for (let run = 0; run < 200; run++) {
      const selected = cellsOf(root, 3).flatMap((t) => split(t, random));
      const shown = cellsOf(root, 3).flatMap((t) => split(t, random));
      const candidates = [...selected, ...shown].flatMap((t) => ancestors(t));
      const held = [root, ...candidates.filter(() => random() < 0.3)];
      const pieces = finestCover(selected, shown, holding(...held));
      assertTiles(pieces, selected, 6);
    }
  });
});

const keyed = (keys: readonly CubeCell[]) => keys.map((k) => ({ key: k }));

describe('nearestFirst', () => {
  it('orders by angle to the tile, then coarser first', () => {
    // The eye at the middle of `inside`, a quarter of `around` from `near`.
    const eye = tileCap(key(4, 8, 8)).centre;
    const [far, near, inside, around] = [
      key(3, 7, 7),
      key(3, 4, 3),
      key(4, 8, 8),
      key(3, 4, 4),
    ];
    assert.deepEqual(
      nearestFirst(keyed([far, near, inside, around]), eye).map((t) =>
        cubeTileId(t.key),
      ),
      ['pz/3/4/4', 'pz/4/8/8', 'pz/3/4/3', 'pz/3/7/7'],
    );
    assert.equal(distanceTo(around, eye), 0);
  });

  it('measures across a face edge', () => {
    // The eye a quarter tile in from the face's `right` edge.
    const eye = tileCap(key(4, 15, 8)).centre;
    const across = neighbour(key(3, 7, 4), 'right');
    const sameFace = key(3, 5, 4);
    assert.notEqual(across.face, 'pz');
    assert.deepEqual(
      nearestFirst(keyed([sameFace, across]), eye).map((t) =>
        cubeTileId(t.key),
      ),
      [cubeTileId(across), cubeTileId(sameFace)],
    );
    assert.ok(distanceTo(across, eye) < distanceTo(key(3, 6, 4), eye));
  });
});
