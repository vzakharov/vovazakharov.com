import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LYRIC_LINES } from '@/clip/shared/score';

import { placementOf } from './placement';

describe('placementOf', () => {
  it('places every line of the song but the two the picture carries', () => {
    const unset = LYRIC_LINES.filter((line, n) => !placementOf(line, n));
    assert.deepEqual(
      unset.map(({ text }) => text),
      ['Так хорошо-шо-шо не сдохнуть бы от счастья', 'Хорошо!'],
    );
    assert.equal(unset.at(-1), LYRIC_LINES.at(-1));
  });

  it('sets the verse in the hand and its calls on the channel', () => {
    const idioms = new Set(
      LYRIC_LINES.flatMap((line, n) =>
        line.from > 27 && line.from < 42
          ? [`${line.kind} ${placementOf(line, n)?.idiom}`]
          : [],
      ),
    );
    assert.deepEqual([...idioms].toSorted(), ['call dot', 'sung hand']);
  });
});
