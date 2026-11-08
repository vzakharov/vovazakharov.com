import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { worldHash } from './hash';
import { WORD_COUNT } from './layout';
import { makeMask, MASK, parseMask, serializeMask, worldWords } from './mask';

/** A synthetic `ours`: words no hash would give, low and high bits both set. */
const ours = Uint32Array.from(
  { length: WORD_COUNT },
  (_, i) => (Math.imul(i, 0x9e_37_79_b9) ^ (i << 7)) >>> 0,
);

describe('mask', () => {
  it('has a word for every word of a world', () => {
    assert.equal(MASK.length, WORD_COUNT);
  });

  it('makes world 1 decode to ours exactly, through its file', () => {
    const mask = parseMask(JSON.parse(serializeMask(makeMask(ours))));
    assert.deepEqual(worldWords('1', mask), ours);
  });

  it('leaves every other world its own hash under the mask', () => {
    const mask = makeMask(ours);
    const words = worldWords('2', mask);
    const hash2 = worldHash('2');
    const hash1 = worldHash('1');
    for (const i of [0, 5, 6, 1000, WORD_COUNT - 1]) {
      assert.equal(words[i], (hash2(i) ^ hash1(i) ^ (ours[i] ?? 0)) >>> 0);
    }
    assert.notDeepEqual(words, ours);
  });

  it('XORs the hash with the mask, all-zero mask giving the bare hash', () => {
    const zero = new Uint32Array(WORD_COUNT);
    const hash = worldHash('7');
    const words = worldWords('7', zero);
    for (const i of [0, 1, 777, WORD_COUNT - 1])
      assert.equal(words[i], hash(i));
  });

  it('refuses a file of the wrong K or length', () => {
    assert.throws(() => parseMask({ K: 64, words: '' }));
    assert.throws(() => parseMask({ K: 128, words: 'AAAA' }), /bytes/);
    assert.throws(() => serializeMask(new Uint32Array(3)), /words/);
  });
});
