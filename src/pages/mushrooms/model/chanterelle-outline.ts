/**
 * A chanterelle's head as it is filled: a trumpet whose funnel runs on from
 * the stem, flaring out to a wavy rim under a thick lip. Its lip is its tap
 * area's `cap` and its funnel its `gills`, the ridges running over the funnel
 * and on down the stem.
 */

import { type Point, rounded, sample } from './geometry';
import type { ChanterelleGenes } from './mushroom-genes';
import { capFrame, stemAt } from './mushroom-pose';
import {
  capBase,
  capSurface,
  CURVE_STEPS,
  frontSag,
  funnelHeight,
  RIM_ROUNDS,
  rimWave,
  stemHalfWidth,
} from './mushroom-profile';

/** How far down the stem a ridge runs from the funnel, to `t` from its foot. */
const RIDGE_END = 0.55;

/** The front rim from right to left, its two ends left out: where the lip and the funnel meet. */
function frontRim(genes: ChanterelleGenes): Point[] {
  const half = genes.capWidth / 2;
  return sample(half, -half, CURVE_STEPS, (x) => ({
    x,
    y: capBase(genes, x),
  })).slice(1, -1);
}

/**
 * How far out from the middle the funnel stands `q` of the way up its rise,
 * and how far that is from the stem toward the rim, from 0 to 1.
 */
function funnelAt(
  genes: ChanterelleGenes,
  q: number,
): { r: number; out: number } {
  const stem = genes.stemWidth / 2;
  const out = q ** (1 / genes.flare);
  return { r: stem + out * (genes.capWidth / 2 - stem), out };
}

/** The funnel's side on `sign`'s side, from the stem's top up to the rim: its rise sampled evenly. */
function funnelSide(genes: ChanterelleGenes, sign: -1 | 1): Point[] {
  return sample(0, 1, CURVE_STEPS, (q) => {
    const x = sign * funnelAt(genes, q).r;
    return { x, y: funnelHeight(genes, x) + rimWave(genes, x) };
  });
}

/**
 * The lip and the funnel, in the cap's frame (`capFrame`: the stem's top at
 * the origin, the funnel's axis up): the lip from rim to rim over the top,
 * dipping at its middle, and back along the front rim; the funnel up from
 * the stem's top on either side to the rim, closed along that same front rim.
 */
export function trumpetOutlines(genes: ChanterelleGenes): [Point[], Point[]] {
  const half = genes.capWidth / 2;
  const rim = frontRim(genes);
  // By angle, crowding the samples toward the rim, where the lip turns down.
  const top = sample(-Math.PI / 2, Math.PI / 2, CURVE_STEPS, (angle) => {
    const x = half * Math.sin(angle);
    return { x, y: capSurface(genes, x) };
  });
  const lip = rounded([...top, ...rim], RIM_ROUNDS);
  const funnel = [
    ...funnelSide(genes, -1).toReversed(),
    ...funnelSide(genes, 1),
    ...rim,
  ];
  return [lip, funnel];
}

/**
 * Each ridge as a line in the mushroom's frame, from the front rim down over
 * the funnel and on down the stem to `RIDGE_END`: `ridges` of them spread
 * evenly round the funnel's near side, each where a ridge that far round
 * shows — so the painter strokes them and a test measures them from one
 * place.
 */
export function ridgeLines(genes: ChanterelleGenes): Point[][] {
  const cap = capFrame(genes);
  return Array.from({ length: genes.ridges }, (_, index) => {
    const round = -Math.PI / 2 + (Math.PI * (index + 0.5)) / genes.ridges;
    const side = Math.sin(round);
    const rimX = (side * genes.capWidth) / 2;
    const sag = frontSag(genes, rimX);
    const overFunnel = sample(1, 0, CURVE_STEPS, (q) => {
      const { r, out } = funnelAt(genes, q);
      const x = r * side;
      const wave = rimWave(genes, x);
      // Toward the funnel's sides, never below its lower edge as drawn.
      return cap({
        x,
        y: Math.max(
          funnelHeight(genes, r) + (wave - sag) * out,
          funnelHeight(genes, x) + wave,
        ),
      });
    });
    // Its first point is the funnel's last: the funnel's foot is the stem's
    // top, the cap turning with the stem.
    const downStem = sample(1, RIDGE_END, CURVE_STEPS, (t) => {
      const station = stemAt(genes, t);
      const across = stemHalfWidth(genes, t) * side;
      return {
        x: station.x + across * Math.cos(station.tilt),
        y: station.y - across * Math.sin(station.tilt),
      };
    }).slice(1);
    return [...overFunnel, ...downStem];
  });
}
