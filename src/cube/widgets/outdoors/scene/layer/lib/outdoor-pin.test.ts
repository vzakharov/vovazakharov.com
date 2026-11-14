import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pinHash } from '@/cube/shared/shader/index.test-only';

import { OUTDOOR_SHADERS, outdoorSource } from './outdoor-shaders';

/**
 * Each outdoor shader's source at 052138ff, before its pieces moved into
 * `.wgsl` files, as the kit's `canonical()` reads it: the move is pinned declaration
 * for declaration. The lens is floor 1's source under a stage of its own,
 * which the theme's pin holds.
 */
const BEFORE: Readonly<Record<keyof typeof OUTDOOR_SHADERS, string>> = {
  seam: 'e20076737f10f923',
  sky: '1f02e3ec6cb8fbac',
  skyClouds: '5d3b8fe2f8a768d2',
  sand: '3fece2ba20530e53',
  shell: '416f6a0b3abb9360',
  sea: '6e5aea094f773bd2',
};

describe("every outdoor shader's source", () => {
  it('declares what it did before the move', () => {
    const pinned = new Map(Object.entries(BEFORE));
    for (const [name, roots] of Object.entries(OUTDOOR_SHADERS)) {
      const source = outdoorSource(roots);
      const hash = pinHash(source);
      assert.equal(hash, pinned.get(name), name);
    }
  });
});
