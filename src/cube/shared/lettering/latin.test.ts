import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LATIN_CHARS, latinGlyph } from './latin';
import { bounds } from './polyline';

const WANTED = [
  'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z',
  '0 1 2 3 4 5 6 7 8 9',
  '. , ! ? : ; - \' " ( ) / + = % & # * µ',
  '→ ← ↑ ↓',
].flatMap((row) => row.split(' '));

describe('the Latin stroke font', () => {
  it('draws capitals, digits, common punctuation and four arrows', () => {
    for (const char of WANTED) {
      assert.ok(LATIN_CHARS.includes(char), `no glyph for ${char}`);
    }
  });

  it('keeps every glyph between the baseline and a little past the caps', () => {
    for (const char of LATIN_CHARS) {
      const { lines, advance } = latinGlyph(char);
      const [left, bottom, right, top] = bounds(lines);
      assert.ok(lines.length > 0, char);
      assert.ok(left >= 0 && right < advance, char);
      assert.ok(bottom >= -0.35 && top <= 1.1, char);
    }
  });

  it('gives no two characters the same glyph', () => {
    const seen = new Set(
      LATIN_CHARS.map((char) => JSON.stringify(latinGlyph(char).lines)),
    );
    assert.equal(seen.size, LATIN_CHARS.length);
  });

  it('writes lower case as capitals', () => {
    assert.equal(latinGlyph('q'), latinGlyph('Q'));
  });

  it('leaves white space blank and boxes what it cannot draw', () => {
    assert.deepEqual(latinGlyph(' ').lines, []);
    assert.ok(latinGlyph(' ').advance > 0);
    assert.equal(latinGlyph('☃'), latinGlyph('☂'));
    assert.ok(latinGlyph('☃').lines.length > 0);
  });
});
