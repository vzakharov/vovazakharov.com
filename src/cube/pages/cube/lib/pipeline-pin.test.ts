import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble } from '@/cube/shared/shader';
import { pinHash } from '@/cube/shared/shader/index.test-only';

import { BLOOM_PASS } from '../ui/bloom-pass.shader.generated';
import { HALVE_SHADER, REFLECTION_SHADER } from '../ui/reflection-shader';
import { outsideLensSource } from './outside-lens';
import { shaderOf } from './shader';

/**
 * The shaders of the frame's own passes: floor 1's, whose stage every floor
 * shares, the outside's lens over it, and the passes after the scene.
 */
const PIPELINE = {
  floor: () => shaderOf(1),
  outsideLens: () => outsideLensSource(),
  halve: () => HALVE_SHADER,
  reflection: () => REFLECTION_SHADER,
  bloom: () => assemble([BLOOM_PASS]),
} satisfies Readonly<Record<string, () => string>>;

/**
 * Each pipeline shader's source at 1ad37e1f, before its WGSL moved into
 * `.wgsl` files, as the kit's `canonical()` reads it, so
 * changing that re-derives it there.
 */
const BEFORE: Readonly<Record<keyof typeof PIPELINE, string>> = {
  floor: '15151092bad2fe2b',
  outsideLens: '46c075cfb3389e14',
  halve: 'c18361ac1eecb824',
  reflection: '3021e986fb8f8b29',
  bloom: '6b9d9d4b40b06e54',
};

describe("every pipeline shader's source", () => {
  it('declares what it did before the move', () => {
    const pinned = new Map(Object.entries(BEFORE));
    for (const [name, linked] of Object.entries(PIPELINE)) {
      const source = linked();
      const hash = pinHash(source);
      assert.equal(hash, pinned.get(name), name);
    }
  });
});
