import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { dotsWide, GLYPH, glyph } from './glyphs';

const REQUIRED = '0123456789:PLAYSCHRE►●ГБ ';

describe('glyph', () => {
  it('has every character the display and the bug write', () => {
    for (const char of REQUIRED)
      assert.ok(glyph(char).length > 0 || char === ' ', char);
  });

  it('keeps every lit dot inside the 5 × 7 cell', () => {
    for (const char of `${REQUIRED}ABDFGIJKMNOQTUVWXYZДЁИЙЛПШЫЯ.-`) {
      for (const [x, y] of glyph(char)) {
        assert.ok(
          x >= 0 && x < GLYPH.columns && y >= 0 && y < GLYPH.rows,
          `${char} ${x},${y}`,
        );
      }
    }
  });

  it('draws a Cyrillic letter as the Latin one it looks like', () => {
    assert.deepEqual(glyph('К'), glyph('K'));
    assert.deepEqual(glyph('Н'), glyph('H'));
    assert.deepEqual(glyph('Р'), glyph('P'));
  });

  it('tells Г from Б and both from the Latin letters', () => {
    assert.notDeepEqual(glyph('Г'), glyph('Б'));
    assert.notDeepEqual(glyph('Б'), glyph('B'));
  });

  it('lights the top row of Г across and its stem down', () => {
    const lit = new Set(glyph('Г').map(([x, y]) => `${x},${y}`));
    for (let x = 0; x < 5; x += 1) assert.ok(lit.has(`${x},0`));
    for (let y = 0; y < 7; y += 1) assert.ok(lit.has(`0,${y}`));
    assert.equal(lit.size, 11);
  });

  it('writes the channel ident', () => {
    for (const char of 'ТЕЛЕКАНАЛ ГРЁБАНЫЙ БАЛ ПРЕДСТАВЛЯЕТ T.ME/FKNBALL')
      assert.ok(glyph(char).length > 0 || char === ' ', char);
    assert.notDeepEqual(glyph('Ё'), glyph('Е'));
    assert.notDeepEqual(glyph('Й'), glyph('И'));
  });

  it('throws on a character the face lacks', () => {
    assert.throws(() => glyph('ж'), /no glyph/);
  });
});

describe('dotsWide', () => {
  it('counts six dots a character, less the last gap', () => {
    assert.equal(dotsWide(''), 0);
    assert.equal(dotsWide('A'), 5);
    assert.equal(dotsWide('PLAY ►'), 35);
    assert.equal(dotsWide('ГБ'), 11);
  });
});
