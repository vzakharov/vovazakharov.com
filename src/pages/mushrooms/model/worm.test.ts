import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import { containsPoint, type Point } from './geometry';
import { PANE, slotLevel, windowSlots } from './house';
import {
  type ChanterelleGenes,
  hasTrumpet,
  MUSHROOM_SPECIES,
  mushroomGenes,
} from './mushroom-genes';
import { headOutlines, MUSHROOM_INK } from './mushroom-outline';
import { capBase, capSurface } from './mushroom-profile';
import {
  crawlDuration,
  INCH_PERIOD,
  INCH_SQUEEZE,
  pathLength,
  PEEK_SPAN,
  peekPath,
  peekWindow,
  tripDuration,
  type TripPhase,
  tripSpan,
  tripWindows,
  WINDOW_SWING,
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
  wormClock,
  wormGirth,
  wormPath,
  wormPeek,
  wormTarget,
  wormTrip,
  WRIGGLE_DURATION,
} from './worm';

const SEEDS = Array.from({ length: 300 }, (_, index) => index * 2_654_435_761);
const everyMushroom = MUSHROOM_SPECIES.flatMap((species) =>
  SEEDS.map((seed) => mushroomGenes({ seed, species })),
);
const EPSILON = 1e-9;
/** How far apart along the row two of `slots` stand. */
const apart = (slots: readonly Point[], a: number, b: number) =>
  Math.abs((slots[a]?.x ?? 0) - (slots[b]?.x ?? 0));
/** How high a path climbs. */
const highest = (path: readonly Point[]) => Math.max(...path.map(({ y }) => y));
/** A dome with room for five windows. */
const fiveSlots = everyMushroom
  .map((genes) => windowSlots(genes))
  .find((slots) => slots.length === 5);

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

describe('wormTarget', () => {
  it('peeks from a lone window, and otherwise goes to the farthest one put in', () => {
    assert.ok(fiveSlots);
    for (let count = 1; count <= 5; count++) {
      for (let from = 0; from < count; from++) {
        for (const trips of [0, 1, 2, 3]) {
          const to = wormTarget(fiveSlots, count, from, trips);
          if (count === 1) {
            assert.equal(to, undefined);
            continue;
          }
          assert.ok(to !== undefined && to !== from && to < count);
          for (let other = 0; other < count; other++) {
            assert.ok(
              apart(fiveSlots, from, to) >=
                apart(fiveSlots, from, other) - EPSILON,
              `${count} ${from}`,
            );
          }
        }
      }
    }
  });

  it('goes from the middle to the left and the right in turn, and from one side to the far end', () => {
    assert.ok(fiveSlots);
    const side = (count: number, trips: number) =>
      Math.sign(fiveSlots[wormTarget(fiveSlots, count, 0, trips) ?? 0]?.x ?? 0);
    for (const count of [3, 5]) {
      assert.deepEqual(
        [0, 1, 2, 3].map((trips) => side(count, trips)),
        [-1, 1, -1, 1],
      );
    }
    assert.equal(wormTarget(fiveSlots, 5, 0, 0), 3);
    assert.equal(wormTarget(fiveSlots, 5, 1, 0), 4);
    assert.equal(wormTarget(fiveSlots, 5, 4, 1), 3);
    assert.equal(wormTarget(fiveSlots, 2, 1, 1), 0);
    assert.equal(wormTarget(fiveSlots, 4, 0, 1), 3);
  });
});

