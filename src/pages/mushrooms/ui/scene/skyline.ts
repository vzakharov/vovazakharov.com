/**
 * The hills' skylines and the ground's seam, as points across their layers
 * in CSS pixels: pure, so a sweep can check what stands in front of the sun
 * without painting. Each runs across the stretch of its layer the screen
 * shows over every crop (`layerSpan`), the hills at their parallax.
 */

import { type Point, sample } from '../../model/geometry';
import type { Light } from '../../model/light';
import { between, type Random } from '../../model/random';
import type { MeadowLayout } from './layout';
import { layerSpan, PARALLAX, type Span } from './parallax';
import { SUN_RAY_REACH } from './sun-layout';

/** A skyline's points to a screen's width. */
const HILL_STEPS = 64;
/** How fast a lit rim deepens to its full depth as a slope turns toward the light. */
const RIDGE_GAIN = 4;
/** How far the far hills rise above the horizon at most, as a share of the way down to the ground's top. */
const FAR_RISE = 0.9;
/** How far above the horizon the farthest hills' foot stands, and their rise as a share of the far hills'. */
const FARTHEST_LIFT = 0.15;
const FARTHEST_RISE = 0.6;

/**
 * A rolling skyline across `span` from a sum of two waves, its phases drawn
 * from `random`, as many swells to a screen's `width` however far it runs.
 */
function hillLine(
  random: Random,
  { left, across }: Span,
  width: number,
  base: number,
  amplitude: number,
): Point[] {
  const phase = between(random, 0, Math.PI * 2);
  const phase2 = between(random, 0, Math.PI * 2);
  const screens = across / width;
  const waves = between(random, 1.2, 2.2) * screens;
  return sample(0, 1, Math.ceil(HILL_STEPS * screens), (t) => {
    const swell =
      0.65 * Math.sin(t * Math.PI * waves + phase) +
      0.35 * Math.sin(t * Math.PI * waves * 2.3 + phase2);
    return {
      x: left + t * across,
      y: base - amplitude * (0.5 + 0.5 * swell),
    };
  });
}

/** The far hills' layer, which the farthest range shares. */
function farSpan({ camera }: MeadowLayout): Span {
  return layerSpan(camera, PARALLAX.far);
}

/**
 * How deep under the sun's middle, in its radii, the far hills part; and how
 * far either side, in radii, the parting is still half as deep, which keeps
 * it wider than the glow round the sun.
 */
const PARTED_DEPTH = 2;
const PARTED_SPREAD = 5;
/** How much deeper, in the sun's radii, the parting sags midway along the stretch the sun sweeps as the crop pans, so its floor never runs level. */
const PARTED_SAG = 0.2;
/** How sharply a range's lowering eases back to none where the bowl clears its crest: the higher, the narrower the shoulder. */
const PARTED_EASE = 3;

/** The smaller of `share` and 1, rounded so it bends without a corner, and never above either. */
function softShare(share: number): number {
  return share / (1 + share ** PARTED_EASE) ** (1 / PARTED_EASE);
}

/** A far range's skyline before the sun parts it, and the height its crests reach at the most. */
export type FarRange = { line: Point[]; crest: number };

/**
 * The height, at each `x` of the far hills' layer, no far hill may rise
 * above: a bowl `PARTED_DEPTH` radii below the sun's middle, its sides under
 * every ray and outside the glow, so no hill stands in front of the sun and
 * the glow is not cut out of the sky by the hills. The sun stands still on
 * the screen while the layer slides under it, so the bowl's middle runs
 * along the whole stretch of the layer the sun passes over as the crop pans,
 * sagging a little midway along it, and it bends without a corner.
 */
