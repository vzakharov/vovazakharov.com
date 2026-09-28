/**
 * Where a mushroom's parts stand, in units of its size with the foot at the
 * origin and y up. The painter and the layout both read it, so what the
 * layout keeps inside the screen is what gets painted.
 */

import type { Point, Turned } from './geometry';
import {
  GENE_RANGES,
  MUSHROOM_SPECIES,
  type MushroomGenes,
  type Species,
  TRUMPET_RANGES,
} from './mushroom-genes';
import { capBase, capSurface } from './mushroom-profile';

/** How far along the stem its bend's control point sits. */
const BEND_FROM = 0.55;
/**
 * How much of the stem's turn at the top the cap follows: a chanterelle's
 * all of it, its funnel running on from the stem.
 */
const CAP_FOLLOW = {
  'fly-agaric': 0.45,
  porcini: 0.45,
  chanterelle: 1,
  russula: 0.45,
} as const satisfies Record<Species, number>;

type Posed = Pick<
  MushroomGenes,
  'species' | 'stemHeight' | 'stemBend' | 'capTilt'
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
export function stemAt(
  genes: Pick<MushroomGenes, 'stemHeight' | 'stemBend'>,
  t: number,
): StemStation {
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
  const angle = genes.capTilt + CAP_FOLLOW[genes.species] * top.tilt;
  return (point) => {
    const turned = turn(point, angle);
    return { x: turned.x + top.x, y: turned.y + top.y };
  };
}

/**
 * Where a butterfly sits on the cap, `across` from -1 to 1 of the way from
 * the crown toward either rim: a little under the cap's top, so it reads as
 * sitting on it rather than hovering — on a chanterelle, in the dip of its
 * lip or on its rim.
 */
export function capSeat(genes: MushroomGenes, across: number): Point {
  const x = (across * genes.capWidth) / 2;
  const base = capBase(genes, x);
  return capFrame(genes)({ x, y: base + (capSurface(genes, x) - base) * 0.8 });
}

/** The tallest any of `species`' caps stands over the middle of its underside. */
function tallestCap(species: Species): number {
  const height = GENE_RANGES[species].capHeight[1];
  return species === 'chanterelle'
    ? height + TRUMPET_RANGES.lip[1] + TRUMPET_RANGES.waveAmp[1]
    : height;
}

/**
 * The farthest any mushroom's cap can reach from its foot, per unit of size,
 * once a placement turns it by `splay` beyond its own lean, whatever its
 * species: the stem's top sits no farther out than its bend plus its lean
 * allow, and no point of the cap is farther from the top than the corner of
 * the box its widest and tallest cap stands in. `toward` is the side a
 * splayed mushroom faces; `away` the other, which only the cap's own width
 * reaches, the top never crossing back over the foot.
 */
export function maxReach(splay: number): { toward: number; away: number } {
  const reaches = MUSHROOM_SPECIES.map((species) => {
    const ranges = GENE_RANGES[species];
    const lean = ranges.lean[1] + Math.abs(splay);
    const corner = Math.hypot(ranges.capWidth[1] / 2, tallestCap(species));
    const toward =
      ranges.stemHeight[1] * (ranges.stemBend[1] + Math.sin(lean)) + corner;
    return { toward, away: splay === 0 ? toward : corner };
  });
  return {
    toward: Math.max(...reaches.map(({ toward }) => toward)),
    away: Math.max(...reaches.map(({ away }) => away)),
  };
}

type Facing = Pick<MushroomGenes, 'lean' | 'stemBend' | 'capTilt'>;

/**
 * The same mushroom bending and leaning toward `side`, -1 for left and 1 for
 * right: how a clump's mushrooms grow apart. Only the signs change, so each
 * gene keeps a size its range allows.
 */
function facing<Genes extends Facing>(genes: Genes, side: -1 | 1): Genes {
  return {
    ...genes,
    lean: side * Math.abs(genes.lean),
    stemBend: side * Math.abs(genes.stemBend),
    capTilt: side * Math.abs(genes.capTilt),
  };
}

/** A mushroom's genes as it stands, and its turn about its foot. */
export type Splayed<Genes = MushroomGenes> = Turned & { genes: Genes };

/**
 * A mushroom as a placement stands it: facing the way its `splay` turns it,
 * and turned about its foot by its lean and that splay together.
 */
export function splayed<Genes extends Facing>(
  genes: Genes,
  splay: number,
): Splayed<Genes> {
  const faced = splay === 0 ? genes : facing(genes, splay < 0 ? -1 : 1);
  return { genes: faced, turn: faced.lean + splay };
}
