/**
 * The worm a tap on a window calls out: which window it crawls to, the way
 * it takes over the cap, and where its body is on that way at each moment
 * since the tap. Lengths are in units of the mushroom's size, points in the
 * cap's own frame (`capFrame`'s, y up), times in seconds.
 */

import { type Circle, type Point, sample } from './geometry';
import { PANE, slotLevel } from './house';
import { lookAbout, outAndBack, smooth } from './motion';
import { hasTrumpet, type MushroomGenes } from './mushroom-genes';
import { MUSHROOM_INK } from './mushroom-outline';
import { capBase, capSurface } from './mushroom-profile';

/** How thick a worm is drawn: sized to its window, as a mouse is to its door. */
export const WORM_GIRTH = 0.35 * PANE;
/** The thinnest a worm is drawn, in screen pixels: what an eye on it still reads at. */
export const WORM_GIRTH_LEAST = 6;

/**
 * How thick a worm is on a mushroom drawn `size` px to its unit by a house
 * graphics `zoom` scales onto the screen, in that mushroom's units: its
 * window's share, or the least an eye reads on the screen.
 */
export function wormGirth(size: number, zoom: number): number {
  return Math.max(WORM_GIRTH, WORM_GIRTH_LEAST / (size * zoom));
}

/** From a worm's head to its tail, stretched out. */
export const WORM_LENGTH = 4.5 * WORM_GIRTH;
/** How many round segments a worm is drawn as, from its head to its tail: enough that each overlaps the next, stretched out and wriggling. */
export const WORM_SEGMENTS = 8;
/** The tail's segment's size, as a share of the head's. */
const TAIL_TAPER = 0.7;

/** How long a worm takes to come out of its window, and to go into the other. */
export const WORM_OUT = 0.25;
export const WORM_IN = 0.3;
/** How fast a worm crawls over the cap. */
export const WORM_PACE = 0.25;
/** The shortest and longest crawl, however near or far the other window. */
export const WORM_CRAWL = [1.4, 3.5] as const;
/** About how long one inch takes: the head going forward, then the tail catching up. */
export const INCH_PERIOD = 0.4;
/**
 * How much of its length a worm draws in at the middle of an inch: about an
 * inch's step on a trip across a dome at `WORM_PACE`, so the end that holds
 * all but stands still while the other moves.
 */
export const INCH_SQUEEZE = 0.4;

/** How near two windows' distances count as the same, against the sums that place the slots. */
const TIE = 1e-9;
/** How far past either end of its path a segment still counts as on it: a path's length rounds, a pose's ends are set to it exactly. */
const END_SLACK = 1e-9;

/** The highest a dome's arch climbs from the row toward the cap's top, on the longest trip. */
export const WORM_LIFT = 0.8;
/** How far a chanterelle's worm humps over its row. */
const RIM_HUMP = PANE / 2;
/** How many chords a trip's path is sampled with. */
const PATH_STEPS = 24;

/** A worm's peek out of a lone window: up, a look about, and back in. */
const PEEK_RISE = 0.18;
const PEEK_HOLD = 1;
const PEEK_DUCK = 0.3;
export const WORM_PEEK_DURATION = PEEK_RISE + PEEK_HOLD + PEEK_DUCK;

/** How long a tapped worm wriggles, and how far sideways, in girths. */
export const WRIGGLE_DURATION = 0.3;
const WRIGGLE_DEPTH = 0.2;
/** How many times a second a wriggle's wave sets off from the head. */
const WRIGGLE_RATE = 8;
/** How far behind its neighbour toward the head a segment swings, in radians of the wave. */
const WRIGGLE_LAG = Math.PI / 4;

/** Where a worm's head and tail are, as lengths along its path from the window it came out of. */
export type WormPose = { head: number; tail: number };
/** A trip's three parts: out of its window, over the cap, into the other. */
export type TripPhase = 'out' | 'crawl' | 'in';
export type WormTrip = WormPose & { phase: TripPhase };
/** The way a worm's head points, in radians from the cap's x axis. */
export type Running = { tangent: number };
export type WormBody = {
  /** The segments showing, outside both windows, in paint order: the tail first. */
  segments: Circle[];
  /** The head's segment, when it shows. */
  head: (Circle & Running) | undefined;
};

/**
 * The window a worm called out of `from` crawls to, of the first `count` of
 * `slots` (`windowSlots`, the windows put in): the farthest along the row,
 * and of two as far, the left on an even `trips` and the right on an odd —
 * so from the middle it goes either way in turn. `undefined` with no other
 * window: the worm peeks.
 */
