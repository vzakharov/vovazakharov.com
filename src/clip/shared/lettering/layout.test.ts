import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ALPHABET, cut, layOut, writtenUpTo } from './layout';

describe('layOut', () => {
  it('has a glyph for every Russian capital, digit and the basic punctuation', () => {
    for (const character of 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789.,!?:;-«»() ') {
      assert.ok(ALPHABET.includes(character), character);
    }
  });

  it('sets lower case in capitals', () => {
    assert.deepEqual(
      layOut('как', { letterHeight: 10 }),
      layOut('КАК', { letterHeight: 10 }),
    );
  });

  it('throws on a character it has no glyph for', () => {
    assert.throws(
      () => layOut('Q', { letterHeight: 10 }),
      /No lettering glyph for Q/,
    );
  });

  it('scales with the size and centres a line on x = 0', () => {
    const left = layOut('ХО', { letterHeight: 100 });
    const centred = layOut('ХО', { letterHeight: 100, align: 'center' });
    const xs = centred.strokes.flatMap(({ points }) => points.map(([x]) => x));
    // A glyph's ink sits a little inside its advance, so the ink is centred
    // to within that margin.
    assert.ok(Math.abs(Math.min(...xs) + Math.max(...xs)) < 5);
    assert.ok(left.width > 100 && left.width < 200, String(left.width));
    assert.equal(left.height, 100);
  });

  it('counts strokes in writing order, each starting where the last ended', () => {
    const { strokes, inkLength } = layOut('КАК, СУКА', { letterHeight: 40 });
    let start = 0;
    for (const stroke of strokes) {
      assert.equal(stroke.inkBefore, start);
      start += stroke.inkLength;
    }
    assert.equal(inkLength, start);
  });

  it('numbers the strokes by letter, the space left out', () => {
    const glyphs = layOut('А Б', { letterHeight: 10 }).strokes.map(
      ({ glyph }) => glyph,
    );
    assert.deepEqual(glyphs, [0, 0, 1, 1]);
  });

  it('puts each line a leading below the last', () => {
    const { height } = layOut('А\nА', { letterHeight: 10, leading: 2 });
    assert.equal(height, 30);
  });

  it('draws the same unsteady hand for the same seed', () => {
    const a = layOut('ХОРОШО', { letterHeight: 50, jitter: 1, seed: 4 });
    const b = layOut('ХОРОШО', { letterHeight: 50, jitter: 1, seed: 5 });
    assert.deepEqual(
      a,
      layOut('ХОРОШО', { letterHeight: 50, jitter: 1, seed: 4 }),
    );
    assert.notDeepEqual(a.strokes, b.strokes);
  });
});

describe('writtenUpTo', () => {
  const layout = layOut('ХО', { letterHeight: 100 });

  it('writes nothing at 0 and everything at 1', () => {
    assert.deepEqual(writtenUpTo(layout, 0), []);
    const all = writtenUpTo(layout, 1);
    assert.equal(all.length, layout.strokes.length);
    assert.ok(all.every(({ done }) => done === 1));
  });

  it('cuts the stroke the hand is on, and leaves out the ones not begun', () => {
    const [first] = layout.strokes;
    assert.ok(first);
    const half = writtenUpTo(layout, first.inkLength / 2 / layout.inkLength);
    assert.equal(half.length, 1);
    assert.ok(Math.abs((half[0]?.done ?? 0) - 0.5) < 1e-9);
  });

  it('says how far past each finished stroke the hand has gone', () => {
    const strokes = writtenUpTo(layout, 1);
    assert.equal(strokes.at(-1)?.inkAfter, 0);
    assert.ok((strokes[0]?.inkAfter ?? 0) > 0);
  });
});

describe('cut', () => {
  it('stops a polyline the given length along it', () => {
    assert.deepEqual(
      cut(
        [
          [0, 0],
          [10, 0],
          [10, 10],
        ],
        15,
      ),
      [
        [0, 0],
        [10, 0],
        [10, 5],
      ],
    );
  });
});
