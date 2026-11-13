import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Wgsl } from '@/cube/shared/shader';

import { BLOOM_SHADER } from '../ui/bloom';
import { HALVE_SHADER, REFLECTION_SHADER } from '../ui/reflection-shader';
import { outsideLensSource } from './outside-lens';
import { shaderOf } from './shader';
import { numbersOf, pinHash } from './shader-pin.test-kit';

/** A pipeline shader's whole source, and the pieces it was linked from. */
type Linked = { source: string; roots: readonly Wgsl[] };

/**
 * The shaders of the frame's own passes: floor 1's, whose stage every floor
 * shares, the outside's lens over it, and the passes after the scene.
 */
const PIPELINE = {
  floor: () => ({ source: shaderOf(1), roots: [] }),
  outsideLens: () => ({ source: outsideLensSource(), roots: [] }),
  halve: () => ({ source: HALVE_SHADER, roots: [] }),
  reflection: () => ({ source: REFLECTION_SHADER, roots: [] }),
  bloom: () => ({ source: BLOOM_SHADER, roots: [] }),
} satisfies Readonly<Record<string, () => Linked>>;

/**
 * Each pipeline shader's source at 1ad37e1f, before its WGSL moved into
 * `.wgsl` files, as the kit's `canonical()` reads it under `NUMBERED`, so
 * changing either re-derives it there.
 */
const BEFORE: Readonly<Record<keyof typeof PIPELINE, string>> = {
  floor: 'c03afe304e42a0b2',
  outsideLens: '8d5271e53464d7b6',
  halve: 'c18361ac1eecb824',
  reflection: '3ea6d9b045a4cf79',
  bloom: '6b9d9d4b40b06e54',
};

/** The ids of the pieces naming numbers TypeScript holds too. */
const NUMBERED: ReadonlySet<string> = new Set<string>();

describe("every pipeline shader's source", () => {
  it('declares what it did before the move', () => {
    const pinned = new Map(Object.entries(BEFORE));
    for (const [name, linked] of Object.entries(PIPELINE)) {
      const { source, roots } = linked();
      const numbers = numbersOf(roots, NUMBERED);
      const hash = pinHash(source, numbers);
      assert.equal(hash, pinned.get(name), name);
    }
  });
});