export function wormTarget(
  slots: readonly Point[],
  count: number,
  from: number,
  trips: number,
): number | undefined {
  const start = slots[from];
  if (!start) return undefined;
  const others = slots
    .slice(0, count)
    .map((slot, index) => ({ index, far: Math.abs(slot.x - start.x), slot }))
    .filter(({ index }) => index !== from);
  const farthest = Math.max(...others.map(({ far }) => far));
  const tied = others
    .filter(({ far }) => far > farthest - TIE)
    .toSorted((a, b) => a.slot.x - b.slot.x);
  return (trips % 2 === 1 ? tied.at(-1) : tied[0])?.index;
}

/**
 * The way a worm takes from window `from` to window `to`, as a polyline from
 * one's middle to the other's. On a dome it arches over the face, rising
 * from the row toward the cap's top by `WORM_LIFT` at most, the farther the
 * higher, and keeping `girth` and an ink line under it; on a chanterelle it
 * follows the row under the rim, dipping with it, humped a little and kept
 * a girth under the rim.
 */
export function wormPath(
  genes: MushroomGenes,
  from: Point,
  to: Point,
  girth = WORM_GIRTH,
): Point[] {
  const lift = Math.min(WORM_LIFT, Math.abs(to.x - from.x) / genes.capWidth);
  const path = sample(0, 1, PATH_STEPS, (share) => {
    const x = from.x + (to.x - from.x) * share;
    const rise = Math.sin(Math.PI * share);
    if (hasTrumpet(genes)) {
      const y = slotLevel(genes, x) + rise * RIM_HUMP;
      return { x, y: Math.min(y, capBase(genes, x) - girth) };
    }
    const level = from.y + (to.y - from.y) * share;
    const ceiling = capSurface(genes, x) - girth - MUSHROOM_INK;
    const y = level + (ceiling - level) * rise * lift;
    return { x, y: Math.min(y, ceiling) };
  });
  // Each end at its window's middle, whatever the rim or the ceiling there.
  return [from, ...path.slice(1, -1), to];
}

/**
 * The straight way up out of a lone window that a peeking worm takes: a
 * body's length, or less where the cap's top comes lower (a russula's
 * hollow), so a head `girth` thick stays under its ink line.
 */
export function peekPath(
  genes: MushroomGenes,
  from: Point,
  girth = WORM_GIRTH,
): Point[] {
  const { x, y } = from;
  const room = capSurface(genes, x) - MUSHROOM_INK - girth / 2 - y;
  return [from, { x, y: y + Math.max(0, Math.min(WORM_LENGTH, room)) }];
}

