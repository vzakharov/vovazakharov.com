import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/kernel/shared/lib/collections';

import {
  crawlDuration,
  INCH_PERIOD,
  INCH_SQUEEZE,
  pathLength,
  tripDuration,
  type TripPhase,
  WORM_CRAWL,
  WORM_GIRTH,
  WORM_GIRTH_LEAST,
  WORM_IN,
  WORM_LENGTH,
  WORM_OUT,
  WORM_PACE,
  WORM_PEEK_DURATION,
  WORM_SEGMENTS,
  wormBody,
  wormGirth,
  wormPeek,
  wormTrip,
  WRIGGLE_DURATION,
} from './worm';

const EPSILON = 1e-9;

describe('wormGirth', () => {
  it('is never under `WORM_GIRTH_LEAST` on the screen, at any zoom, and its window’s share on a big cap', () => {
    for (const zoom of [0.3, 0.6, 1, 1.5]) {
      for (const size of [40, 120, 400]) {
        assert.ok(wormGirth(size, zoom) * size * zoom >= WORM_GIRTH_LEAST);
      }
      const least = WORM_GIRTH_LEAST / WORM_GIRTH / zoom;
      assert.ok(Math.abs(wormGirth(least, zoom) - WORM_GIRTH) < EPSILON);
    }
    assert.equal(wormGirth(2000, 1), WORM_GIRTH);
  });
});

describe('wormTrip', () => {
  const LENGTHS = [0.05, 0.15, 0.3, 0.6, 0.9, 1.6];
  const STEP = 0.001;

  it('crawls at its pace, held between the shortest and the longest crawl', () => {
    for (const length of LENGTHS) {
      const crawl = crawlDuration(length);
      assert.ok(crawl >= WORM_CRAWL[0] && crawl <= WORM_CRAWL[1]);
      assert.equal(tripDuration(length), WORM_OUT + crawl + WORM_IN);
    }
    assert.equal(crawlDuration(0.7), 0.7 / WORM_PACE);
  });

  it('comes out, crawls, and goes in without a jump, the head ahead and neither end slipping back', () => {
    for (const length of LENGTHS) {
      const body = Math.min(WORM_LENGTH, length);
      const duration = tripDuration(length);
      assert.equal(wormTrip(-STEP, length), undefined);
      let last = wormTrip(0, length);
      assert.ok(last);
      assert.equal(last.phase, 'out');
      assert.ok(Math.abs(last.head) < EPSILON);
      const phases: TripPhase[] = [last.phase];
      for (let elapsed = STEP; elapsed < duration; elapsed += STEP) {
        const now = wormTrip(elapsed, length);
        assert.ok(now, `${length} ${elapsed}`);
        const where = JSON.stringify({ length, elapsed, last, now });
        assert.ok(Math.abs(now.head - last.head) < 0.01, where);
        assert.ok(Math.abs(now.tail - last.tail) < 0.01, where);
        assert.ok(now.head >= last.head - EPSILON, where);
        assert.ok(now.tail >= last.tail - EPSILON, where);
        const stretch = now.head - now.tail;
        assert.ok(
          stretch <= body + EPSILON &&
            stretch >= body * (1 - INCH_SQUEEZE) - EPSILON,
        );
        if (phases.at(-1) !== now.phase) phases.push(now.phase);
        last = now;
      }
      assert.deepEqual(phases, ['out', 'crawl', 'in']);
      assert.ok(Math.abs(last.head - (length + body)) < 0.01);
      assert.equal(wormTrip(duration, length), undefined);
    }
  });

  it('inches about every `INCH_PERIOD`, its body drawing in and stretching out again', () => {
    const length = 0.9;
    const crawl = crawlDuration(length);
    const stretches: number[] = [];
    for (let elapsed = WORM_OUT; elapsed < WORM_OUT + crawl; elapsed += STEP) {
      const now = wormTrip(elapsed, length);
      assert.ok(now);
      stretches.push(now.head - now.tail);
    }
    const drawnIn = stretches.filter(
      (stretch, index) =>
        stretch < (stretches[index - 1] ?? Infinity) &&
        stretch < (stretches[index + 1] ?? Infinity),
    );
    assert.equal(drawnIn.length, Math.round(crawl / INCH_PERIOD));
    for (const stretch of drawnIn) {
      assert.ok(stretch < WORM_LENGTH * 0.7);
    }
  });
});