describe('wormPath', () => {
  it('runs from window to window over a dome’s face, its body inside the cap', () => {
    for (const genes of everyMushroom) {
      if (hasTrumpet(genes)) continue;
      const [dome] = headOutlines(genes);
      const slots = windowSlots(genes);
      for (const from of slots) {
        for (const to of slots) {
          if (from === to) continue;
          const path = wormPath(genes, from, to);
          assert.deepEqual(path[0], from);
          assert.deepEqual(path.at(-1), to);
          for (const { x, y } of path) {
            const where = JSON.stringify({ genes, from, to, x, y });
            assert.ok(y + WORM_GIRTH / 2 <= capSurface(genes, x), where);
            assert.ok(y - WORM_GIRTH / 2 >= capBase(genes, x), where);
            for (const point of [
              { x, y: y + WORM_GIRTH / 2 },
              { x, y: y - WORM_GIRTH / 2 },
            ]) {
              assert.ok(containsPoint(dome, point), where);
            }
          }
        }
      }
    }
  });

  it('climbs higher across the whole cap than to a neighbour', () => {
    for (const genes of everyMushroom) {
      if (hasTrumpet(genes)) continue;
      const [middle, left, right] = windowSlots(genes);
      assert.ok(middle && left && right);
      const across = highest(wormPath(genes, left, right));
      const next = highest(wormPath(genes, middle, right));
      assert.ok(across > next, JSON.stringify(genes));
      assert.ok(next > middle.y);
    }
  });

  it('follows a chanterelle’s row under its rim, a girth under it', () => {
    const chanterelles = everyMushroom.filter(
      (genes): genes is ChanterelleGenes => hasTrumpet(genes),
    );
    for (const genes of chanterelles) {
      const slot = (x: number) => ({ x, y: slotLevel(genes, x) });
      const path = wormPath(genes, slot(-PANE * 2), slot(PANE * 2));
      for (const { x, y } of path) {
        assert.ok(y >= slotLevel(genes, x) - EPSILON);
        assert.ok(y <= capBase(genes, x) - WORM_GIRTH + EPSILON);
      }
    }
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

  it('peeks straight up out of its window, a body’s length out of a dome', () => {
    for (const genes of everyMushroom) {
      if (genes.species !== 'fly-agaric' && genes.species !== 'porcini') {
        continue;
      }
      const [from] = windowSlots(genes);
      assert.ok(from);
      const peek = peekPath(genes, from);
      assert.ok(Math.abs(pathLength(peek) - WORM_LENGTH) < EPSILON);
      const { head } = wormBody(peek, { head: WORM_LENGTH, tail: 0 });
      assert.ok(head);
      assert.ok(Math.abs(head.tangent - Math.PI / 2) < EPSILON);
    }
  });

  it('peeks no higher than its cap: every segment’s top inside the cap and under its ink line', () => {
    for (const genes of everyMushroom) {
      const outlines = headOutlines(genes);
      for (const girth of [WORM_GIRTH, WORM_GIRTH * 2]) {
        for (const slot of windowSlots(genes)) {
          const peek = peekPath(genes, slot, girth);
          const travel = pathLength(peek);
          assert.ok(travel > 0 && travel <= WORM_LENGTH + EPSILON);
          const pose = wormPeek(0.6, travel);
          assert.ok(pose);
          const { segments } = wormBody(peek, pose, girth);
          assert.equal(segments.length, WORM_SEGMENTS);
          for (const { x, y, r } of segments) {
            const top = { x, y: y + r };
            const where = JSON.stringify({ genes, girth, slot, top });
            assert.ok(
              top.y <= capSurface(genes, x) - MUSHROOM_INK + EPSILON,
              where,
            );
            // A chanterelle's lip is rounded off its front rim and its funnel
            // is not, which leaves a sliver between them under the rim's ink.
            const onRim =
              hasTrumpet(genes) &&
              Math.abs(top.y - capBase(genes, x)) <= MUSHROOM_INK;
            assert.ok(
              onRim || outlines.some((outline) => containsPoint(outline, top)),
              where,
            );
          }
        }
      }
    }
  });

  it('keeps a peeking worm’s head whenever it is out, its look about included, out of every window', () => {
    for (const genes of everyMushroom) {
      for (const slot of windowSlots(genes)) {
        const peek = peekPath(genes, slot);
        const travel = pathLength(peek);
        for (let t = 0; t < WORM_PEEK_DURATION; t += 0.01) {
          const pose = wormPeek(t, travel);
          assert.ok(pose);
          if (pose.head <= EPSILON) continue;
          assert.ok(
            wormBody(peek, pose).head,
            JSON.stringify({ genes, slot, t }),
          );
        }
      }
    }
  });
});

describe('tripWindows and peekWindow', () => {
  /** Every trip a worm takes from a window to its target, on a few of every species. */
  const travels = everyMushroom
    .filter((_, index) => index % 15 === 0)
    .flatMap((genes) => {
      const slots = windowSlots(genes);
      return slots.flatMap((from, index) => {
        const to = slots[wormTarget(slots, slots.length, index, 0) ?? -1];
        return to ? [pathLength(wormPath(genes, from, to))] : [];
      });
    });
  const STEP = 0.005;

  it('opens the tapped window before the worm comes out, and keeps it open while any of it is in there', () => {
    assert.ok(travels.length > 0);
    for (const travel of travels) {
      assert.equal(tripWindows(0, travel).tapped, 0);
      assert.equal(wormTrip(wormClock(WINDOW_SWING * 0.99), travel), undefined);
      for (let t = WINDOW_SWING; t < tripSpan(travel); t += STEP) {
        const pose = wormTrip(wormClock(t), travel);
        if (pose && pose.tail <= 0) {
          assert.equal(
            tripWindows(t, travel).tapped,
            1,
            `${String(travel)} at ${String(t)}`,
          );
        }
      }
    }
  });

  it('has the other window open as the worm goes in, and shut while it is far', () => {
    for (const travel of travels) {
      let opened = false;
      for (let t = 0; t < tripSpan(travel); t += STEP) {
        const pose = wormTrip(wormClock(t), travel);
        const { reached: target } = tripWindows(t, travel);
        if (pose && pose.head >= travel) {
          assert.equal(target, 1, `${String(travel)} at ${String(t)}`);
          opened = true;
        }
        // Far: more than the swing at its fastest crawl short of the pane.
        if (pose && pose.head < travel - PANE - WORM_LENGTH) {
          assert.equal(target, 0, `${String(travel)} at ${String(t)}`);
        }
      }
      assert.ok(opened);
    }
  });

  it('shuts the tapped window once the worm is clear of it, and both once it is in', () => {
    for (const travel of travels) {
      const shut = tripWindows(tripSpan(travel), travel);
      assert.deepEqual(shut, { tapped: 0, reached: 0 });
      assert.equal(tripWindows(tripSpan(travel) + 1, travel).reached, 0);
      // A trip long enough that the tail is clear before the worm goes in.
      if (travel - WORM_LENGTH > PANE) {
        const crawled = WINDOW_SWING + WORM_OUT + crawlDuration(travel);
        assert.equal(tripWindows(crawled, travel).tapped, 0);
      }
      for (let t = -0.1; t < tripSpan(travel) + 0.1; t += STEP) {
        for (const open of Object.values(tripWindows(t, travel))) {
          assert.ok(open >= 0 && open <= 1);
        }
      }
    }
  });

  it('opens a lone window before the worm peeks, keeps it open while it is out, and shuts it after', () => {
    assert.equal(peekWindow(0), 0);
    assert.equal(peekWindow(WINDOW_SWING), 1);
    for (let t = 0; t < PEEK_SPAN; t += STEP) {
      const pose = wormPeek(wormClock(t));
      if (pose && pose.head > 0) assert.equal(peekWindow(t), 1);
    }
    assert.equal(peekWindow(PEEK_SPAN), 0);
    assert.equal(peekWindow(-1), 0);
  });
});
