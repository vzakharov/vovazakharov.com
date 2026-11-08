import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  HARMONIC_COUNT,
  harmonicOf,
  harmonicWord,
  K,
  meaningOf,
  SEED_WORD,
  wavevectorOf,
  WORD_COUNT,
  wordOf,
} from './layout';

describe('layout', () => {
  it('counts the half-plane of |kx|, |ky| ≤ 128 and two words each after six', () => {
    assert.equal(K, 128);
    assert.equal(HARMONIC_COUNT, (257 * 257 + 1) / 2);
    assert.equal(WORD_COUNT, 6 + 2 * HARMONIC_COUNT);
  });

  it('puts the dome first, then the seed, then phase and factor per harmonic', () => {
    assert.deepEqual(meaningOf(0), { kind: 'dome', param: 'centreX' });
    assert.deepEqual(meaningOf(4), { kind: 'dome', param: 'turn' });
    assert.equal(SEED_WORD, 5);
    assert.deepEqual(meaningOf(5), { kind: 'seed' });
    assert.deepEqual(meaningOf(6), {
      kind: 'harmonic',
      part: 'phase',
      kx: 0,
      ky: 0,
    });
    assert.deepEqual(meaningOf(7), {
      kind: 'harmonic',
      part: 'factor',
      kx: 0,
      ky: 0,
    });
    assert.deepEqual(meaningOf(8), {
      kind: 'harmonic',
      part: 'phase',
      kx: 1,
      ky: 0,
    });
    assert.deepEqual(wavevectorOf(K + 1), { kx: -K, ky: 1 });
    assert.deepEqual(meaningOf(WORD_COUNT - 1), {
      kind: 'harmonic',
      part: 'factor',
      kx: K,
      ky: K,
    });
  });

  it('visits every half-plane wave vector once, and maps back', () => {
    const seen = new Set<string>();
    for (let h = 0; h < HARMONIC_COUNT; h += 1) {
      const k = wavevectorOf(h);
      assert.ok(k.ky > 0 || (k.ky === 0 && k.kx >= 0));
      assert.ok(Math.abs(k.kx) <= K && k.ky <= K);
      seen.add(`${k.kx},${k.ky}`);
      assert.equal(harmonicOf(k), h);
    }
    assert.equal(seen.size, HARMONIC_COUNT);
  });

  it('maps every word to its meaning and back', () => {
    for (let i = 0; i < WORD_COUNT; i += 1)
      assert.equal(wordOf(meaningOf(i)), i);
    assert.equal(harmonicWord(HARMONIC_COUNT - 1, 'factor'), WORD_COUNT - 1);
  });

  it('refuses what is outside it', () => {
    assert.throws(() => meaningOf(WORD_COUNT));
    assert.throws(() => meaningOf(-1));
    assert.throws(() => wavevectorOf(HARMONIC_COUNT));
    assert.throws(() => harmonicOf({ kx: -1, ky: 0 }));
    assert.throws(() => harmonicOf({ kx: 0, ky: -1 }));
    assert.throws(() => harmonicOf({ kx: K + 1, ky: 3 }));
    assert.throws(() => harmonicOf({ kx: 0.5, ky: 3 }));
  });
});
