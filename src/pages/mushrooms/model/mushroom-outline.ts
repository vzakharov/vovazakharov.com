/**
 * The outlines a mushroom is painted with, and its tap area built from them,
 * so what a finger lands on is what is drawn there. In the mushroom's own
 * frame (units of size, foot at the origin, y up) unless said otherwise.
 */

import { trumpetOutlines } from './chanterelle-outline';
import { placedAt, type Point, rounded, sample } from './geometry';
import type { MushroomGenes } from './mushroom-genes';
import { capFrame, stemAt } from './mushroom-pose';
import {
  capSurface,
  CURVE_STEPS,
  RIM_ROUNDS,
  stemHalfWidth,
} from './mushroom-profile';
/** A mushroom's ink line, in units of its size, wherever it is painted big enough to leave its pixel floor. */
export const MUSHROOM_INK = 0.014;

/**
 * The parts of a mushroom a tap lands on, in the order they are painted over
 * one another from the last: its cap, the gills or a chanterelle's ridged
 * funnel under it, and its stem.
 */
export const TAP_PARTS = ['cap', 'gills', 'stem'] as const;
/** Each of a mushroom's `TAP_PARTS` as a closed outline. */
export type TapArea = Record<(typeof TAP_PARTS)[number], Point[]>;

/** From the model's frame to the canvas's, in pixels with y down. */
export function toCanvas(size: number): (point: Point) => Point {
  return ({ x, y }) => ({ x: x * size, y: -y * size });
}

/** How far up the stem, `t` from its foot, the foot's levelling against the lean reaches. */
const FOOT_LEVELS = 0.3;
/** How far the foot's bottom rounds down into the grass, in its half-width. */
const FOOT_SAG = 0.22;

/**
 * The stem as a closed outline around its bent centreline, its foot level
 * with the ground and rounded into it once the mushroom stands turned `turn`
 * about its foot (`placedAt`): up its right side, down its left, and along
 * its foot back to the start.
 */
export function stemOutline(genes: MushroomGenes, turn = 0): Point[] {
  // A point `x` across the foot is level with it on screen at `x * slope` up.
  const slope = Math.tan(turn);
  const side = (t: number, sign: number): Point => {
    const station = stemAt(genes, t);
    const half = stemHalfWidth(genes, t);
    const x = station.x + sign * half * Math.cos(station.tilt);
    const level = Math.max(0, 1 - t / FOOT_LEVELS) ** 2;
    return {
      x,
      y: station.y - sign * half * Math.sin(station.tilt) + x * slope * level,
    };
  };
  const right = sample(0, 1, CURVE_STEPS, (t) => side(t, 1));
  const left = sample(1, 0, CURVE_STEPS, (t) => side(t, -1));
  const [from, to] = [left.at(-1) ?? side(0, -1), right[0] ?? side(0, 1)];
  // Straight down on screen, in this frame.
  const down = { x: Math.sin(turn), y: -Math.cos(turn) };
  const sag = FOOT_SAG * stemHalfWidth(genes, 0);
  const foot = sample(0, 1, CURVE_STEPS, (u) => {
    const dip = sag * 4 * u * (1 - u);
    return {
      x: from.x + (to.x - from.x) * u + down.x * dip,
      y: from.y + (to.y - from.y) * u + down.y * dip,
    };
  }).slice(1, -1);
  return [...right, ...left, ...foot];
}

/** How wide a stem's foot stands on screen once turned `turn`, in units of size. */
export function footWidth(genes: MushroomGenes, turn = 0): number {
  return (2 * stemHalfWidth(genes, 0)) / Math.cos(turn);
}

/**
 * The cap's top (`capSurface`) between two angles across it, `half` its
 * half-width, in the cap's frame. Sampled by angle, which crowds the samples
 * toward the rim where a dome turns steepest; nothing falls below `floor`.
 */
export function domeArc(
  genes: MushroomGenes,
  half: number,
  [from, to]: readonly [number, number],
  floor = 0,
): Point[] {
  return sample(from, to, CURVE_STEPS, (angle) => {
    const x = half * Math.sin(angle);
    return { x, y: Math.max(floor, capSurface(genes, x)) };
  });
}

/** A domed cap, its rim rounded into the underside, in the cap's frame. */
function domeOutline(genes: MushroomGenes): Point[] {
  const half = genes.capWidth / 2;
  const arc = domeArc(genes, half, [Math.PI / 2, -Math.PI / 2]);
  // The underside sags a little, so the cap reads as wrapping round.
  const sag = genes.capHeight * 0.1;
  const underside = sample(-half, half, CURVE_STEPS, (x) => ({
    x,
    y: -sag * (1 - (x / half) ** 2),
  })).slice(1, -1);
  return rounded([...arc, ...underside], RIM_ROUNDS);
}

/** The gills, an oval under the dome that shows below its rim, in the cap's frame. */
function gillsOutline(genes: MushroomGenes): Point[] {
  return sample(0, Math.PI * 2, CURVE_STEPS, (angle) => ({
    x: Math.cos(angle) * genes.capWidth * 0.44,
    y: Math.sin(angle) * genes.capHeight * 0.14,
  }));
}

/**
 * The cap and what shows under it as they are filled, in the cap's frame: a
 * dome and its gills, or a chanterelle's lip and its ridged funnel.
 */
export function headOutlines(genes: MushroomGenes): [Point[], Point[]] {
  return genes.species === 'chanterelle'
    ? trumpetOutlines(genes)
    : [domeOutline(genes), gillsOutline(genes)];
}

/** `headOutlines`, in the mushroom's frame. */
export function capOutlines(genes: MushroomGenes): [Point[], Point[]] {
  const cap = capFrame(genes);
  const [top, under] = headOutlines(genes);
  return [top.map((point) => cap(point)), under.map((point) => cap(point))];
}

/**
 * Where a mushroom answers a tap: its cap, gills and stem exactly as they are
 * filled, padded by nothing, not even the ink line round them — the clump's
 * stems cross under each other's caps, and the part painted on top is the one
 * a finger there means. `turn` is the one the mushroom stands at.
 */
export function tapArea(genes: MushroomGenes, turn = 0): TapArea {
  const [cap, gills] = capOutlines(genes);
  return { cap, gills, stem: stemOutline(genes, turn) };
}

/**
 * How far the cap reaches to either side of the foot once `lean` turns it
 * about the foot: its outlines as they are filled, so the reach the layout
 * keeps on screen is the one painted.
 */
export function capReach(
  genes: MushroomGenes,
  lean: number,
): { left: number; right: number } {
  const xs = capOutlines(genes)
    .flat()
    .map((point) => placedAt({ x: 0, y: 0 }, -lean, point).x);
  return { left: -Math.min(...xs), right: Math.max(...xs) };
}
