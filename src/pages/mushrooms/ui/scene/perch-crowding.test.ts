import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { pick } from '@/shared/lib/collections';

import type { Crowding, Held } from '../../model/flight';
import type { Point } from '../../model/geometry';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';
import { mulberry32 } from '../../model/random';
import { pointCrowdings } from './perch-crowding';

type Apart = (first: InsectKind, second: InsectKind) => number;

/** Every two points asked in turn, each pairing tested by itself: what the sweep must find. */
function everyTwo(
  points: ReadonlyArray<Pick<Held, 'perch'> & Point>,
  apart: Apart,
): Crowding[] {
  const pairings = INSECT_KINDS.flatMap((first) =>
    INSECT_KINDS.map((second) => [first, second] as const),
  );
  return points.flatMap((here, index) =>
    points.slice(index + 1).flatMap((there): Crowding[] => {
      const between = Math.hypot(here.x - there.x, here.y - there.y);
      const short = pairings.filter((pair) => between < apart(...pair));
      return short.length > 0 ? [[here.perch, there.perch, short]] : [];
    }),
  );
}

/** `count` points scattered over a `width` by `height` screen, some on top of others. */
function scattered(seed: number, count: number, width: number, height: number) {
  const random = mulberry32(seed);
  const points = Array.from({ length: count }, (_, index) => ({
    perch: { kind: 'air', id: `air-${String(index)}` } as const,
    x: random() * width,
    y: random() * height,
  }));
  return points.map((point, index) => {
    const twin = points[index - 1];
    return index % 17 === 5 && twin
      ? { ...point, ...pick(twin, 'x', 'y') }
      : point;
  });
}

/** A need per pairing that is not symmetric, so the order of a pair's kinds counts. */
const SPANS: Record<InsectKind, number> = { butterfly: 73, fly: 45, bee: 47 };
const apartBySpan: Apart = (first, second) =>
  SPANS[first] * 0.6 + SPANS[second] * 0.4;

/** One need for every pairing. */
const apartEvenly: Apart = () => 45;

describe('pointCrowdings', () => {
  it('finds every two points asking it finds, with the same pairings, in the same order', () => {
    for (const [seed, count] of [
      [1, 0],
      [2, 1],
      [3, 40],
      [4, 650],
      [5, 1200],
    ] as const) {
      const points = scattered(seed, count, 1180, 600);
      assert.deepEqual(
        pointCrowdings(points, apartBySpan),
        everyTwo(points, apartBySpan),
        `seed ${String(seed)}, ${String(count)} points`,
      );
    }
  });

  it('counts two points exactly a need apart as clear of each other', () => {
    const points = [0, 45, 90].map((x, index) => ({
      perch: { kind: 'air', id: String(index) } as const,
      x,
      y: 0,
    }));
    assert.deepEqual(pointCrowdings(points, apartEvenly), []);
    assert.deepEqual(
      pointCrowdings(points, apartEvenly),
      everyTwo(points, apartEvenly),
    );
  });
});
