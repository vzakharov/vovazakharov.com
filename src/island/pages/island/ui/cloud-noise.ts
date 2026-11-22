import {
  dot,
  float,
  Fn,
  max,
  min,
  mix,
  smoothstep,
  sqrt,
  vec3,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R } from '@/island/shared/globe';

export type F = Node<'float'>;
export type V = Node<'vec3'>;

/** A pixel's width as a share of its distance, on a screen a thousand pixels across. */
const PIXEL = 1.2e-3;
/** Pixels a wave must span to be told as a shape, and those under which it is grain. */
const TOLD_OVER = 14;
const GRAIN_UNDER = 5;

/**
 * How much of a wave `metres` long an eye `away` metres off tells apart: all
 * of it while it spans `TOLD_OVER` pixels, none once it is under
 * `GRAIN_UNDER`, where it would draw as grain.
 */
export const toldAt = (metres: number, away: F): F =>
  smoothstep(
    metres / (TOLD_OVER * PIXEL),
    metres / (GRAIN_UNDER * PIXEL),
    away,
  ).oneMinus();

/** The distance past which `toldAt` tells nothing of a wave `metres` long. */
export const seenTo = (metres: number): number =>
  metres / (GRAIN_UNDER * PIXEL);

/** `toldAt` for a wave `waves` of which go round the sphere. */
export const toldFrom = (waves: number, away: F): F => toldAt(R / waves, away);

/** The cells either side of a place's own, along one axis. */
const NEIGHBOURS = [-1, 0, 1] as const;

/** A lattice point's value, 0 to 1. */
export const latticeValue = Fn(([point]: [V]) => {
  const folded = point.mul(0.1031).fract().toVar();
  folded.addAssign(dot(folded, folded.zyx.add(31.32)));
  return folded.x.add(folded.y).mul(folded.z).fract();
});

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
  const folded = cell
    .mul(vec3(0.1031, 0.103, 0.0973))
    .fract()
    .toVar();
  folded.addAssign(dot(folded, folded.yxz.add(33.33)));
  return folded.xxy.add(folded.yxx).mul(folded.zyx).fract();
});

const cellEdge = Fn(([at]: [V]) => {
  const cell = at.floor().toVar();
  const within = at.sub(cell).toVar();
  const nearest = float(9).toVar();
  const second = float(9).toVar();
  for (const x of NEIGHBOURS)
    for (const y of NEIGHBOURS)
      for (const z of NEIGHBOURS) {
        const offset = vec3(x, y, z);
        const toPoint = offset.add(latticePoint(cell.add(offset))).sub(within);
        const apart = dot(toPoint, toPoint).toVar();
        second.assign(min(second, max(nearest, apart)));
        nearest.assign(min(nearest, apart));
      }
  return sqrt(second).sub(sqrt(nearest));
});

/**
 * How far `at` is from the edge of its cell, 0 on the edge: the cells are
 * those of points scattered one to a unit, each cell the places nearest its
 * point, so they pack like the cells of a cloud deck.
 */
export const edgeOf = (at: V): F => cellEdge(at);
