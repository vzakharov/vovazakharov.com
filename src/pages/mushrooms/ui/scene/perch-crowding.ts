/**
 * Which two perches stand too close for an insect on each (`Crowding` in
 * `model/flight.ts`), measured along the tracks their seats run on, for
 * every two kinds.
 */

import type { Crowding, Held, Pairing, Perch } from '../../model/flight';
import {
  boxAround,
  type Circle,
  distanceToSegment,
  type Point,
} from '../../model/geometry';
import { INSECT_KINDS, type InsectKind } from '../../model/insect-genes';

/** Every two kinds, the first on one perch and the second on another. */
const PAIRINGS: readonly Pairing[] = INSECT_KINDS.flatMap((first) =>
  INSECT_KINDS.map((second) => [first, second] as const),
);

/**
 * Every place an insect's spot may seat it on a perch, as a line through
 * them: straight across a flower's head, curving over a cap's dome, and a
 * single point at a spot in the air.
 */
export type Track = readonly Point[];

type Segment = readonly [Point, Point];

function segmentsOf(track: Track): Segment[] {
  return track.flatMap((point, index) => {
    const next = track[index + 1];
    if (next) return [[point, next] as const];
    return track.length === 1 ? [[point, point] as const] : [];
  });
}

/** Which side of the line through `a` and `b` the point `c` lies, by sign. */
const sideOf = (a: Point, b: Point, c: Point) =>
  Math.sign((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));

function segmentsApart([a, b]: Segment, [c, d]: Segment): number {
  const crossing =
    sideOf(a, b, c) * sideOf(a, b, d) < 0 &&
    sideOf(c, d, a) * sideOf(c, d, b) < 0;
  if (crossing) return 0;
  return Math.min(
    distanceToSegment(c, d, a),
    distanceToSegment(c, d, b),
    distanceToSegment(a, b, c),
    distanceToSegment(a, b, d),
  );
}

/** The nearest two seats on tracks drawn through `here` and `there` come to each other. */
function tracksApart(
  here: readonly Segment[],
  there: readonly Segment[],
): number {
  let nearest = Infinity;
  for (const segment of here) {
    for (const other of there) {
      nearest = Math.min(nearest, segmentsApart(segment, other));
    }
  }
  return nearest;
}

/**
 * A perch, where an insect of each kind may sit on it, and a circle around
 * every such seat, so two perches far apart are passed over at a glance.
 */
export type Seats = Pick<Held, 'perch'> & {
  tracks: Record<InsectKind, readonly Segment[]>;
  around: Circle;
};

export function seatsWith(
  perch: Perch,
  tracks: Record<InsectKind, Track>,
): Seats {
  const points = INSECT_KINDS.flatMap((kind) => tracks[kind]);
  const box = boxAround(points);
  const centre = {
    x: (box.left + box.right) / 2,
    y: (box.top + box.bottom) / 2,
  };
  const r = Math.max(
    ...points.map(({ x, y }) => Math.hypot(x - centre.x, y - centre.y)),
  );
  // Kinds seated on one track share its segments, which `crowdings` then
  // measures once.
  const cut = new Map<Track, readonly Segment[]>();
  const along = (kind: InsectKind) => {
    const segments = cut.get(tracks[kind]) ?? segmentsOf(tracks[kind]);
    cut.set(tracks[kind], segments);
    return segments;
  };
  const segments = {
    butterfly: along('butterfly'),
    fly: along('fly'),
    bee: along('bee'),
  };
  return { perch, tracks: segments, around: { ...centre, r } };
}

/** How far apart two perches' tracks come, as `tracksApart` measured them. */
type Measured = {
  here: readonly Segment[];
  there: readonly Segment[];
  apart: number;
};

/** `tracksApart` of `here` and `there`, measured once however many kinds share the two tracks. */
function apartOnce(
  measured: Measured[],
  here: readonly Segment[],
  there: readonly Segment[],
): number {
  const known = measured.find(
    (each) => each.here === here && each.there === there,
  );
  if (known) return known.apart;
  const apart = tracksApart(here, there);
  measured.push({ here, there, apart });
  return apart;
}

/**
 * Every two of `seated` on which an insect of one kind of a pairing on the
 * first and one of the other on the second could come nearer than `apart`
 * says for those two kinds, wherever their spots put them.
 */
export function crowdings(
  seated: readonly Seats[],
  apart: (first: InsectKind, second: InsectKind) => number,
): Crowding[] {
  const needs = PAIRINGS.map((pairing) => ({
    pairing,
    need: apart(...pairing),
  }));
  const farthest = Math.max(...needs.map(({ need }) => need));
  const found: Crowding[] = [];
  for (let index = 0; index < seated.length; index++) {
    const here = seated[index];
    if (!here) continue;
    for (let next = index + 1; next < seated.length; next++) {
      const there = seated[next];
      if (!there) continue;
      // Circles this far apart hold no two seats near enough, whatever the
      // kinds; measured squared, as it is asked of every two perches.
      const [dx, dy] = [
        here.around.x - there.around.x,
        here.around.y - there.around.y,
      ];
      const reach = farthest + here.around.r + there.around.r;
      if (dx * dx + dy * dy > reach * reach * (1 + 1e-9)) continue;
      const measured: Measured[] = [];
      const pairings = needs
        .filter(
          ({ pairing: [first, second], need }) =>
            apartOnce(measured, here.tracks[first], there.tracks[second]) <
            need,
        )
        .map(({ pairing }) => pairing);
      if (pairings.length > 0) found.push([here.perch, there.perch, pairings]);
    }
  }
  return found;
}

/**
 * `crowdings` of perches that are each a single point, as the spots in the
 * air are, by the distance between each two: the same pairs, found without
 * the tracks' geometry, since the air holds the most perches.
 */
export function pointCrowdings(
  points: ReadonlyArray<Pick<Held, 'perch'> & Point>,
  apart: (first: InsectKind, second: InsectKind) => number,
): Crowding[] {
  const needs = PAIRINGS.map((pairing) => ({
    pairing,
    need: apart(...pairing),
  }));
  const farthest = Math.max(...needs.map(({ need }) => need));
  const found: Crowding[] = [];
  for (let index = 0; index < points.length; index++) {
    const here = points[index];
    if (!here) continue;
    for (let next = index + 1; next < points.length; next++) {
      const there = points[next];
      if (!there) continue;
      const [dx, dy] = [here.x - there.x, here.y - there.y];
      if (dx * dx + dy * dy > farthest * farthest * (1 + 1e-9)) continue;
      const between = Math.hypot(dx, dy);
      const pairings = needs
        .filter(({ need }) => between < need)
        .map(({ pairing }) => pairing);
      if (pairings.length > 0) found.push([here.perch, there.perch, pairings]);
    }
  }
  return found;
}
