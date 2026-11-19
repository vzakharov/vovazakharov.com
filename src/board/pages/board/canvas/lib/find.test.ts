import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { PlacedItem } from '@/board/entities/item';

import { matching, stepped } from './find.ts';

const STAMP = { updated: '2026-11-19T12:00:00.000Z', author: 'agent:cube' };

const ITEMS: PlacedItem[] = [
  {
    ...STAMP,
    id: 'tempo',
    kind: 'sticky',
    x: 0,
    y: 0,
    w: 380,
    color: 'gray',
    text: 'Tried and dropped: a sine in place of the minute',
  },
  {
    ...STAMP,
    id: 'zone',
    kind: 'zone',
    x: 0,
    y: 0,
    w: 900,
    h: 900,
    title: 'Portals: the forks',
  },
  {
    ...STAMP,
    id: 'quote',
    kind: 'sticky',
    x: 0,
    y: 0,
    w: 380,
    color: 'green',
    text: 'Vova: “just what we need”, the café’s sign',
  },
  {
    ...STAMP,
    id: 'bare',
    kind: 'image',
    x: 0,
    y: 0,
    w: 300,
    src: 'images/a.webp',
  },
  {
    ...STAMP,
    id: 'head',
    kind: 'text',
    x: 0,
    y: 0,
    size: 'h1',
    text: 'The shrinking cube',
  },
];

describe('matching', () => {
  it('finds nothing for a blank query', () => {
    assert.deepEqual(matching(ITEMS, '  '), []);
  });

  it('reads every kind’s text, the zone’s title and the text’s too', () => {
    assert.deepEqual(matching(ITEMS, 'PORTALS'), ['zone']);
    assert.deepEqual(matching(ITEMS, 'shrinking'), ['head']);
  });

  it('wants every word, anywhere and in any order', () => {
    assert.deepEqual(matching(ITEMS, 'minute sine'), ['tempo']);
    assert.deepEqual(matching(ITEMS, 'minute portals'), []);
  });

  it('folds accents and curly quotes', () => {
    assert.deepEqual(matching(ITEMS, "cafe's"), ['quote']);
    assert.deepEqual(matching(ITEMS, '"just'), ['quote']);
  });

  it('keeps the items’ order', () => {
    assert.deepEqual(matching(ITEMS, 'the'), [
      'tempo',
      'zone',
      'quote',
      'head',
    ]);
  });
});

describe('stepped', () => {
  it('wraps both ways', () => {
    assert.equal(stepped(2, 1, 3), 0);
    assert.equal(stepped(0, -1, 3), 2);
  });

  it('stays at 0 with nothing to step through', () => {
    assert.equal(stepped(0, 1, 0), 0);
  });
});
