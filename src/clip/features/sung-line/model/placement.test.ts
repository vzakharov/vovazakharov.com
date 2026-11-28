import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LYRIC_LINES } from '@/clip/shared/score';

import { placementOf } from './placement';

describe('placementOf', () => {
  it('places every line of the song', () => {
    for (const [n, line] of LYRIC_LINES.entries()) {
      assert.doesNotThrow(() => placementOf(line, n), line.text);
    }
  });

  it('sets the verse in the hand and its calls on the channel', () => {
    const idioms = new Set(
      LYRIC_LINES.flatMap((line, n) =>
        line.from > 27 && line.from < 42
          ? [`${line.kind} ${placementOf(line, n).idiom}`]
          : [],
      ),
    );
    assert.deepEqual([...idioms].toSorted(), ['call dot', 'sung hand']);
  });

  it('captions the chorus from its first line, which starts in the verse', () => {
    const n = LYRIC_LINES.findIndex(({ text }) =>
      text.startsWith('Так хорошо'),
    );
    const line = LYRIC_LINES[n];
    assert.ok(line);
    assert.equal(placementOf(line, n).idiom, 'dot');
  });
});