function sunBowl(layout: MeadowLayout): (x: number) => number {
  const { sun, width } = layout;
  const span = farSpan(layout);
  const sweep = { left: sun.x + span.left, across: span.across - width };
  const depth = sun.r * PARTED_DEPTH;
  const spread = sun.r * Math.max(PARTED_SPREAD, SUN_RAY_REACH);
  // Bending no sharper than half the bowl's sides do, however short the sweep.
  const sag = Math.min(
    sun.r * PARTED_SAG,
    (depth * sweep.across ** 2) / (4 * Math.PI ** 2 * spread ** 2),
  );
  // A parabola through `depth` below the middle and `depth / 2` below it at
  // `spread` either side of the sweep; no narrower than the rays' reach,
  // which keeps it under the rays' circle wherever the sun stands.
  return (x) => {
    const along =
      sweep.across > 0
        ? Math.min(1, Math.max(0, (x - sweep.left) / sweep.across))
        : 0;
    const off = x - (sweep.left + along * sweep.across);
    return (
      sun.y +
      depth +
      sag * Math.sin(Math.PI * along) ** 2 -
      (depth * off ** 2) / (2 * spread ** 2)
    );
  };
}

/**
 * A far range parted under the sun: wherever its crest would rise above the
 * sun's bowl, the whole range is pressed down toward the near hills' band by
 * at least as much as brings the crest to the bowl, easing back to its own
 * height as the bowl climbs clear (`PARTED_EASE`). It is squashed rather than
 * cut, so the lowered stretch keeps rolling as the rest does, with no level
 * top and no shoulder, and no point of it stands above the bowl.
 */
export function partedUnderSun(
  { line, crest }: FarRange,
  layout: MeadowLayout,
): Point[] {
  const { nearHills } = layout;
  const bowl = sunBowl(layout);
  return line.map(({ x, y }) => {
    const room = Math.max(0, (nearHills - bowl(x)) / (nearHills - crest));
    return { x, y: nearHills - (nearHills - y) * softShare(room) };
  });
}

/** The far hills' range: a rolling line rising from the horizon. */
export function farRange(random: Random, layout: MeadowLayout): FarRange {
  const { width, horizon, groundTop } = layout;
  const rise = (groundTop - horizon) * FAR_RISE;
  return {
    line: hillLine(random, farSpan(layout), width, horizon, rise),
    crest: horizon - rise,
  };
}

/**
 * The farthest hills' range, behind the far range: its foot a little above
 * the horizon and its rise lower, so it shows in the far range's dips.
 */
export function farthestRange(random: Random, layout: MeadowLayout): FarRange {
  const { width, horizon, groundTop } = layout;
  const rise = groundTop - horizon;
  const foot = horizon - rise * FARTHEST_LIFT;
  const height = rise * FAR_RISE * FARTHEST_RISE;
  return {
    line: hillLine(random, farSpan(layout), width, foot, height),
    crest: foot - height,
  };
}

/** The far hills' skyline, parted under the sun. */
export function farSkyline(random: Random, layout: MeadowLayout): Point[] {
  return partedUnderSun(farRange(random, layout), layout);
}

/** The farthest hills' skyline, parted under the sun as the far range is. */
export function farthestSkyline(random: Random, layout: MeadowLayout): Point[] {
  return partedUnderSun(farthestRange(random, layout), layout);
}

/** The near hills' skyline, rolling across the band below the far hills'. */
export function nearSkyline(
  random: Random,
  { width, nearHills, groundTop, camera }: MeadowLayout,
): Point[] {
  return hillLine(
    random,
    layerSpan(camera, PARALLAX.near),
    width,
    nearHills + (groundTop - nearHills) * 0.6,
    (groundTop - nearHills) * 1.1,
  );
}

/** How far above and below the ground's top its seam with the near hills wanders, as a share of the ground's depth. */
export const SEAM_REACH = 0.035;
/**
 * One swell of the seam, in CSS pixels across: short enough that the
 * narrowest phone, whose band is shallow and its seam's reach with it, has no
 * crest running level for long.
 */
const SEAM_WAVELENGTH = 250;
/** The seam's points to a screen's width. */
const SEAM_STEPS = 128;

/**
 * Where the ground meets the near hills' foot, across the world: a line
 * wavering about the ground's top by `SEAM_REACH`, so the meadow's far edge
 * has no straight line in it. It depends on the screen's size alone, so the
 * ground and the grass that lines it read the same seam.
 */
