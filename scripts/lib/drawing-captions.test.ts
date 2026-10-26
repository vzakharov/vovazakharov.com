import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  fillDrawing,
  isDrawingTemplate,
  signDrawing,
} from './drawing-captions.ts';

const TEMPLATE = [
  '<svg viewBox="0 0 10 10" aria-label="{{label}}">',
  '<text x="1" font-style="italic">Persoon · {{stage}}</text>',
  '<text x="2">Ж</text>',
  '</svg>',
].join('\n');

describe('fillDrawing', () => {
  it('fills each placeholder, the label’s included, and leaves the rest as drawn', () => {
    assert.equal(
      fillDrawing(TEMPLATE, { label: 'one fungus', stage: 'asexual stage' }),
      [
        '<svg viewBox="0 0 10 10" aria-label="one fungus">',
        '<text x="1" font-style="italic">Persoon · asexual stage</text>',
        '<text x="2">Ж</text>',
        '</svg>',
      ].join('\n'),
    );
  });

  it('escapes a wording for XML', () => {
    assert.match(
      fillDrawing(TEMPLATE, { label: '“a” & <b>', stage: 's' }),
      /aria-label="“a” &amp; &lt;b&gt;"/,
    );
  });

  it('throws on a key the captions lack', () => {
    assert.throws(
      () => fillDrawing(TEMPLATE, { label: 'one fungus' }),
      /no wording for {{stage}}/,
    );
  });

  it('throws on an entry no placeholder uses', () => {
    assert.throws(
      () =>
        fillDrawing(TEMPLATE, {
          label: 'one fungus',
          stage: 'asexual stage',
          old: 'old caption',
        }),
      /{{old}} is not in the drawing/,
    );
  });
});

describe('signDrawing', () => {
  it('sets the mark in the bottom-right corner, before the closing tag', () => {
    const signed = signDrawing(
      '<svg viewBox="0 0 1200 720">\n<rect/>\n</svg>\n',
      'mayawonders.com',
    );

    assert.match(
      signed,
      /<rect\/>\n<text x="1190" y="710" text-anchor="end"[^>]*>mayawonders\.com<\/text>\n<\/svg>\n$/,
    );
  });

  it('throws on a drawing with no viewBox', () => {
    assert.throws(
      () => signDrawing('<svg><rect/></svg>', 'mayawonders.com'),
      /no viewBox/,
    );
  });
});

describe('isDrawingTemplate', () => {
  it('tells a template from a drawing with nothing to fill', () => {
    assert.equal(isDrawingTemplate(TEMPLATE), true);
    assert.equal(isDrawingTemplate('<svg><text>Ж</text></svg>'), false);
  });
});
