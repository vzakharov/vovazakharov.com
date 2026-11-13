import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import { OUTDOOR_SHADERS, outdoorSource } from './outdoor-shaders';

/**
 * Each outdoor shader's source as `outdoorSource()` wrote it at 052138ff,
 * before its pieces moved into `.wgsl` files, hashed as `tokens()` reads it:
 * the move is pinned token for token. The lens is floor 1's source under a
 * stage of its own, which the theme's pin holds.
 */
const BEFORE: Readonly<Record<keyof typeof OUTDOOR_SHADERS, string>> = {
  seam: 'e53443d50c4e9981',
  sky: '2ec1997a7713f54d',
  skyClouds: '40063d447da24ca2',
  sand: '9c861289720ba06b',
  shell: '7ab9558abbb596cf',
  sea: '25fc7a52a5353ebd',
};

/**
 * `text` without its layout, which Prettier owns: no whitespace, no trailing
 * comma, and no `;` after a struct's closing brace.
 */
const tokens = (text: string): string =>
  text
    .replaceAll(/\s+/g, '')
    .replaceAll(/,(?=[)}])/g, '')
    .replaceAll('};', '}');

describe("every outdoor shader's source", () => {
  it('is what it was before the move', () => {
    const pinned = new Map(Object.entries(BEFORE));
    for (const [name, roots] of Object.entries(OUTDOOR_SHADERS)) {
      const source = tokens(outdoorSource(roots));
      const hash = createHash('sha256').update(source).digest('hex');
      assert.equal(hash.slice(0, 16), pinned.get(name), name);
    }
  });
});