export function groundSeam({
  width,
  height,
  groundTop,
  camera,
}: MeadowLayout): Point[] {
  const { left, across } = layerSpan(camera, PARALLAX.ground);
  const reach = (height - groundTop) * SEAM_REACH;
  const waves = (across / SEAM_WAVELENGTH) * Math.PI * 2;
  return sample(0, 1, Math.ceil((SEAM_STEPS * across) / width), (t) => {
    const swell =
      0.6 * Math.sin(t * waves + 0.7) + 0.4 * Math.sin(t * waves * 2.7 + 2.1);
    return { x: left + t * across, y: groundTop + reach * swell };
  });
}

/** The seam's height at `x`, between the two points either side; level past either end. */
export function seamAt(seam: readonly Point[], x: number): number {
  const after = seam.findIndex((point) => point.x >= x);
  const right = after === -1 ? seam.at(-1) : seam[after];
  const left = seam[after - 1] ?? right;
  if (!left || !right) return 0;
  const span = right.x - left.x;
  return span === 0
    ? right.y
    : left.y + ((right.y - left.y) * (x - left.x)) / span;
}

/**
 * `line` with a point added wherever it crosses one of `levels`, so clamping
 * its points to a band is the same as clamping the line itself.
 */
function crossings(line: readonly Point[], levels: readonly number[]): Point[] {
  return line.flatMap((point, index) => {
    const before = line[index - 1];
    if (!before) return [point];
    const cut = levels
      .filter(
        (level) =>
          (before.y - level) * (point.y - level) < 0 && before.y !== point.y,
      )
      .map((level) => {
        const t = (level - before.y) / (point.y - before.y);
        return { x: before.x + (point.x - before.x) * t, y: level };
      })
      .toSorted((a, b) => a.x - b.x);
    return [...cut, point];
  });
}

/** One of a range's bands: its outline, and how far down the range it lies, 0 at the crest and 1 at the foot. */
export type HillBand = { outline: Point[]; down: number };

/**
 * A range down to `floor` cut into `bands` horizontal bands from its highest
 * crest, each the skyline clamped into the band and closed along its lower
 * edge. A skyline is a height field, so the bands tile the range exactly and
 * none reaches above the skyline.
 */
export function hillBands(
  line: readonly Point[],
  floor: number,
  bands: number,
): HillBand[] {
  const top = Math.min(...line.map(({ y }) => y));
  const step = (floor - top) / bands;
  const levels = Array.from({ length: bands + 1 }, (_, index) =>
    index === bands ? floor : top + index * step,
  );
  const fine = crossings(line, levels);
  const left = fine[0]?.x ?? 0;
  const right = fine.at(-1)?.x ?? 0;
  return levels.slice(0, -1).map((y0, index) => {
    const y1 = levels[index + 1] ?? floor;
    return {
      outline: [
        ...fine.map(({ x, y }) => ({ x, y: Math.min(y1, Math.max(y0, y)) })),
        { x: right, y: y1 },
        { x: left, y: y1 },
      ],
      down: bands === 1 ? 0 : index / (bands - 1),
    };
  });
}

/**
 * The rim along `line` where its slope turns toward the light `toward` more
 * than level ground does: one quad per such segment, reaching `depth` down
 * under the ridge at the most, the more the slope turns.
 */
export function litRidge(
  line: readonly Point[],
  { toward }: Light,
  depth: number,
): Point[][] {
  // How much level ground faces the light, which every rim is measured past.
  const level = -toward.y;
  return line.slice(1).flatMap((point, index) => {
    const before = line[index] ?? point;
    const dx = point.x - before.x;
    const dy = point.y - before.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return [];
    // The slope's outward normal, toward the sky above a left-to-right line.
    const turned = (dy * toward.x - dx * toward.y) / length - level;
    if (turned <= 0) return [];
    const reach = depth * Math.min(1, turned * RIDGE_GAIN);
    const under = ({ x, y }: Point) => ({ x, y: y + reach });
    return [[before, point, under(point), under(before)]];
  });
}
