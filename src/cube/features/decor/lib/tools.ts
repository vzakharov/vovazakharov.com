import { ROOM_METRES } from '@/cube/shared/lib/room-shape';
import type { Surface } from '@/cube/shared/lib/surface';
import {
  box,
  face,
  type Quad,
  type Room,
  type Vec3,
} from '@/cube/entities/world';

/** A flat four-cornered piece, counter-clockwise seen from its face, in metres. */
type Sheet = readonly [Vec3, Vec3, Vec3, Vec3];

/** A box's three edges from one corner, right-handed: `(p × q) · r > 0`. */
type Edges = readonly [Vec3, Vec3, Vec3];

/** How a prism departs from a plain capped octagonal one. */
type PrismShape = {
  /** How many sides it has, an even number. */
  sides?: number;
  /** Its radius at the far end, where it tapers. */
  top?: number;
  /** The far end's paint where it differs from the sides'; null leaves it open. */
  lid?: number | null;
};

const plus = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax + bx,
  ay + by,
  az + bz,
];

const minus = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ax - bx,
  ay - by,
  az - bz,
];

const scaled = ([x, y, z]: Vec3, by: number): Vec3 => [x * by, y * by, z * by];

const cross = ([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 => [
  ay * bz - az * by,
  az * bx - ax * bz,
  ax * by - ay * bx,
];

const unit = (v: Vec3): Vec3 => scaled(v, 1 / Math.hypot(...v));

const inRoom = (metres: Vec3): Vec3 => scaled(metres, 1 / ROOM_METRES);

const UP: Vec3 = [0, 1, 0];

/**
 * An upright prism's sides and far end. Its sides are flat towards each
 * axis, so something stuck on its front lies `radius · cos(π / sides)` out.
 */
function prismSheets(
  [cx, y, cz]: Vec3,
  radius: number,
  height: number,
  { sides = 8, top = radius }: PrismShape,
): { around: Sheet[]; end: Sheet[] } {
  const ring = (r: number, at: number): Vec3[] =>
    Array.from({ length: sides }, (_, k) => {
      const angle = ((k + 0.5) * 2 * Math.PI) / sides;
      return [cx + r * Math.sin(angle), at, cz + r * Math.cos(angle)];
    });
  const low = ring(radius, y);
  const high = ring(top, y + height);
  const of = (points: readonly Vec3[], k: number): Vec3 =>
    points[k % sides] ?? [cx, y, cz];
  return {
    around: low.map((from, k) => [
      from,
      of(low, k + 1),
      of(high, k + 1),
      of(high, k),
    ]),
    end: Array.from({ length: sides / 2 - 1 }, (_, k) => [
      of(high, k),
      of(high, k + 1),
      of(high, sides - 2 - k),
      of(high, sides - 1 - k),
    ]),
  };
}

const onBack = ([x, y, z]: Vec3): Vec3 => [x, -z, y];

/** Lays an upright shape on its back: what rose along y now comes out along z. */
const laid = (sheets: readonly Sheet[]): Sheet[] =>
  sheets.map(([a, b, c, d]) => [onBack(a), onBack(b), onBack(c), onBack(d)]);

/**
 * What a thing is built with, in `room`. A thing is built in metres in its
 * own frame — x across the wall it backs onto, 0 at its middle; y up from the
 * floor; z out from the wall, 0 at its back — and the room's frame is five
 * metres a side.
 */
export function toolsFor(room: Room) {
  const made = (
    sheets: readonly Sheet[],
    surface: Surface,
    paint?: number,
  ): Quad[] =>
    sheets.map(([a, b, c, d]) => ({
      corners: [inRoom(a), inRoom(b), inRoom(c), inRoom(d)],
      normal: unit(cross(minus(b, a), minus(d, a))),
      room,
      surface,
      ...(paint === undefined ? {} : { paint }),
    }));

  /** The box from `corner` along `edges`, which need not be square to each other. */
  const slab = (
    corner: Vec3,
    [p, q, r]: Edges,
    surface: Surface,
    paint?: number,
  ): Quad[] =>
    box(
      inRoom(corner),
      [inRoom(p), inRoom(q), inRoom(r)],
      room,
      surface,
      paint,
    );

  const prismOf = (
    turned: (sheets: readonly Sheet[]) => readonly Sheet[],
    base: Vec3,
    radius: number,
    height: number,
    surface: Surface,
    paint: number | undefined,
    shape: PrismShape,
  ): Quad[] => {
    const { around, end } = prismSheets(base, radius, height, shape);
    return [
      ...made(turned(around), surface, paint),
      ...(shape.lid === null
        ? []
        : made(turned(end), surface, shape.lid ?? paint)),
    ];
  };

  return {
    /** One face from `corner` along `a` then `b`, seen from where `a × b` points. */
    panel: (
      corner: Vec3,
      a: Vec3,
      b: Vec3,
      surface: Surface,
      paint?: number,
    ): Quad[] => [
      face(inRoom(corner), inRoom(a), inRoom(b), room, surface, paint),
    ],

    slab,

    /** The upright box `[wide, tall, deep]`, its back's foot middle at `at`. */
    block: (
      [x, y, z]: Vec3,
      [wide, tall, deep]: Vec3,
      surface: Surface,
      paint?: number,
    ): Quad[] =>
      slab(
        [x - wide / 2, y, z],
        [
          [wide, 0, 0],
          [0, tall, 0],
          [0, 0, deep],
        ],
        surface,
        paint,
      ),

    /** A square bar `thick` through, from `from` to `to`. */
    beam: (
      from: Vec3,
      to: Vec3,
      thick: number,
      surface: Surface,
      paint?: number,
    ): Quad[] => {
      const along = minus(to, from);
      const flat = cross(UP, along);
      const p = Math.hypot(...flat) < 1e-9 ? ([1, 0, 0] as const) : unit(flat);
      const q = cross(unit(along), p);
      const corner = minus(from, scaled(plus(p, q), thick / 2));
      return slab(
        corner,
        [scaled(p, thick), scaled(q, thick), along],
        surface,
        paint,
      );
    },

    /** An upright prism rising `height` from `base`, the middle of its foot. */
    prism: (
      base: Vec3,
      radius: number,
      height: number,
      surface: Surface,
      paint?: number,
      shape: PrismShape = {},
    ): Quad[] =>
      prismOf((sheets) => sheets, base, radius, height, surface, paint, shape),

    /** A prism on its back: its round face at `[x, y]`, coming `depth` out from `z`. */
    disc: (
      [x, y, z]: Vec3,
      radius: number,
      depth: number,
      surface: Surface,
      paint?: number,
      shape: PrismShape = {},
    ): Quad[] =>
      prismOf(laid, [x, z, -y], radius, depth, surface, paint, shape),
  };
}

export type Tools = ReturnType<typeof toolsFor>;

/** A draw on [0, 1) for each number asked, the same for the same number. */
export type Vary = (k: number) => number;

/** `vary`'s draw `k` as one of `options`. */
export const oneOf = <T>(options: readonly [T, ...T[]], at: number): T =>
  options[Math.floor(at * options.length)] ?? options[0];

/**
 * How a thing is made and stood: flush to a wall unless it has a `gap`,
 * square to it unless it has a `turn`.
 */
export type Recipe = {
  build: (tools: Tools, vary: Vary) => Quad[];
  /** How far its back may stand from the wall, in metres: least and most. */
  gap?: readonly [number, number];
  /** How far it may be turned either way, in radians. */
  turn?: number;
  /** Whether it goes to a corner where the room has one free. */
  cornered?: boolean;
};
