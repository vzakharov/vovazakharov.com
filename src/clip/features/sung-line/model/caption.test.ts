import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Line } from '@/clip/shared/score';

import { presence, shown, sungChars, wrapped } from './caption';

const LINE: Line = {
  kind: 'sung',
  text: 'Как, сука, хорошо',
  starts: [0, 5, 11],
  words: [
    { text: 'Как,', from: 1, to: 1.4 },
    { text: 'сука,', from: 2, to: 2.5 },
    { text: 'хорошо', from: 3, to: 4 },
  ],
  from: 1,
  to: 4,
};

describe('sungChars', () => {
  it('counts nothing before the first word and the whole line after the last', () => {
    assert.equal(sungChars(LINE, 0.5), 0);
    assert.equal(sungChars(LINE, 9), LINE.text.length);
  });

  it('holds a sung word whole through the gap after it', () => {
    assert.equal(sungChars(LINE, 1.7), 4);
  });

  it('spells out the word being sung over its span', () => {
    assert.equal(sungChars(LINE, 3.5), 11 + 3);
  });
});

describe('shown', () => {
  it('blanks what is not sung yet, keeping the line’s length', () => {
    assert.equal(shown('Как, сука\nхорошо', 6), 'Как, с   \n      ');
  });
});

describe('wrapped', () => {
  it('leaves a short line whole', () => {
    assert.equal(wrapped('Как, сука, хорошо', 20), 'Как, сука, хорошо');
  });

  it('breaks a long one at the space nearest its middle', () => {
    assert.equal(
      wrapped('Так хорошо-шо-шо не сдохнуть бы от счастья', 30),
      'Так хорошо-шо-шо не\nсдохнуть бы от счастья',
    );
  });
});

describe('presence', () => {
  it('holds the line after it is sung, then fades it', () => {
    assert.equal(presence(LINE, 4.5), 1);
    assert.ok(presence(LINE, 6.6) < 1);
    assert.equal(presence(LINE, 9), 0);
  });
});
