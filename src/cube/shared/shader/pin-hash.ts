import { createHash } from 'node:crypto';

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

/** A float literal as `canonical` writes it, its value captured. */
const LITERAL = String.raw`(\d+(?:\.\d+)?(?:e[+-]?\d+)?)f`;

/**
 * The first two factors of a product or quotient of float literals: it
 * starts after an opening, a comparison, a sum or a keyword, so nothing binds
 * tighter before it, and runs left to right, so they are worked out first.
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

/** A module constant: its name, upper case, and its value. */
const CONSTANT = /^const ([A-Z][\dA-Z_]*)(?::[\w<>]+)?=(.+);$/;

/** A value as `canonical` writes a literal: a number or a vector of them. */
const SIMPLE =
  /^-?(?:[\d+.e-]+f|\d+[iu]?|vec[2-4][fiu]\((?:-?[\d+.e-]+[fiu]?,)*-?[\d+.e-]+[fiu]?\))$/;

/** `text` with its float literals written by value and their products worked out. */
const evaluated = (text: string): string =>
  folded(
    text.replaceAll(
      FLOAT,
      (literal) => `${String(Number.parseFloat(literal))}f`,
    ),
  );

/**
 * `source` with its numbers' names taken out: each module constant whose
 * value is a literal is written in where it is read and its declaration
 * dropped, until none is left, so a number written out on one side of the
 * move and named on the other reads the same. Then the constants nothing
 * reads go too, declaration by declaration in sorted order, so the move is
 * pinned whatever order it left them in.
 */
function canonical(source: string): string {
  let texts = declarations(source).map((text) => evaluated(text));
  for (;;) {
    const values = new Map<string, string>();
    for (const text of texts) {
      const [, name, value] = CONSTANT.exec(text) ?? [];
      if (name !== undefined && value !== undefined && SIMPLE.test(value)) {
        values.set(name, value);
      }
    }
    if (values.size === 0) return read(texts).join('\n');
    texts = texts
      .filter((text) => !values.has(CONSTANT.exec(text)?.[1] ?? ''))
      .map((text) =>
        evaluated(
          text.replaceAll(
            /(?<![\w.])[A-Z][\dA-Z_]*(?!\w)/g,
            (word) => values.get(word) ?? word,
          ),
        ),
      );
  }
}

/** The first 16 hex digits of the hash of `source` as `canonical` reads it. */
export const pinHash = (source: string): string =>
  createHash('sha256').update(canonical(source)).digest('hex').slice(0, 16);
