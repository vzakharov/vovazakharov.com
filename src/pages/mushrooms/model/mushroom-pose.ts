/**
 * Where a mushroom's parts stand, in units of its size with the foot at the
 * origin and y up. The painter and the layout both read it, so what the
 * layout keeps inside the screen is what gets painted.
 */

import type { Point } from './geometry';
import { domeHeight, GENE_RANGES, type MushroomGenes } from './mushroom-genes';

/** How far along the stem its bend's control point sits. */
const BEND_FROM = 0.55;
/** How much of the stem's turn at the top the cap follows. */
const CAP_FOLLOW = 0.45;
const RIM_SAMPLES = 41;

type Posed = Pick<
  MushroomGenes,
  'stemHeight' | 'stemBend' | 'capWidth' | 'capHeight' | 'domePower' | 'capTilt'
>;

/** A point on the stem's centreline and its tilt there, `t` from foot to top. */
export type StemStation = Point & { tilt: number };

/**
 * Turns `point` about the origin by `angle`, a positive angle moving whatever
 * is above the origin toward +x — the sense a canvas rotation has once y is
 * flipped down.
 */
function turn({ x, y }: Point, angle: number): Point {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return { x: x * cos + y * sin, y: -x * sin + y * cos };
}

/**
 * The centreline is a quadratic curve that leaves the foot upright and ends
 * `stemBend` of its height to the side.
 */
export function stemAt(genes: Posed, t: number): StemStation {
  const height = genes.stemHeight;
  const control = { x: 0, y: height * BEND_FROM };
  const end = { x: genes.stemBend * height, y: height };
  const x = 2 * (1 - t) * t * control.x + t * t * end.x;
  const y = 2 * (1 - t) * t * control.y + t * t * end.y;
  const dx = 2 * (1 - t) * control.x + 2 * t * (end.x - control.x);
  const dy = 2 * (1 - t) * control.y + 2 * t * (end.y - control.y);
  return { x, y, tilt: Math.atan2(dx, dy) };
}

/**
 * Maps a point in the cap's own frame (origin at the middle of its underside,
 * y up) to the mushroom's: the cap sits on the stem's top, turned by its tilt
 * and by most of the stem's own turn there.
 */
export function capFrame(genes: Posed): (point: Point) => Point {
  const top = stemAt(genes, 1);
  const angle = genes.capTilt + CAP_FOLLOW * top.tilt;
  return (point) => {
    const turned = turn(point, angle);
    return { x: turned.x + top.x, y: turned.y + top.y };
  };
}

/** How far the cap reaches to either side of the foot once `lean` turns it. */
export function capReach(
  genes: Posed,
  lean: number,
): { left: number; right: number } {
  const toMushroom = capFrame(genes);
  const half = genes.capWidth / 2;
  const xs = Array.from({ length: RIM_SAMPLES }, (_, index) => {
    const x = -half + (2 * half * index) / (RIM_SAMPLES - 1);
    return [
      { x, y: 0 },
      { x, y: domeHeight(genes, x) },
    ];
  })
    .flat()
    .map((point) => turn(toMushroom(point), lean).x);
  return { left: -Math.min(...xs), right: Math.max(...xs) };
}

/**
 * The farthest any mushroom's cap can reach from its foot, per unit of size,
 * once a placement turns it by `splay` beyond its own lean: the stem's top
 * sits no farther out than its bend plus its lean allow, and no point of the
 * cap is farther from the top than the dome's corner. `toward` is the side a
 * splayed mushroom faces; `away` the other, which only the cap's own width
 * reaches, the top never crossing back over the foot.
 */
export function maxReach(splay: number): { toward: number; away: number } {
  const height = GENE_RANGES.stemHeight[1];
  const bend = GENE_RANGES.stemBend[1];
  const lean = GENE_RANGES.lean[1] + Math.abs(splay);
  const corner = Math.hypot(
    GENE_RANGES.capWidth[1] / 2,
    GENE_RANGES.capHeight[1],
  );
  const toward = height * (bend + Math.sin(lean)) + corner;
  return { toward, away: splay === 0 ? toward : corner };
}

type Facing = Pick<MushroomGenes, 'lean' | 'stemBend' | 'capTilt'>;

/**
 * The same mushroom bending and leaning toward `side`, -1 for left and 1 for
 * right: how a clump's mushrooms grow apart. Only the signs change, so it
 * stays inside every gene's range.
 */
function facing<Genes extends Facing>(genes: Genes, side: -1 | 1): Genes {
  return {
    ...genes,
    lean: side * Math.abs(genes.lean),
    stemBend: side * Math.abs(genes.stemBend),
    capTilt: side * Math.abs(genes.capTilt),
  };
}

/**
 * A mushroom as a placement stands it: facing the way its `splay` turns it,
 * and turned about its foot by its lean and that splay together.
 */
export function splayed<Genes extends Facing>(
  genes: Genes,
  splay: number,
): { genes: Genes; turn: number } {
  const faced = splay === 0 ? genes : facing(genes, splay < 0 ? -1 : 1);
  return { genes: faced, turn: faced.lean + splay };
}
