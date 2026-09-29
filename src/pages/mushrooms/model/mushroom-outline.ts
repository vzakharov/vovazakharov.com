/**
 * The outlines a mushroom is painted with, and its tap area built from them,
 * so what a finger lands on is what is drawn there. In the mushroom's own
 * frame (units of size, foot at the origin, y up) unless said otherwise.
 */

import { trumpetOutlines } from './chanterelle-outline';
import { placedAt, type Point, rounded, sample } from './geometry';
import {
  type DomeGenes,
  type FlyAgaricGenes,
  hasTrumpet,
  type MushroomGenes,
  type RussulaGenes,
} from './mushroom-genes';
import { capFrame, stemAt } from './mushroom-pose';
import {
  capSurface,
  CURVE_STEPS,
  RIM_ROUNDS,
  stemHalfWidth,
} from './mushroom-profile';
/** A mushroom's ink line, in units of its size, wherever it is painted big enough to leave its pixel floor. */
export const MUSHROOM_INK = 0.014;

/** A mushroom's ink line in pixels, painted `size` px to its unit: `MUSHROOM_INK`, never under two pixels. */
export function inkWidth(size: number): number {
  return Math.max(2, size * MUSHROOM_INK);
}

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

/** How far a dome's underside sags at its middle, in the cap's height, so the cap reads as wrapping round. */
const UNDER_SAG = 0.1;

/** A domed cap, its rim rounded into the underside, in the cap's frame. */
function domeOutline(genes: MushroomGenes): Point[] {
  const half = genes.capWidth / 2;
  const arc = domeArc(genes, half, [Math.PI / 2, -Math.PI / 2]);
  const underside = sample(-half, half, CURVE_STEPS, (x) => ({
    x,
    y: undersideAt(genes, x),
  })).slice(1, -1);
  return rounded([...arc, ...underside], RIM_ROUNDS);
}

/**
 * How deep a porcini's sponge and a russula's gills hang below the dome's
 * underside either side of the stem, in the cap's width: a band thick enough
 * to know the two by, where a fly agaric's gills only line its rim.
 */
const UNDER_BAND = { porcini: 0.085, russula: 0.085 } as const;
/** How far across a band reaches, in the cap's width, and how square its ends stand: under 1, flat along the bottom. */
const BAND_ACROSS = 0.45;
const BAND_ROUND = 0.35;
/**
 * How many gills a russula's band shows to either side of its stem, how far
 * past the collar they start, in its reach, and how far toward the band's
 * end and its lower edge they run.
 */
const GILLS = { side: 4, clear: 1.25, reach: 0.88 };

/** A species whose dome sits over a thick band: a porcini's sponge or a russula's gills. */
type Banded = Exclude<DomeGenes, FlyAgaricGenes>;

/**
 * Where a band draws up to the dome's underside round the stem, from and to
 * how far out from the middle, in the stem's top half-width: the stem runs up
 * into the cap between the band's two sides, as high as a door can climb.
 */
const COLLAR = [0.9, 1.3] as const;

/** The underside of a dome at `x`, sagging at its middle. */
function undersideAt(genes: MushroomGenes, x: number): number {
  const across = Math.min(1, Math.abs((2 * x) / genes.capWidth));
  return -genes.capHeight * UNDER_SAG * (1 - across ** 2);
}

/**
 * The band's lower edge at `x`: flat along the bottom either side of the
 * stem, drawn up to the dome's underside round it and rounding up at either
 * end.
 */
function bandBottom(genes: Banded, x: number): number {
  const along = Math.min(1, Math.abs(x) / (genes.capWidth * BAND_ACROSS));
  const collar = stemHalfWidth(genes, 1);
  const [from, to] = [COLLAR[0] * collar, COLLAR[1] * collar];
  const out = Math.min(1, Math.max(0, (Math.abs(x) - from) / (to - from)));
  const hangs =
    out * out * (3 - 2 * out) * (1 - along ** 2) ** (BAND_ROUND / 2);
  return (
    undersideAt(genes, x) - genes.capWidth * UNDER_BAND[genes.species] * hangs
  );
}

/**
 * What shows under the dome, in the cap's frame: a fly agaric's gills, an
 * oval that shows only just below its rim, or the thick band of a porcini's
 * sponge or a russula's gills, its top tucked up inside the dome.
 */
function gillsOutline(genes: DomeGenes): Point[] {
  if (genes.species === 'fly-agaric')
    return sample(0, Math.PI * 2, CURVE_STEPS, (angle) => ({
      x: Math.cos(angle) * genes.capWidth * 0.44,
      y: Math.sin(angle) * genes.capHeight * 0.14,
    }));
  const across = genes.capWidth * BAND_ACROSS;
  const tuck = genes.capHeight * UNDER_SAG * 2;
  // By angle, crowding the samples toward the band's ends, where it rounds.
  return sample(0, Math.PI * 2, CURVE_STEPS * 2, (angle) => {
    const x = Math.cos(angle) * across;
    const y = Math.sin(angle);
    return { x, y: y < 0 ? bandBottom(genes, x) : tuck * y };
  });
}

/**
 * A russula's gills as lines down its band, in the cap's frame: `GILLS.side`
 * to either side of the stem, spread from its collar toward the band's end,
 * each from under the dome to short of the band's lower edge so its stroke
 * stays on it.
 */
export function gillLines(genes: RussulaGenes): Point[][] {
  const from = COLLAR[1] * GILLS.clear * stemHalfWidth(genes, 1);
  const to = genes.capWidth * BAND_ACROSS * GILLS.reach;
  return [-1, 1].flatMap((sign) =>
    Array.from({ length: GILLS.side }, (_, index) => {
      const x = sign * (from + ((to - from) * index) / (GILLS.side - 1));
      const foot = bandBottom(genes, x) * GILLS.reach;
      return sample(0, 1, 1, (t) => ({ x, y: foot * t }));
    }),
  );
}

/**
 * The cap and what shows under it as they are filled, in the cap's frame: a
 * dome and its gills, or a chanterelle's lip and its ridged funnel.
 */
export function headOutlines(genes: MushroomGenes): [Point[], Point[]] {
  return hasTrumpet(genes)
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
