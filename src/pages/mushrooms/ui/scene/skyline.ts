/**
 * The hills' skylines and the ground's seam, pure: the hills as crests round
 * the panorama, by azimuth, so a sweep can check what stands in front of the
 * sun from any heading without painting; the seam also as points across the
 * world, which the grass along it is laid on.
 */

import { type Point, sample } from '../../model/geometry';
import { type Camera, pinholeOf } from '../../model/ground';
import type { Light } from '../../model/light';
import { between, type Random } from '../../model/random';
import type { MeadowLayout } from './layout';
import {
  azimuthAt,
  type Crest,
  ringWave,
  type WithCrest,
  wrapAngle,
} from './panorama';
import { layerSpan, PARALLAX } from './parallax';
import { SUN_RAY_REACH } from './sun-layout';

/** A skyline's points to a screen's width. */
export const HILL_STEPS = 64;
/** How fast a lit rim deepens to its full depth as a slope turns toward the light. */
const RIDGE_GAIN = 4;
/** How far the far hills rise above the horizon at most, as a share of the way down to the ground's top. */
const FAR_RISE = 0.9;
/** How far above the horizon the farthest hills' foot stands, and their rise as a share of the far hills'. */
const FARTHEST_LIFT = 0.15;
const FARTHEST_RISE = 0.6;

/** A wave of a crest: its share of the swell, its pace against the crest's first wave, and its phase where the first's is 0. */
type Wave = readonly [weight: number, pace: number, phase: number];

/** A hill's two waves: the second's phase is drawn, as the first's is. */
const HILL_WAVES = [
  [0.65, 1],
  [0.35, 2.3],
] as const;

/**
 * How far into each range the opening view's middle stands, per CSS px the
 * world overhangs the screen either side: so the opening view shows each
 * range's crests where it always has.
 */
const OPENING_SLIDE = { far: 0.3, near: 0.6, seam: 1 } as const;

/** Where along its waves `camera`'s opening view has a range's middle, in CSS px. */
function openingMiddle(camera: Camera, slide: number): number {
  return (
    pinholeOf(camera).x + slide * Math.max(0, (camera.world - camera.width) / 2)
  );
}

/**
 * A swell round the panorama from `waves`, the first `rate` radians of its
 * phase to a CSS px across the opening screen, from −1 to 1 at most.
 */
function swellOf(
  camera: Camera,
  waves: readonly Wave[],
  rate: number,
  middle: number,
): Crest {
  const rings = waves.map(
    ([weight, pace, phase]) =>
      [
        weight,
        ringWave(camera, rate * pace, phase + rate * pace * middle),
      ] as const,
  );
  return (azimuth) =>
    rings.reduce((sum, [weight, wave]) => sum + weight * wave(azimuth), 0);
}

/**
 * A rolling crest round the panorama from a sum of two waves, its phases
 * and its pace drawn from `random`, between 1.2 and 2.2 swells to a
 * screen's width, from `base` up to `amplitude` above it.
 */
function hillCrest(
  random: Random,
  camera: Camera,
  slide: number,
  base: number,
  amplitude: number,
): Crest {
  const phases = HILL_WAVES.map(() => between(random, 0, Math.PI * 2));
  const rate = (Math.PI * between(random, 1.2, 2.2)) / camera.width;
  const swell = swellOf(
    camera,
    HILL_WAVES.map(([weight, pace], index) => [
      weight,
      pace,
      phases[index] ?? 0,
    ]),
    rate,
    openingMiddle(camera, slide),
  );
  return (azimuth) => base - amplitude * (0.5 + 0.5 * swell(azimuth));
}

/**
 * How deep under the sun's middle, in its radii, the far hills part; and how
 * far either side, in radii, the parting is still half as deep, which keeps
 * it wider than the glow round the sun.
 */
const PARTED_DEPTH = 2;
const PARTED_SPREAD = 5;
/** How sharply a range's lowering eases back to none where the bowl clears its crest: the higher, the narrower the shoulder. */
const PARTED_EASE = 3;

/** The smaller of `share` and 1, rounded so it bends without a corner, and never above either. */
function softShare(share: number): number {
  return share / (1 + share ** PARTED_EASE) ** (1 / PARTED_EASE);
}

/** A far range's crest before the sun parts it, and the height its crests reach at the most. */
export type FarRange = WithCrest & { highest: number };

/**
 * The height, at each azimuth, no far hill may rise above: a bowl
 * `PARTED_DEPTH` radii below the sun's middle at the sun's azimuth, its
 * sides under every ray and outside the glow, so no hill stands in front of
 * the sun and the glow is not cut out of the sky by the hills. Its sides are
 * measured in azimuth, `focal` px to the radian, which a view spreads across
 * the screen at least as wide, so the bowl clears the rays from any heading.
 */
