import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { alphabetOf, LETTERS } from './invented';
import { latinGlyph } from './latin';
import { glyphIn, LATIN, scriptOf } from './script';

const inventedOn = (n: number): string[] =>
  LETTERS.filter(
    (char) => glyphIn(char, scriptOf(n)) === alphabetOf(n).get(char),
  );

/** How many strokes floor `n` writes its letters and digits in. */
function pieces(n: number): number {
  let count = 0;
  for (const char of LETTERS) count += glyphIn(char, scriptOf(n)).lines.length;
  return count;
}

describe('a floor’s script', () => {
  it('is plain Latin down to floor 8', () => {
    for (let n = 1; n <= 8; n += 1) {
      assert.deepEqual(scriptOf(n), { ...LATIN, storey: n });
      for (const char of LETTERS) {
        assert.equal(glyphIn(char, scriptOf(n)), latinGlyph(char));
      }
    }
  });

  it('swaps in more invented letters floor by floor, all by floor 40', () => {
    const counts = [9, 16, 24, 32, 40].map((n) => inventedOn(n).length);
    assert.ok((counts[0] ?? 0) <= 6, counts.join(', '));
    assert.deepEqual(
      counts,
      counts.toSorted((a, b) => a - b),
    );
    assert.equal(counts.at(-1), LETTERS.length);
    assert.equal(inventedOn(53).length, LETTERS.length);
  });

  it('keeps punctuation and arrows Latin on every whole floor', () => {
    for (const char of ['.', ':', '→', '↓']) {
      assert.equal(glyphIn(char, scriptOf(47)), latinGlyph(char));
    }
  });

  it('writes a letter as one glyph all over a floor', () => {
    for (const n of [20, 45, 60, 66]) {
      assert.deepEqual(glyphIn('m', scriptOf(n)), glyphIn('M', scriptOf(n)));
      assert.deepEqual(glyphIn('M', scriptOf(n)), glyphIn('M', scriptOf(n)));
    }
  });

  it('holds its strokes together to floor 53 and loosens them after', () => {
    assert.equal(scriptOf(53).looseness, 0);
    assert.equal(scriptOf(66).looseness, 1);
    const whole = alphabetOf(60).get('A');
    const loose = glyphIn('A', scriptOf(60));
    assert.notDeepEqual(loose.lines, whole?.lines);
    assert.equal(loose.advance, whole?.advance);
    assert.ok(
      loose.lines.every((line) =>
        line.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y)),
      ),
    );
  });

  it('breaks strokes into more pieces the looser it gets', () => {
    assert.ok(pieces(66) > pieces(61));
    assert.ok(pieces(61) >= pieces(54));
  });
});
