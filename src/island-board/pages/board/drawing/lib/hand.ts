/**
 * The hand-drawn look: every irregularity is a pure function of an item's id,
 * so a sticky keeps its tilt and a line its bend across renders, reloads and
 * viewers, and nothing about the look is stored.
 */
import type { WithId } from '@/kernel/shared/typings';

import type { Point } from '@/scene/shared/lib/plane';

import type { PlacedItem, Spiralled } from '@/island-board/entities/item';

/**
 * A stable number in [-1, 1) from `id` and `salt`: FNV-1a, then murmur3's
 * finalizer, without which ids differing only in their last character
 * (`star-1`, `star-2`) land close together and every sticky tilts alike.
 */
export function jitter(id: string, salt = ''): number {
  let hash = 0x81_1c_9d_c5;
  for (const char of `${salt}:${id}`) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01_00_01_93);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85_eb_ca_6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2_b2_ae_35);
  hash ^= hash >>> 16;
  return ((hash >>> 0) / 2 ** 32) * 2 - 1;
}

/** Degrees at most, per kind: paper tilts freely, a zone less, a heading not at all. */
const MAX_TILT = {
  sticky: 2.6,
  image: 2,
  zone: 1.2,
  text: 0,
} as const satisfies Record<PlacedItem['kind'], number>;

export function tiltOf(id: string, kind: PlacedItem['kind']): number {
  // `+ 0` turns the -0 a straight heading's product can give into 0.
  return Math.round(jitter(id, 'tilt') * MAX_TILT[kind] * 100) / 100 + 0;
}

export type Stroke = {
  /** An SVG path from `a` to `b`. */
  d: string;
  /** The curve's point halfway along, where a label sits. */
  mid: Point;
};

const round = (n: number): number => Math.round(n * 10) / 10;

/** What of a line shapes its stroke: its id seeds the wobble, `spiral` the turn. */
export type Bent = WithId & Spiralled;

/**
 * Where along the chord each control point sits, and how far it bows as a
 * share of the line's bow. A plain line bows both alike, to the side its id
 * picks; a spiral bows the second far more than the first, so the curve leaves
 * its start nearly straight and tightens toward the end, a clockwise one
 * bulging to its left (the y axis points down) so that it turns right.
 */
const PLAIN = { at: [0.3, 0.7], share: [1, 1] } as const;
const SPIRAL = { at: [0.3, 0.78], share: [0.45, 1.15] } as const;

/**
 * A line from `a` to `b` as a hand would draw it: a cubic bowed to one side,
 * its two control points bowed by different amounts so the curve is never a
 * clean arc. `pass` 1 is a second, fainter stroke beside the first, as a
 * pencil going over a line twice leaves.
 */
export function handStroke(a: Point, b: Point, line: Bent, pass = 0): Stroke {
  const { id, spiral } = line;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return { d: `M${a.x},${a.y}`, mid: a };
  const normal = { x: -dy / length, y: dx / length };
  const randomSide = jitter(id, 'side') < 0 ? -1 : 1;
  const side = spiral === 'cw' ? -1 : randomSide;
  const { at, share } = spiral === undefined ? PLAIN : SPIRAL;
  const bow = Math.min(length * 0.16, 90) * side;
  const slip = pass * 4;
  const bend1 =
    bow * share[0] * (0.7 + 0.5 * Math.abs(jitter(id, 'b1'))) + slip;
  const bend2 =
    bow * share[1] * (0.7 + 0.5 * Math.abs(jitter(id, 'b2'))) + slip / 2;
  const c1 = {
    x: a.x + dx * at[0] + normal.x * bend1,
    y: a.y + dy * at[0] + normal.y * bend1,
  };
  const c2 = {
    x: a.x + dx * at[1] + normal.x * bend2,
    y: a.y + dy * at[1] + normal.y * bend2,
  };
  const mid = {
    x: round((a.x + 3 * c1.x + 3 * c2.x + b.x) / 8),
    y: round((a.y + 3 * c1.y + 3 * c2.y + b.y) / 8),
  };
  const p = (point: Point): string => `${round(point.x)},${round(point.y)}`;
  return { d: `M${p(a)} C${p(c1)} ${p(c2)} ${p(b)}`, mid };
}
