import {
  dot,
  float,
  Fn,
  max,
  min,
  mix,
  select,
  smoothstep,
  sqrt,
  vec3,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R, turnAbout } from '@/island/shared/globe';

import { latticeValue, worldCell } from './lattice-value';

export type F = Node<'float'>;
export type V = Node<'vec3'>;

/** A pixel's width as a share of its distance, on a screen a thousand pixels across. */
const PIXEL = 1.2e-3;
/** Pixels a wave must span to be told as a shape, and those under which it is grain. */
const TOLD_OVER = 14;
const GRAIN_UNDER = 5;

/** The distance past which `toldAt` tells nothing of a wave `metres` long. */
export const seenTo = (metres: number): number =>
  metres / (GRAIN_UNDER * PIXEL);

/**
 * How much of a wave `metres` long an eye `away` metres off tells apart: all
 * of it while it spans `TOLD_OVER` pixels, none once it is under
 * `GRAIN_UNDER`, where it would draw as grain.
 */
const toldAt = (metres: number, away: F): F =>
  smoothstep(metres / (TOLD_OVER * PIXEL), seenTo(metres), away).oneMinus();

/** `toldAt` for a wave `waves` of which go round the sphere. */
export const toldFrom = (waves: number, away: F): F => toldAt(R / waves, away);

/** A place's own cell and the next one, along one axis. */
const NEIGHBOURS = [0, 1] as const;
/** The share of its cell, about the middle, a cell's point lies in: under the whole, so the eight cells searched hold the two nearest points. */
const SCATTER = 0.7;
const UNSCATTERED = (1 - SCATTER) / 2;

const valueNoise = Fn(([at]: [V]) => {
  const cell = at.floor().toVar();
  const within = at.sub(cell).toVar();
  const eased = within.mul(within).mul(within.mul(-2).add(3)).toVar();
  const corner = (x: number, y: number, z: number) =>
    latticeValue(cell.add(vec3(x, y, z)));
  const edge = (y: number, z: number) =>
    mix(corner(0, y, z), corner(1, y, z), eased.x);
  const face = (z: number) => mix(edge(0, z), edge(1, z), eased.y);
  return mix(face(0), face(1), eased.z).mul(2).sub(1);
});

/** Value noise over `at`, -1 to 1, a wave a unit. */
export const noise = (at: V): F => valueNoise(at);

/** A lattice cell's own point within it, each coordinate 0 to 1. */
const latticePoint = Fn(([cell]: [V]) => {
  const folded = worldCell(cell)
    .mul(vec3(0.1031, 0.103, 0.0973))
    .fract()
    .toVar();
  folded.addAssign(dot(folded, folded.yxz.add(33.33)));
  return folded.xxy.add(folded.yxx).mul(folded.zyx).fract();
});

/** The nearest of the scattered points to `at`: how far it and the next nearest are, and a number of its own, 0 to 1. */
const nearPoints = Fn(([at]: [V]) => {
  const cell = at.floor().toVar();
  const within = at.sub(cell).toVar();
  // The nearest points lie in the place's own cell and the seven on its side of it.
  const toward = within.sub(0.5).sign().toVar();
  const nearest = float(9).toVar();
  const second = float(9).toVar();
  const own = float(0).toVar();
  for (const x of NEIGHBOURS)
    for (const y of NEIGHBOURS)
      for (const z of NEIGHBOURS) {
        const offset = vec3(x, y, z).mul(toward).toVar();
        const point = latticePoint(cell.add(offset)).toVar();
        const toPoint = offset
          .add(point.mul(SCATTER).add(UNSCATTERED))
          .sub(within);
        const apart = dot(toPoint, toPoint).toVar();
        second.assign(min(second, max(nearest, apart)));
        own.assign(
          select(
            apart.lessThan(nearest),
            point.x.mul(7.3).add(point.y.mul(3.1)).fract(),
            own,
          ),
        );
        nearest.assign(min(nearest, apart));
      }
  return vec3(sqrt(nearest), sqrt(second), own);
});

/**
 * How far `at` is from the edge of its cell, 0 on the edge: the cells are
 * those of points scattered one to a unit, each cell the places nearest its
 * point, so they pack like the cells of a cloud deck.
 */
export const edgeOf = (at: V): F => {
  const near = nearPoints(at);
  return near.y.sub(near.x);
};

/** The radius of the smallest puff and of the largest, in cells. */
const PUFF_RADII = [0.12, 0.7] as const;
/** How steeply a puff rises from its rim, and how far under zero the clear air between puffs lies. */
const PUFF_RISE = 1.6;
const PUFF_FLOOR = -0.7;

/**
 * Round puffs over `at`, one to a unit and each its own size, -1 to 1 and
 * over zero inside a puff: a field of separate heaps with clear air between,
 * showing no lattice.
 */
export const puffs = (at: V): F => {
  const near = nearPoints(at);
  const [least, most] = PUFF_RADII;
  return mix(least, most, near.z)
    .sub(near.x)
    .mul(PUFF_RISE)
    .clamp(PUFF_FLOOR, 1);
};

/** A turn of the sphere for each cumulus scale, no axis of one along an axis of another: rows of a rotation. */
const TURNS = [0, 1, 2, 3, 4].map((index) =>
  turnAbout([1 + index, 2, 3 - index * 0.4], 0.7 + index * 1.13),
);

/** `at` on the axes of cumulus scale `index`. */
export const turnedTo = (at: V, index: number): V => {
  const rows = TURNS[index % TURNS.length];
  if (rows === undefined) return at;
  const [a, b, c] = rows;
  return vec3(dot(at, vec3(...a)), dot(at, vec3(...b)), dot(at, vec3(...c)));
};