describe('wormPeek', () => {
  it('rises a body’s length out of its window, looks about, and goes back in', () => {
    assert.equal(wormPeek(-0.01), undefined);
    assert.equal(wormPeek(WORM_PEEK_DURATION), undefined);
    assert.equal(wormPeek(0)?.head, 0);
    const out = wormPeek(0.6);
    assert.ok(out);
    assert.ok(Math.abs(out.head - WORM_LENGTH) < EPSILON);
    assert.ok(Math.abs(out.tail) < EPSILON);
    const looks = new Set<number>();
    for (let elapsed = 0; elapsed < WORM_PEEK_DURATION; elapsed += 0.01) {
      const pose = wormPeek(elapsed);
      assert.ok(pose && Math.abs(pose.look) <= 1);
      assert.ok(Math.abs(pose.head - pose.tail - WORM_LENGTH) < EPSILON);
      looks.add(Math.sign(pose.look));
    }
    assert.ok(looks.has(-1) && looks.has(1));
    assert.ok((wormPeek(WORM_PEEK_DURATION - 0.01)?.head ?? 1) < 0.01);
  });

  it('draws its body in to a shorter peek', () => {
    const short = WORM_LENGTH / 2;
    const out = wormPeek(0.6, short);
    assert.ok(out);
    assert.ok(Math.abs(out.head - short) < EPSILON);
    assert.ok(Math.abs(out.tail) < EPSILON);
  });
});

describe('wormBody', () => {
  const path = [
    { x: -0.4, y: 0.1 },
    { x: 0, y: 0.3 },
    { x: 0.4, y: 0.1 },
  ];
  const length = pathLength(path);

  it('draws every segment on the way, the tail first, the head largest and foremost', () => {
    const { segments, head } = wormBody(path, { head: 0.5, tail: 0.38 });
    assert.equal(segments.length, WORM_SEGMENTS);
    assert.ok(head);
    assert.deepEqual(segments.at(-1), pick(head, 'x', 'y', 'r'));
    assert.equal(head.r, WORM_GIRTH / 2);
    for (let index = 1; index < segments.length; index++) {
      const [behind, ahead] = [segments[index - 1], segments[index]];
      assert.ok(behind && ahead && behind.r < ahead.r);
    }
    assert.ok(head.tangent < 0, 'past the crown, tangent down');
  });

  it('leaves out the segments still in either window', () => {
    /** How many of the segments spaced evenly from `head` back a body's length lie on the way. */
    const onTheWay = (head: number) =>
      Array.from(
        { length: WORM_SEGMENTS },
        (_, index) => head - (WORM_LENGTH * index) / (WORM_SEGMENTS - 1),
      ).filter((along) => along >= 0 && along <= length).length;
    assert.equal(
      wormBody(path, { head: 0, tail: -WORM_LENGTH }).segments.length,
      1,
    );
    const growing = wormBody(path, { head: 0.05, tail: 0.05 - WORM_LENGTH });
    assert.equal(growing.segments.length, onTheWay(0.05));
    assert.ok(growing.segments.length < WORM_SEGMENTS);
    assert.ok(growing.head);
    const going = wormBody(path, {
      head: length + 0.05,
      tail: length + 0.05 - WORM_LENGTH,
    });
    assert.equal(going.head, undefined);
    assert.equal(going.segments.length, onTheWay(length + 0.05));
    assert.ok(going.segments.length > 0);
  });

  it('swings sideways while it wriggles, and lies on the way after', () => {
    const pose = { head: 0.3, tail: 0.3 - WORM_LENGTH };
    const still = wormBody(path, pose);
    const swung = wormBody(path, pose, WORM_GIRTH, WRIGGLE_DURATION / 2 + 0.02);
    const after = wormBody(path, pose, WORM_GIRTH, WRIGGLE_DURATION);
    assert.deepEqual(after, still);
    assert.ok(
      swung.segments.some(
        (segment, index) =>
          Math.hypot(
            segment.x - (still.segments[index]?.x ?? 0),
            segment.y - (still.segments[index]?.y ?? 0),
          ) >
          WORM_GIRTH / 10,
      ),
    );
  });

  it('stays one body, each segment overlapping the next, stretched out and at every moment of a wriggle', () => {
    const poses = [
      { head: 0.3, tail: 0.3 - WORM_LENGTH },
      { head: 0.3, tail: 0.3 - WORM_LENGTH * (1 - INCH_SQUEEZE) },
    ];
    for (const pose of poses) {
      for (let since = 0; since <= WRIGGLE_DURATION; since += 0.002) {
        const { segments } = wormBody(path, pose, WORM_GIRTH, since);
        assert.equal(segments.length, WORM_SEGMENTS);
        for (let index = 1; index < segments.length; index++) {
          const [a, b] = [segments[index - 1], segments[index]];
          assert.ok(a && b);
          const gap = Math.hypot(b.x - a.x, b.y - a.y);
          assert.ok(
            gap < (a.r + b.r) * 0.95,
            JSON.stringify({ pose, since, index, gap, reach: a.r + b.r }),
          );
        }
      }
    }
  });
});
