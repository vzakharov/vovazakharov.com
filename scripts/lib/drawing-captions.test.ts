import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { translateDrawing } from './drawing-captions.ts';

const SVG = [
  '<svg viewBox="0 0 10 10" aria-label="один гриб">',
  '<text x="1" font-style="italic">две стадии</text>',
  '<text x="2" translate="no">Ж</text>',
  '</svg>',
].join('\n');

describe('translateDrawing', () => {
  it('swaps each caption and the label, leaving `translate="no"` as drawn', () => {
    assert.equal(
      translateDrawing(SVG, {
        'один гриб': 'one fungus',
        'две стадии': 'two stages',
      }),
      [
        '<svg viewBox="0 0 10 10" aria-label="one fungus">',
        '<text x="1" font-style="italic">two stages</text>',
        '<text x="2" translate="no">Ж</text>',
        '</svg>',
      ].join('\n'),
    );
  });

  it('throws on a caption the dictionary lacks', () => {
    assert.throws(
      () => translateDrawing(SVG, { 'один гриб': 'one fungus' }),
      /no translation for “две стадии”/,
    );
  });

  it('throws on an entry the drawing no longer says', () => {
    assert.throws(
      () =>
        translateDrawing(SVG, {
          'один гриб': 'one fungus',
          'две стадии': 'two stages',
          'старая подпись': 'old caption',
        }),
      /“старая подпись” is not in the drawing/,
    );
  });
});
