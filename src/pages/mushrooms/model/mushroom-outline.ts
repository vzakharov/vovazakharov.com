/**
 * The outlines a mushroom is painted with, and its tap area built from them,
 * so what a finger lands on is what is drawn there. In the mushroom's own
 * frame (units of size, foot at the origin, y up) unless said otherwise.
 */

import { type Point, rounded, sample } from './geometry';
import { domeHeight, type MushroomGenes } from './mushroom-genes';
import { capFrame, stemAt } from './mushroom-pose';

export const CURVE_STEPS = 28;
/** How many times the dome's corners are cut, rounding its rim. */
const RIM_ROUNDS = 2;

/** The parts of a mushroom a tap lands on. */
export const TAP_PARTS = ['cap', 'gills', 'stem'] as const;
/** Each of a mushroom's `TAP_PARTS` as a closed outline. */
export type TapArea = Record<(typeof TAP_PARTS)[number], Point[]>;

/** From the model's frame to the canvas's, in pixels with y down. */
export function toCanvas(size: number): (point: Point) => Point {
  return ({ x, y }) => ({ x: x * size, y: -y * size });
}

/**
 * The stem's half-width `t` of the way from its foot to its top: from the
 * bulge at the foot to the top's width, swelling a little at the middle.
 */
export function stemHalfWidth(
  genes: Pick<MushroomGenes, 'stemWidth' | 'footBulge'>,
  t: number,
): number {
  const top = genes.stemWidth / 2;
  const foot = top * genes.footBulge;
  return foot + (top - foot) * t + top * 0.12 * Math.sin(Math.PI * t);
}

/** The stem as a closed outline around its bent centreline. */
export function stemOutline(genes: MushroomGenes): Point[] {
  const side = (t: number, sign: number): Point => {
    const station = stemAt(genes, t);
    const half = stemHalfWidth(genes, t);
    return {
      x: station.x + sign * half * Math.cos(station.tilt),
      y: station.y - sign * half * Math.sin(station.tilt),
    };
  };
  return [
    ...sample(0, 1, CURVE_STEPS, (t) => side(t, 1)),
    ...sample(1, 0, CURVE_STEPS, (t) => side(t, -1)),
  ];
}

/**
 * The dome's surface between two angles across it, `half` its half-width, in
 * the cap's frame. Sampled by angle, which crowds the samples toward the rim
 * where the dome turns steepest; nothing falls below `floor`.
 */
export function domeArc(
  genes: MushroomGenes,
  half: number,
  [from, to]: readonly [number, number],
  floor = 0,
): Point[] {
  return sample(from, to, CURVE_STEPS, (angle) => {
    const x = half * Math.sin(angle);
    return { x, y: Math.max(floor, domeHeight(genes, x)) };
  });
}

/**
 * The dome down to `fromLevel` of its height, in the cap's frame, its rim
 * rounded into the underside.
 */
export function domeBand(genes: MushroomGenes, fromLevel: number): Point[] {
  const level = genes.capHeight * fromLevel;
  const half =
    (genes.capWidth / 2) *
    Math.sqrt(1 - (fromLevel === 0 ? 0 : fromLevel ** (2 / genes.domePower)));
  const arc = domeArc(genes, half, [Math.PI / 2, -Math.PI / 2], level);
  // The lower edge sags a little, so a band reads as wrapping the dome.
  const sag = genes.capHeight * (fromLevel === 0 ? 0.1 : 0.06);
  const underside = sample(-half, half, CURVE_STEPS, (x) => ({
    x,
    y: level - sag * (1 - (x / (half || 1)) ** 2),
  })).slice(1, -1);
  return rounded([...arc, ...underside], RIM_ROUNDS);
}

/** The gills, an oval under the dome that shows below its rim, in the cap's frame. */
export function gillsOutline(genes: MushroomGenes): Point[] {
  return sample(0, Math.PI * 2, CURVE_STEPS, (angle) => ({
    x: Math.cos(angle) * genes.capWidth * 0.44,
    y: Math.sin(angle) * genes.capHeight * 0.14,
  }));
}

/**
 * Where a mushroom answers a tap: its dome, gills and stem exactly as they are
 * filled, padded by nothing, not even the ink line round them — the clump's
 * stems cross under each other's caps, and the part painted on top is the one
 * a finger there means.
 */
export function tapArea(genes: MushroomGenes): TapArea {
  const cap = capFrame(genes);
  const inCap = (outline: readonly Point[]) =>
    outline.map((point) => cap(point));
  return {
    cap: inCap(domeBand(genes, 0)),
    gills: inCap(gillsOutline(genes)),
    stem: stemOutline(genes),
  };
}