function sunBowl({ sun, camera }: MeadowLayout): Crest {
  const { focal } = pinholeOf(camera);
  const middle = azimuthAt(camera, sun.x);
  const depth = sun.r * PARTED_DEPTH;
  const spread = sun.r * Math.max(PARTED_SPREAD, SUN_RAY_REACH);
  return (azimuth) => {
    const off = focal * wrapAngle(azimuth - middle);
    return sun.y + depth - (depth * off ** 2) / (2 * spread ** 2);
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
  { crest, highest }: FarRange,
  layout: MeadowLayout,
): Crest {
  const { nearHills } = layout;
  const bowl = sunBowl(layout);
  return (azimuth) => {
    const room = Math.max(
      0,
      (nearHills - bowl(azimuth)) / (nearHills - highest),
    );
    return nearHills - (nearHills - crest(azimuth)) * softShare(room);
  };
}

/** The far hills' range: a rolling crest rising from the horizon. */
export function farRange(random: Random, layout: MeadowLayout): FarRange {
  const { horizon, groundTop, camera } = layout;
  const rise = (groundTop - horizon) * FAR_RISE;
  return {
    crest: hillCrest(random, camera, OPENING_SLIDE.far, horizon, rise),
    highest: horizon - rise,
  };
}

/**
 * The farthest hills' range, behind the far range: its foot a little above
 * the horizon and its rise lower, so it shows in the far range's dips.
 */
export function farthestRange(random: Random, layout: MeadowLayout): FarRange {
  const { horizon, groundTop, camera } = layout;
  const rise = groundTop - horizon;
  const foot = horizon - rise * FARTHEST_LIFT;
  const height = rise * FAR_RISE * FARTHEST_RISE;
  return {
    crest: hillCrest(random, camera, OPENING_SLIDE.far, foot, height),
    highest: foot - height,
  };
}

/** The far hills' skyline, parted under the sun. */
export function farSkyline(random: Random, layout: MeadowLayout): Crest {
  return partedUnderSun(farRange(random, layout), layout);
}

/** The farthest hills' skyline, parted under the sun as the far range is. */
export function farthestSkyline(random: Random, layout: MeadowLayout): Crest {
  return partedUnderSun(farthestRange(random, layout), layout);
}

/** The near hills' skyline, rolling across the band below the far hills'. */
export function nearSkyline(
  random: Random,
  { nearHills, groundTop, camera }: MeadowLayout,
): Crest {
  return hillCrest(
    random,
    camera,
    OPENING_SLIDE.near,
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
/** The seam's two waves. */
const SEAM_WAVES: readonly Wave[] = [
  [0.6, 1, 0.7],
  [0.4, 2.7, 2.1],
];
/** The seam's points to a screen's width. */
export const SEAM_STEPS = 128;

/** How far the seam wanders either side of the ground's top, in CSS px. */
export function seamReach({
  height,
  groundTop,
}: Pick<MeadowLayout, 'height' | 'groundTop'>): number {
  return (height - groundTop) * SEAM_REACH;
}

/**
 * Where the ground meets the near hills' foot, round the panorama: a line
 * wavering about the ground's top by `SEAM_REACH`, so the meadow's far edge
 * has no straight line in it. The opening view shows it where `groundSeam`
 * lays it across the world.
 */
export function seamCrest(layout: MeadowLayout): Crest {
  const { groundTop, camera } = layout;
  const reach = seamReach(layout);
  const swell = swellOf(
    camera,
    SEAM_WAVES,
    (Math.PI * 2) / SEAM_WAVELENGTH,
    openingMiddle(camera, OPENING_SLIDE.seam),
  );
  return (azimuth) => groundTop + reach * swell(azimuth);
}

/**
 * The seam across the world, as the opening eye lays it out: it depends on
 * the screen's size alone, so the grass that lines it reads the same seam.
 */
export function groundSeam(layout: MeadowLayout): Point[] {
  const { width, groundTop, camera } = layout;
  const { left, across } = layerSpan(camera, PARALLAX.ground);
  const reach = seamReach(layout);
  const rate = (Math.PI * 2) / SEAM_WAVELENGTH;
  return sample(0, 1, Math.ceil((SEAM_STEPS * across) / width), (t) => {
    const swell = SEAM_WAVES.reduce(
      (sum, [weight, pace, phase]) =>
        sum + weight * Math.sin(rate * pace * t * across + phase),
      0,
    );
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

/** `points` without those standing level between level neighbours, which add nothing to the outline. */
function withoutLevelRuns(points: readonly Point[]): Point[] {
  return points.filter(
    ({ y }, index) => points[index - 1]?.y !== y || points[index + 1]?.y !== y,
  );
}

/**
 * How near, in CSS px both ways, Phaser's fill skips a path's point to the one
 * kept before it: the game's `pathDetailThreshold`, 1 device px by default,
 * which no Graphics can lower, and at most 1 CSS px on any screen of a
 * device-pixel ratio of 1 or more.
 */
export const PATH_SKIP = 1;

/**
 * `line` without the points at its end that stand within `PATH_SKIP` of
 * `corner`, the band's lower right corner that follows them. Phaser would skip
 * the corner after such a point instead, sloping the band's closing edge
 * across its own clamped edge, and its fill would spill past the band as a
 * flat slab over the range behind. Dropping the point moves the band's edge
 * by under `PATH_SKIP`.
 */
function beforeCorner(line: readonly Point[], corner: Point): Point[] {
  const near = ({ x, y }: Point) =>
    Math.abs(x - corner.x) <= PATH_SKIP && Math.abs(y - corner.y) <= PATH_SKIP;
  let end = line.length;
  while (end > 1 && near(line[end - 1] ?? corner)) end -= 1;
  return line.slice(0, end);
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
    const corner = { x: right, y: y1 };
    return {
      outline: [
        ...beforeCorner(
          withoutLevelRuns(
            fine.map(({ x, y }) => ({ x, y: Math.min(y1, Math.max(y0, y)) })),
          ),
          corner,
        ),
        corner,
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
