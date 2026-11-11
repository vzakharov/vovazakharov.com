import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

import type { Item } from '@/board/entities/item';

import {
  decodeBoard,
  decodeItem,
  encodeItem,
  writeItems,
} from './board-file.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const STAMP = { updated: '2026-11-06T22:30:00.000Z', author: 'agent:lead' };

const STICKY: Extract<Item, { kind: 'sticky' }> = {
  ...STAMP,
  id: 's',
  kind: 'sticky',
  x: 1,
  y: -2,
  w: 200,
  color: 'blue',
  text: 'a',
};
const ZONE: Extract<Item, { kind: 'zone' }> = {
  ...STAMP,
  id: 'z',
  kind: 'zone',
  x: 0,
  y: 0,
  w: 800,
  h: 500,
  title: 'Zone',
};

const ONE_OF_EACH: Item[] = [
  STICKY,
  { ...STICKY, id: 'sd', done: true },
  ZONE,
  {
    ...STAMP,
    id: 'zc',
    kind: 'zone',
    x: 0,
    y: 0,
    w: 8,
    h: 5,
    title: 'Z',
    color: 'gray',
  },
  {
    ...STAMP,
    id: 'i',
    kind: 'image',
    x: 3,
    y: 4,
    w: 360,
    src: 'images/a.webp',
    caption: 'c',
  },
  { ...STICKY, id: 'se', icon: '🧊' },
  { ...STICKY, id: 'ss', icon: 'icons/lock.svg' },
  { ...ZONE, id: 'ze', icon: '🧊' },
  { ...STAMP, id: 't', kind: 'text', x: 5, y: 6, text: 'H', size: 'h1' },
  {
    ...STAMP,
    id: 'tw',
    kind: 'text',
    x: 5,
    y: 6,
    w: 300,
    text: 'H',
    size: 'h2',
  },
  { ...STAMP, id: 'l', kind: 'line', from: 's', to: 'z' },
  {
    ...STAMP,
    id: 'ld',
    kind: 'line',
    from: 's',
    to: 'z',
    label: 'go',
    dashed: true,
    spiral: 'cw',
  },
  { ...STAMP, id: 'gone', kind: 'line', from: 's', to: 'z', deleted: true },
];

const FILE = `title: Test board
items:
  # The one sticky.
  - id: s
    type: sticky
    updated: [2026-11-06T22:30:00.000Z, agent:lead]
    box: [1, -2, 200, blue]
    text: a
`;

describe('board file', () => {
  it('decodes what it encodes, for every type and optional field', () => {
    for (const item of ONE_OF_EACH)
      assert.deepEqual(decodeItem(encodeItem(item)), item);
  });

  it('reads the box positionally, a trailing word for colour or size', () => {
    assert.deepEqual(decodeBoard(FILE), [STICKY]);
  });

  it('reads an icon key, an emoji or an icons/ path', () => {
    const emoji = FILE.replace('    text: a', '    icon: 🧊\n    text: a');
    assert.deepEqual(decodeBoard(emoji), [{ ...STICKY, icon: '🧊' }]);
    assert.match(writeItems(FILE, [{ ...STICKY, icon: '🧊' }]), /icon: 🧊/);
  });

  it('refuses an icon that is neither an emoji nor an icons/ path', () => {
    for (const icon of ['word', 'images/a.svg', '🧊🧊🧊🧊🧊🧊🧊🧊🧊'])
      assert.throws(() => decodeItem(encodeItem({ ...STICKY, icon })));
  });

  it('refuses an id twice', () => {
    const twice = FILE + FILE.slice(FILE.indexOf('  - id'));
    assert.throws(() => decodeBoard(twice), /appears twice/);
  });

  it('refuses a box that does not fit its type', () => {
    assert.throws(() => decodeBoard(FILE.replace('200, blue', 'blue')));
  });

  it('writes only the keys that changed, keeping comments', () => {
    const moved: Item = { ...STICKY, x: 9 };
    const written = writeItems(FILE, [moved]);
    assert.match(written, /# The one sticky\./);
    assert.match(written, /box: \[ ?9, -2, 200, blue ?]/);
    assert.deepEqual(decodeBoard(written), [moved]);
  });

  it('appends a new item', () => {
    const written = writeItems(FILE, [ZONE]);
    assert.deepEqual(decodeBoard(written), [STICKY, ZONE]);
  });

  it('drops a key the item no longer has', () => {
    const line: Item = {
      ...STAMP,
      id: 'l',
      kind: 'line',
      from: 's',
      to: 'z',
      label: 'go',
    };
    const unlabelled: Item = { ...line, label: undefined };
    const written = writeItems(writeItems(FILE, [line]), [unlabelled]);
    assert.doesNotMatch(written, /text: go/);
    assert.deepEqual(decodeBoard(written), [
      STICKY,
      { ...STAMP, id: 'l', kind: 'line', from: 's', to: 'z' },
    ]);
  });

  it('holds the island board at a fixed point', () => {
    const text = readFileSync(
      path.join(REPO_ROOT, 'src/island-board/app/config/island.yaml'),
      'utf8',
    );
    const items = decodeBoard(text);
    assert.deepEqual(decodeBoard(writeItems(text, items)), items);
    assert.equal(writeItems(text, []), text);
  });
});
