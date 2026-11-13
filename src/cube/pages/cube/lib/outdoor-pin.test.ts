import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, it } from 'node:test';

import type { Wgsl } from '@/cube/shared/shader';

import { OUTDOOR_SHADERS, outdoorSource } from './outdoor-shaders';

/**
 * Each outdoor shader's source at 052138ff, before its pieces moved into
 * `.wgsl` files, as `canonical()` reads it: the move is pinned declaration
 * for declaration. The lens is floor 1's source under a stage of its own,
 * which the theme's pin holds.
 */
const BEFORE: Readonly<Record<keyof typeof OUTDOOR_SHADERS, string>> = {
  seam: 'ba1cee4f9637eea2',
  sky: 'ce6c3983ef14351e',
  skyClouds: '043af2da2a505657',
  sand: '0bdc0303c7a2a91a',
  shell: '391c63e1a41cc5e1',
  sea: '60ba7e899d94d4e6',
};

/**
 * The ids of the pieces that give names to numbers TypeScript holds too, by
 * their `const NAME = value;` lines: `canonical()` writes each such name
 * back as its value, on both sides of the move, so a number written out
 * before it and named after it reads the same. `BEFORE` is canonical under
 * this set, so changing it re-derives `BEFORE` at 052138ff.
 */
const NUMBERED: ReadonlySet<string> = new Set<string>(['outside/sun']);

/** Every piece `roots` reach, each once. */
function reached(roots: readonly Wgsl[]): Wgsl[] {
  const seen = new Map<string, Wgsl>();
  const visit = (piece: Wgsl): void => {
    if (seen.has(piece.id)) return;
    seen.set(piece.id, piece);
    for (const need of piece.needs) visit(need);
  };
  for (const root of roots) visit(root);
  return [...seen.values()];
}

/** The `const NAME = value;` lines of the numbering pieces `roots` reach. */
function numbersOf(roots: readonly Wgsl[]): Map<string, string> {
  const numbers = new Map<string, string>();
  for (const { id, listing } of reached(roots)) {
    if (!NUMBERED.has(id)) continue;
    for (const [, name = '', value = ''] of listing.matchAll(
      /^const\s+(\w+)(?:\s*:\s*[\w<>]+)?\s*=\s*([^;]+);/gm,
    )) {
      numbers.set(name, value.trim());
    }
  }
  return numbers;
}

/**
 * `source`'s module-scope declarations, each with its comments and layout
 * taken out, in sorted order: WGSL binds a module's names whatever order
 * they stand in, so a piece split in two or placed elsewhere reads the same.
 */
function declarations(source: string): string[] {
  const code = source.replaceAll(/\/\/.*$/gm, '');
  const found: string[] = [];
  let depth = 0;
  let start = 0;
  for (let at = 0; at < code.length; at++) {
    const char = code[at];
    if (char === '{' || char === '(') depth++;
    if (char === '}' || char === ')') depth--;
    const ends =
      depth === 0 &&
      (char === ';' || (char === '}' && !/^\s*;/.test(code.slice(at + 1))));
    if (!ends) continue;
    found.push(code.slice(start, at + 1).replaceAll(/\s+/g, ''));
    start = at + 1;
  }
  return found
    .map((text) => text.replaceAll(/,(?=[)}])/g, '').replace(/};$/, '}'))
    .toSorted();
}

/**
 * `roots`' source as it read before its numbers took names: each numbering
 * declaration dropped, and its name written back as its value.
 */
function canonical(roots: readonly Wgsl[]): string {
  const numbers = numbersOf(roots);
  const named = (text: string): boolean =>
    [...numbers.keys()].some((name) =>
      new RegExp(`^const${name}[:=]`).test(text),
    );
  return declarations(outdoorSource(roots))
    .filter((text) => !named(text))
    .map((text) =>
      text.replaceAll(/(?<![\w.])[A-Z_a-z]\w*/g, (word) => {
        const value = numbers.get(word);
        return value === undefined ? word : value.replaceAll(/\s+/g, '');
      }),
    )
    .join('\n');
}

describe("every outdoor shader's source", () => {
  it('declares what it did before the move', () => {
    const pinned = new Map(Object.entries(BEFORE));
    for (const [name, roots] of Object.entries(OUTDOOR_SHADERS)) {
      const hash = createHash('sha256').update(canonical(roots)).digest('hex');
      assert.equal(hash.slice(0, 16), pinned.get(name), name);
    }
  });
});