/** How long a polyline is, end to end along it. */
export function pathLength(path: readonly Point[]): number {
  let length = 0;
  for (let index = 1; index < path.length; index++) {
    const [a, b] = [path[index - 1], path[index]];
    if (a && b) length += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return length;
}

/** How long the crawl of a trip `length` long takes, between the shortest and the longest. */
export function crawlDuration(length: number): number {
  const [least, most] = WORM_CRAWL;
  return Math.min(most, Math.max(least, length / WORM_PACE));
}

/** How long a whole trip `length` long takes, from the tap to the worm gone in. */
export function tripDuration(length: number): number {
  return WORM_OUT + crawlDuration(length) + WORM_IN;
}

/**
 * Where a worm is on a trip `length` long, `elapsed` after the tap: sliding
 * out of its window's middle a body's length, then inching over the cap —
 * the tail catching up, the head going forward, a whole number of inches
 * about `INCH_PERIOD` each — and sliding into the other's middle.
 * `undefined` before the tap and once it is in.
 */
export function wormTrip(
  elapsed: number,
  length: number,
): WormTrip | undefined {
  const body = Math.min(WORM_LENGTH, length);
  if (elapsed < 0 || elapsed >= tripDuration(length)) return undefined;
  if (elapsed < WORM_OUT) {
    const head = body * smooth(elapsed / WORM_OUT);
    return { phase: 'out', head, tail: head - body };
  }
  const crawl = crawlDuration(length);
  const into = elapsed - WORM_OUT;
  if (into < crawl) {
    const inches = Math.max(1, Math.round(crawl / INCH_PERIOD));
    const period = crawl / inches;
    const step = (length - body) / inches;
    // Never more than an inch's step, so the end that holds never slips back.
    const squeeze = Math.min(step, INCH_SQUEEZE * body);
    const inch = Math.min(inches - 1, Math.floor(into / period));
    const within = into / period - inch;
    const half = within < 0.5;
    const share = smooth(half ? within * 2 : within * 2 - 1);
    const [fast, slow] = [(step + squeeze) / 2, (step - squeeze) / 2];
    const tail = step * inch + (half ? share * fast : fast + share * slow);
    const head =
      body + step * inch + (half ? share * slow : slow + share * fast);
    return { phase: 'crawl', head, tail };
  }
  const tail = length - body + body * smooth((into - crawl) / WORM_IN);
  return { phase: 'in', head: tail + body, tail };
}

/**
 * A worm peeking out of a lone window, `elapsed` after the tap, along a
 * `peekPath` `length` long, its body drawn in to that length: up, a look
 * about (`look`, from -1 left to 1 right), and back in — the mouse's own
 * peek. `undefined` before the tap and once it is in.
 */
export function wormPeek(
  elapsed: number,
  length = WORM_LENGTH,
  phase = 0,
): (WormPose & { look: number }) | undefined {
  if (elapsed < 0 || elapsed >= WORM_PEEK_DURATION) return undefined;
  const head = length * outAndBack(elapsed, PEEK_RISE, PEEK_HOLD, PEEK_DUCK);
  return { head, tail: head - length, look: lookAbout(elapsed, phase) };
}

/**
 * How far sideways segment `index` (0 the head) of a worm tapped `elapsed`
 * before swings, in girths: a wave running from the head to the tail, each
 * segment a little behind the one before so the body bends rather than
 * coming apart. 0 outside `WRIGGLE_DURATION`.
 */
function wriggle(elapsed: number, index: number): number {
  if (!(elapsed >= 0 && elapsed < WRIGGLE_DURATION)) return 0;
  return (
    WRIGGLE_DEPTH *
    Math.sin((Math.PI * elapsed) / WRIGGLE_DURATION) *
    Math.sin(Math.PI * 2 * WRIGGLE_RATE * elapsed - WRIGGLE_LAG * index)
  );
}

/** The point `along` the polyline `path` from its start, and the way it runs there. */
function pointAlong(path: readonly Point[], along: number): Point & Running {
  let left = along;
  for (let index = 1; index < path.length; index++) {
    const [a, b] = [path[index - 1], path[index]];
    if (!a || !b) continue;
    const chord = Math.hypot(b.x - a.x, b.y - a.y);
    const tangent = Math.atan2(b.y - a.y, b.x - a.x);
    if (left <= chord || index === path.length - 1) {
      const share = chord > 0 ? Math.min(1, left / chord) : 0;
      return {
        x: a.x + (b.x - a.x) * share,
        y: a.y + (b.y - a.y) * share,
        tangent,
      };
    }
    left -= chord;
  }
  const [only = { x: 0, y: 0 }] = path;
  return { ...only, tangent: 0 };
}

/**
 * The worm's body at `pose` on `path`: `WORM_SEGMENTS` circles spaced evenly
 * from its head to its tail, the head `girth` across and the rest tapering —
 * those still behind either window's middle left out, so the worm grows out
 * of one pane and sinks into the other. A worm tapped `sinceWriggle` before
 * swings its segments sideways in a wave.
 */
export function wormBody(
  path: readonly Point[],
  { head, tail }: WormPose,
  girth = WORM_GIRTH,
  sinceWriggle = Number.POSITIVE_INFINITY,
): WormBody {
  const length = pathLength(path);
  const last = WORM_SEGMENTS - 1;
  const segments: Circle[] = [];
  let shownHead: WormBody['head'];
  for (let index = last; index >= 0; index--) {
    const along = head - ((head - tail) * index) / last;
    if (along < -END_SLACK || along > length + END_SLACK) continue;
    const { x, y, tangent } = pointAlong(
      path,
      Math.min(length, Math.max(0, along)),
    );
    const aside = wriggle(sinceWriggle, index) * girth;
    const segment = {
      x: x - Math.sin(tangent) * aside,
      y: y + Math.cos(tangent) * aside,
      r: (girth / 2) * (1 - ((1 - TAIL_TAPER) * index) / last),
    };
    segments.push(segment);
    if (index === 0) shownHead = { ...segment, tangent };
  }
  return { segments, head: shownHead };
}
