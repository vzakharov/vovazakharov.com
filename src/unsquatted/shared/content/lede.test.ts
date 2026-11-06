import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ledeSpans, plainLede } from './lede';

describe('ledeSpans', () => {
  it('sets a marked run in italics', () => {
    assert.deepEqual(ledeSpans('So it goes. _Hura, najbrž?_'), [
      { text: 'So it goes. ', italic: false },
      { text: 'Hura, najbrž?', italic: true },
    ]);
  });

  it('leaves an unmarked lede one plain run', () => {
    assert.deepEqual(ledeSpans('No marks here.'), [
      { text: 'No marks here.', italic: false },
    ]);
  });

  it('keeps a lone underscore as text', () => {
    assert.deepEqual(ledeSpans('snake_case'), [
      { text: 'snake_case', italic: false },
    ]);
  });
});

describe('plainLede', () => {
  it('drops the marks', () => {
    assert.equal(plainLede('A _b_ c'), 'A b c');
  });
});
