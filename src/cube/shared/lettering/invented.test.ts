import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { alphabetOf, LETTERS } from './invented';
import { latinGlyph } from './latin';
import { bounds } from './polyline';

const drawing = (n: number, char: string): string =>
  JSON.stringify(alphabetOf(n).get(char)?.lines);

describe('a floor’s invented alphabet', () => {
  it('holds a glyph for every letter and digit', () => {
    assert.equal(LETTERS.length, 36);
    for (const n of [9, 27, 40, 66]) {
      assert.deepEqual([...alphabetOf(n).keys()], LETTERS);
    }
  });

  it('is the same alphabet whenever it is read', () => {
    assert.equal(alphabetOf(31), alphabetOf(31));
  });

  it('differs from floor to floor, and from Latin', () => {
    const changed = LETTERS.filter(
      (char) => drawing(20, char) !== drawing(21, char),
    );
    assert.ok(changed.length > 30, `${changed.length} glyphs differ`);
    for (const char of LETTERS) {
      assert.notEqual(
        drawing(20, char),
        JSON.stringify(latinGlyph(char).lines),
        char,
      );
    }
  });

  it('gives a floor’s letters glyphs of their own, nearly all', () => {
    for (let n = 9; n <= 66; n += 1) {
      const distinct = new Set(LETTERS.map((char) => drawing(n, char)));
      assert.ok(distinct.size >= 33, `floor ${n}: ${distinct.size} distinct`);
    }
  });

  it('draws within the cap height and its own advance', () => {
    for (const n of [9, 24, 45, 66]) {
      for (const [char, { lines, advance }] of alphabetOf(n)) {
        const [left, bottom, right, top] = bounds(lines);
        const where = `floor ${n}, ${char}`;
        assert.ok(
          lines.every((line) =>
            line.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)),
          ),
          where,
        );
        assert.ok(Math.abs(left) < 1e-9 && right < advance, where);
        assert.ok(bottom >= 0 && top <= 1 + 1e-9, where);
      }
    }
  });
});
