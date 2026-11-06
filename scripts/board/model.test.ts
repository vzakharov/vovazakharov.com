import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { Item, mergeItems, newerThan, parseDbRow } from './model.ts';

const sticky = (id: string, updated: string, text = id): Item => ({
  kind: 'sticky',
  id,
  updated,
  author: 'agent:lead',
  x: 0,
  y: 0,
  text,
  color: 'yellow',
  w: 200,
});

const T1 = '2026-11-06T10:00:00.000Z';
const T2 = '2026-11-06T11:00:00.000Z';

describe('Item', () => {
  it('takes every kind', () => {
    const items: unknown[] = [
      sticky('a', T1),
      {
        kind: 'zone',
        id: 'z',
        updated: T1,
        author: 'u_x',
        x: 0,
        y: 0,
        title: 'Star',
        w: 900,
        h: 600,
      },
      {
        kind: 'image',
        id: 'i',
        updated: T1,
        author: 'u_x',
        x: 1,
        y: 2,
        src: '/_blob/0123456789abcdef0123456789abcdef',
        w: 300,
      },
      {
        kind: 'text',
        id: 't',
        updated: T1,
        author: 'agent:lead',
        x: 0,
        y: 0,
        text: 'Island',
        size: 'h1',
      },
      {
        kind: 'line',
        id: 'l',
        updated: T1,
        author: 'agent:lead',
        from: 'a',
        to: 't',
        dashed: true,
      },
    ];
    for (const item of items) Item.parse(item);
  });

  it('refuses an image from anywhere but its two homes', () => {
    assert.throws(() =>
      Item.parse({
        kind: 'image',
        id: 'i',
        updated: T1,
        author: 'u_x',
        x: 0,
        y: 0,
        src: 'https://example.com/a.png',
        w: 300,
      }),
    );
  });

  it('refuses an id the db path grammar would not take', () => {
    assert.throws(() => Item.parse(sticky('a/b', T1)));
  });
});

describe('mergeItems', () => {
  it('keeps the newer copy of each item', () => {
    const merged = mergeItems(
      [sticky('a', T2, 'base'), sticky('b', T1, 'base')],
      [sticky('a', T1, 'overlay'), sticky('b', T2, 'overlay')],
    );
    assert.deepEqual(
      merged.map((item) => item.kind === 'sticky' && item.text),
      ['base', 'overlay'],
    );
  });

  it('gives a tie to the overlay', () => {
    const [item] = mergeItems(
      [sticky('a', T1, 'base')],
      [sticky('a', T1, 'overlay')],
    );
    assert.equal(item?.kind === 'sticky' && item.text, 'overlay');
  });

  it('adds new ids after the base, in overlay order', () => {
    const merged = mergeItems(
      [sticky('a', T1)],
      [sticky('c', T1), sticky('b', T1)],
    );
    assert.deepEqual(
      merged.map((item) => item.id),
      ['a', 'c', 'b'],
    );
  });

  it('holds a tombstone against an older copy', () => {
    const tombstone = { ...sticky('a', T2), deleted: true };
    const [item] = mergeItems([tombstone], [sticky('a', T1)]);
    assert.equal(item?.deleted, true);
  });
});

describe('newerThan', () => {
  it('takes only what is new or strictly newer', () => {
    const changed = newerThan(
      [sticky('a', T1), sticky('b', T2)],
      [sticky('a', T2), sticky('b', T2), sticky('c', T1)],
    );
    assert.deepEqual(
      changed.map((item) => item.id),
      ['a', 'c'],
    );
  });
});

describe('parseDbRow', () => {
  it('returns the item stored under its own id', () => {
    assert.equal(parseDbRow('a', sticky('a', T1)).id, 'a');
  });

  it('refuses a row whose body names another item', () => {
    assert.throws(() => parseDbRow('b', sticky('a', T1)), /ids must match/);
  });

  it('refuses a malformed row rather than skipping it', () => {
    assert.throws(() => parseDbRow('a', { id: 'a', kind: 'sticky' }));
  });
});
