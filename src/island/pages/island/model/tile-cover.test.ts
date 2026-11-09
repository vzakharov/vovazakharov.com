import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type CubeCell, type Face, neighbour } from '@/island/shared/globe';
import { cubeTileId, tileCap } from '@/island/entities/terrain';

import { coverAround, coverOf, distanceTo, nearestFirst } from './tile-cover';

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

describe('coverOf', () => {
  const selected = [key(4, 0, 0), key(4, 1, 0), key(4, 0, 1), key(4, 1, 1)];

  it('draws a selection fully in hand as it is', () => {
    assert.deepEqual(
      ids(coverOf(selected, holding(...selected))),
      ids(selected),
    );
  });

  it('covers missing children by their parent, which hides the loaded ones', () => {
    const has = holding(key(3, 0, 0), key(4, 0, 0), key(4, 1, 0));
    assert.deepEqual(ids(coverOf(selected, has)), ['pz/3/0/0']);
  });

  it('reaches past a missing parent to the nearest ancestor in hand', () => {
    const deep = [key(6, 5, 5), key(4, 2, 2)];
    assert.deepEqual(ids(coverOf(deep, holding(key(3, 0, 0), key(3, 1, 1)))), [
      'pz/3/0/0',
      'pz/3/1/1',
    ]);
  });

  it('keeps one stand-in when two nest', () => {
    const has = holding(key(3, 0, 0), key(5, 0, 0));
    assert.deepEqual(ids(coverOf([key(6, 0, 0), key(6, 3, 3)], has)), [
      'pz/3/0/0',
    ]);
  });

  it('leaves out a tile with nothing above it in hand', () => {
    assert.deepEqual(coverOf([key(4, 0, 0)], holding()), []);
  });

  it('takes no stand-in from another face at the same place', () => {
    assert.deepEqual(coverOf([key(4, 0, 0)], holding(key(3, 0, 0, 'px'))), []);
  });

  it('climbs no higher than a root', () => {
    assert.deepEqual(coverOf([key(2, 0, 0)], holding(key(1, 0, 0))), []);
  });
});

describe('coverAround', () => {
  const shown = [key(4, 0, 0), key(4, 1, 0), key(4, 0, 1), key(4, 1, 1)];
  const margin = [key(4, 2, 0), key(4, 2, 1)];

  it('draws the shown selection, not the coarse ancestor of a missing margin tile', () => {
    // The turn's case: new margin tiles, unheld, under a held root.
    const has = holding(key(3, 0, 0), ...shown);
    assert.deepEqual(
      ids(coverAround([...shown, ...margin], shown, has)),
      ids(shown),
    );
  });

  it('keeps the finer shown tiles while their coarser parent loads', () => {
    // The climb's case: the selection coarsens, its parents not yet held.
    const has = holding(key(2, 0, 0), ...shown);
    assert.deepEqual(ids(coverAround([key(3, 0, 0)], shown, has)), ids(shown));
  });

  it('adds held selected tiles beyond the shown ones', () => {
    const has = holding(...shown, ...margin);
    assert.deepEqual(
      ids(coverAround([...shown, ...margin], shown, has)),
      ids([...shown, ...margin]),
    );
  });

  it('stands an ancestor in beyond the shown tiles when it overlaps none', () => {
    const far = [key(5, 12, 0), key(5, 13, 0)];
    const has = holding(...shown, key(4, 6, 0), key(3, 0, 0));
    assert.deepEqual(ids(coverAround([...shown, ...far], shown, has)), [
      ...ids(shown),
      'pz/4/6/0',
    ]);
  });
});

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
      nearestFirst([far, near, inside, around], eye).map((k) => cubeTileId(k)),
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
      nearestFirst([sameFace, across], eye).map((k) => cubeTileId(k)),
      [cubeTileId(across), cubeTileId(sameFace)],
    );
    assert.ok(distanceTo(across, eye) < distanceTo(key(3, 6, 4), eye));
  });
});
