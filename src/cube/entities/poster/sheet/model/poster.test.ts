import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { bounds, LATIN, scriptOf, strokes } from '@/cube/shared/lettering';

import { DRAWING_FRAME, POSTER_TALL, POSTER_WIDE } from '../../frame';
import { subjectOf } from '../../subject';
import { captionOf, type Inked, posterOf } from './poster';

const FLOORS = Array.from({ length: 67 }, (_, at) => at + 1);
const EPSILON = 1e-9;

const inked = (n: number): Inked[] =>
  posterOf(n).filter((each): each is Inked => each.part !== 'paper');

const part = (n: number, name: Inked['part']): Inked => {
  const found = inked(n).find((each) => each.part === name);
  assert.ok(found, `floor ${n} has no ${name}`);
  return found;
};

describe('a floor’s poster', () => {
  it('lists the paper, the title, the drawing, the ruler, the caption', () => {
    for (const n of FLOORS) {
      assert.deepEqual(
        posterOf(n).map((each) => each.part),
        ['paper', 'title', 'drawing', 'ruler', 'caption'],
      );
    }
  });

  it('is a sheet 0.36 by 0.3 room sides', () => {
    const [paper] = posterOf(12);
    assert.ok(paper?.part === 'paper');
    assert.equal(paper.sheetWide, 0.36);
    assert.equal(paper.sheetTall, 0.3);
    assert.equal(POSTER_WIDE, 0.36);
    assert.equal(POSTER_TALL, 0.3);
  });

  it('keeps the drawing inside its frame on every floor', () => {
    const { low, high } = DRAWING_FRAME;
    for (const n of FLOORS) {
      const { strokes: lines } = part(n, 'drawing');
      assert.ok(lines.length > 0, `floor ${n} draws nothing`);
      const [left, bottom, right, top] = bounds(lines);
      assert.ok(
        left >= low[0] - EPSILON &&
          bottom >= low[1] - EPSILON &&
          right <= high[0] + EPSILON &&
          top <= high[1] + EPSILON,
        `floor ${n}: ${[left, bottom, right, top].join(', ')}`,
      );
    }
  });

  it('keeps everything inked on the sheet', () => {
    for (const n of FLOORS) {
      for (const each of inked(n)) {
        const [left, bottom, right, top] = bounds(each.strokes);
        assert.ok(
          left >= 0 &&
            bottom >= 0 &&
            right <= POSTER_WIDE &&
            top <= POSTER_TALL,
          `floor ${n}, ${each.part}: ${[left, bottom, right, top].join(', ')}`,
        );
        assert.ok(each.nibWide > 0);
      }
    }
  });

  it('draws a thing life-size: as many room sides as the visitor sees it', () => {
    // Floor 5's mouse is 9 cm to a visitor of 10 cm, whose 1.6 m reads as
    // 0.32 of a room side.
    const [left, , right] = bounds(part(5, 'drawing').strokes);
    assert.ok(right - left > 0.2 && right - left <= 0.332);
  });

  it('writes the title in plain capitals on every floor', () => {
    const plain = strokes('ACTUAL SIZE', LATIN).length;
    for (const n of [1, 30, 67]) {
      assert.ok(part(n, 'title').strokes.length > plain);
    }
    assert.deepEqual(
      part(30, 'title').strokes.slice(0, plain),
      part(60, 'title').strokes.slice(0, plain),
    );
  });

  it('writes the caption in the floor’s script', () => {
    const lines = captionOf(subjectOf(45), 45);
    const written = lines.flatMap((line) => strokes(line, scriptOf(45)));
    const plain = lines.flatMap((line) => strokes(line, LATIN));
    assert.equal(part(45, 'caption').strokes.length, written.length);
    assert.notEqual(written.length, plain.length);
  });

  it('captions a sized thing with its length and how it stands to you', () => {
    assert.deepEqual(captionOf(subjectOf(1), 1), [
      'A GROWN-UP',
      '1.7 M TALL. YOUR SIZE.',
    ]);
    assert.deepEqual(captionOf(subjectOf(5), 5), [
      'A MOUSE',
      '9 CM LONG WITHOUT ITS TAIL. YOUR SIZE.',
    ]);
    assert.match(captionOf(subjectOf(11), 11)[1] ?? '', /TIMES YOUR SIZE\.$/);
  });

  it('captions a thing with no size by its note', () => {
    const subject = subjectOf(67);
    assert.deepEqual(captionOf(subject, 67), [
      subject.name,
      subject.unsizedNote,
    ]);
  });

  it('is the same poster every time it is asked for', () => {
    for (const n of [3, 33, 63]) assert.deepEqual(posterOf(n), posterOf(n));
  });
});
