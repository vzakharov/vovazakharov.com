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
 * `text` with its layout taken out: a run of white space goes, but for one
 * space between two words, so `return SHORE_LAG` keeps the name a word.
 */
const unspaced = (text: string): string =>
  text.replaceAll(/\s+/g, ' ').replaceAll(/ (?!\w)|(?<!\w) /g, '');

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
    found.push(unspaced(code.slice(start, at + 1)));
    start = at + 1;
  }
  return found
    .map((text) => text.replaceAll(/,(?=[)}])/g, '').replace(/};$/, '}'))
    .toSorted();
}

/** A float literal: a point or an exponent, in decimal. */
const FLOAT =
  /(?<![\w.])(?:\d+\.\d*|\.\d+|\d+(?:\.\d*)?e[+-]?\d+)(?:e[+-]?\d+)?f?(?![\w.])/gi;

/** The name a `const` declaration gives, read with its layout taken out. */
const constName = (text: string): string | undefined =>
  /^const ([A-Z_a-z]\w*)[:=]/.exec(text)?.[1];

/**
 * `texts` without the constants no other declaration reads: a constant
 * nothing reads draws nothing, so a shader that stops carrying one is
 * unchanged.
 */
function read(texts: readonly string[]): string[] {
  return texts.filter((text) => {
    const name = constName(text);
    if (name === undefined) return true;
    const word = new RegExp(String.raw`(?<![\w.])${name}(?!\w)`);
    return texts.some((other) => other !== text && word.test(other));
  });
}

/**
 * `roots`' source as it read before its numbers took names: each numbering
 * declaration dropped, its name written back as its value, the constants
 * nothing reads left out, and every float literal written by its value, so
 * `1e4` and `10000.0` read the same.
 */
function canonical(roots: readonly Wgsl[]): string {
  const numbers = numbersOf(roots);
  const named = (text: string): boolean => {
    const name = constName(text);
    return name !== undefined && numbers.has(name);
  };
  return read(declarations(outdoorSource(roots)))
    .filter((text) => !named(text))
    .map((text) =>
      text.replaceAll(/(?<![\w.])[A-Z_a-z]\w*/g, (word) => {
        const value = numbers.get(word);
        return value === undefined ? word : unspaced(value);
      }),
    )
    .map((text) =>
      folded(
        text.replaceAll(
          FLOAT,
          (literal) => `${String(Number.parseFloat(literal))}f`,
        ),
      ),
    )
    .join('\n');
}

/** A float literal as `canonical` writes it, its value captured. */
const LITERAL = String.raw`(\d+(?:\.\d+)?(?:e[+-]?\d+)?)f`;

/**
 * The first two factors of a product or quotient of float literals: it
 * starts after an opening, a comparison, a sum or a keyword, so nothing binds tighter
 * before it, and runs left to right, so they are worked out first.
 */
const LITERALS = new RegExp(
  String.raw`(?<=^|[ (,=+<>?:{[]|(?<![*/])-)${LITERAL}([*/])${LITERAL}(?![\w.])`,
);

/** A float literal alone in brackets that call nothing. */
const BRACKETED = new RegExp(String.raw`(?<!\w)\(${LITERAL}\)`);

/**
 * `text` with each product or quotient of literals worked out, as WGSL's
 * constant evaluation does: `2.0 * SEA_GRAVITY`, its name written back, reads
 * as the `19.62` TypeScript worked out before the move.
 */
function folded(text: string): string {
  let now = text;
  for (;;) {
    const next = now
      .replace(LITERALS, (_, a: string, op: string, b: string) => {
        const [x, y] = [Number.parseFloat(a), Number.parseFloat(b)];
        return `${String(op === '*' ? x * y : x / y)}f`;
      })
      .replace(BRACKETED, '$1f');
    if (next === now) return now;
    now = next;
  }
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
