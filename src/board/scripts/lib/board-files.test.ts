import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Item } from '@/board/entities/item';

import {
  type BoardFiles,
  decodeBoardFiles,
  homeOf,
  writeBoardFiles,
} from './board-files.ts';

const STAMP = { updated: '2026-11-06T22:30:00.000Z', author: 'agent:lead' };
const BOARD = 'b/island.yaml';
const CALLS = 'b/island/calls.yaml';
const STAR = 'b/island/star.yaml';

const zone = (id: string, x: number, w: number): Item => ({
  ...STAMP,
  id,
  kind: 'zone',
  x,
  y: 0,
  w,
  h: 500,
  title: id,
});
const sticky = (id: string, x: number): Item => ({
  ...STAMP,
  id,
  kind: 'sticky',
  x,
  y: 10,
  w: 100,
  color: 'blue',
  text: id,
});

const CALLS_ZONE = zone('z-calls', 0, 1000);
const STAR_ZONE = zone('z-star', 2000, 1000);
const INNER = zone('z-inner', 100, 300);
const ITEMS: Item[] = [CALLS_ZONE, STAR_ZONE, INNER];

describe('board files', () => {
  it('homes each item by the zone its top edge sits in', () => {
    const at = (item: Item): string => homeOf(BOARD, item, ITEMS, undefined);
    assert.equal(at(CALLS_ZONE), CALLS);
    assert.equal(at(sticky('a', 500)), CALLS);
    assert.equal(at(sticky('b', 2100)), STAR);
    assert.equal(at(sticky('c', 1500)), BOARD);
    assert.equal(at(sticky('d', 150)), 'b/island/inner.yaml');
    const line: Item = { ...STAMP, id: 'l', kind: 'line', from: 'b', to: 'a' };
    assert.equal(
      homeOf(BOARD, line, [...ITEMS, sticky('b', 2100)], undefined),
      STAR,
    );
    assert.equal(
      homeOf(BOARD, { ...sticky('e', 500), deleted: true }, ITEMS, STAR),
      STAR,
    );
  });

  const EMPTY_BOARD: BoardFiles = new Map([[BOARD, 'title: T\nitems: []\n']]);
  const files = (): BoardFiles =>
    new Map([
      ...EMPTY_BOARD,
      ...writeBoardFiles(BOARD, EMPTY_BOARD, [
        sticky('a', 500),
        CALLS_ZONE,
        STAR_ZONE,
      ]),
    ]);

  it('splits a board into its zones, each file opening on its zone', () => {
    const split = files();
    assert.deepEqual([...split.keys()].toSorted(), [BOARD, CALLS, STAR]);
    assert.match(split.get(CALLS) ?? '', /^items:\n {2}- id: z-calls\n/);
    assert.deepEqual(
      decodeBoardFiles(BOARD, split).map((item) => item.id),
      ['z-calls', 'a', 'z-star'],
    );
  });

  it('moves an item dragged into another zone, and leaves a settled board be', () => {
    const before = files();
    const moved = { ...sticky('a', 2100), updated: '2026-11-07T00:00:00.000Z' };
    const after = writeBoardFiles(BOARD, before, [moved]);
    assert.deepEqual([...after.keys()].toSorted(), [CALLS, STAR]);
    assert.doesNotMatch(after.get(CALLS) ?? '', /id: a\n/);
    assert.match(after.get(STAR) ?? '', /id: a\n/);
    assert.equal(writeBoardFiles(BOARD, before, []).size, 0);
  });

  it('refuses an id two files both hold', () => {
    const twice = new Map(files());
    twice.set(STAR, twice.get(CALLS) ?? '');
    assert.throws(() => decodeBoardFiles(BOARD, twice), /appears twice/);
  });
});
