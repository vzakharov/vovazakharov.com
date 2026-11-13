import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OUTDOOR_SHADERS, outdoorSource } from './outdoor-shaders';
import { numbersOf, pinHash } from './shader-pin.test-kit';

/**
 * Each outdoor shader's source at 052138ff, before its pieces moved into
 * `.wgsl` files, as the kit's `canonical()` reads it: the move is pinned declaration
 * for declaration. The lens is floor 1's source under a stage of its own,
 * which the theme's pin holds.
 */
const BEFORE: Readonly<Record<keyof typeof OUTDOOR_SHADERS, string>> = {
  seam: 'fcf113a71e0279ad',
  sky: 'f453dbebf48693d7',
  skyClouds: 'ff9989d325ba98a1',
  sand: 'e9196c1b767ff88d',
  shell: '97677acae4a46423',
  sea: '1977b83a5bc53717',
};

/**
 * The ids of the pieces that give names to numbers TypeScript holds too, by
 * their `const NAME = value;` lines: `canonical()` writes each such name
 * back as its value, on both sides of the move, so a number written out
 * before it and named after it reads the same. `BEFORE` is canonical under
 * this set, so changing it re-derives `BEFORE` at 052138ff.
 */
const NUMBERED: ReadonlySet<string> = new Set<string>([
  'outside/shore-wetness-numbers',
  'outside/sun',
  'outside/swell-numbers',
  'outside/water-level-numbers',
]);

describe("every outdoor shader's source", () => {
  it('declares what it did before the move', () => {
    const pinned = new Map(Object.entries(BEFORE));
    for (const [name, roots] of Object.entries(OUTDOOR_SHADERS)) {
      const [source, numbers] = [
        outdoorSource(roots),
        numbersOf(roots, NUMBERED),
      ];
      const hash = pinHash(source, numbers);
      assert.equal(hash, pinned.get(name), name);
    }
  });
});
