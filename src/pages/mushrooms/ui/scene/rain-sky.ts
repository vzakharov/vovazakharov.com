/**
 * The sky under a shower as pure functions of the meadow's rain spans and
 * the clock, in ms on the insects' clock: how dark each cloud is, how deep
 * the slate wash lies, how far the sun dims, how strongly the rainbow shows
 * and where it stands, and which cloud a tap lands on.
 */

import { type Circle, type Point, wrap } from '../../model/geometry';
import { pinholeOf } from '../../model/ground';
import { smooth } from '../../model/motion';
import { type Rain, rainbow, wetness } from '../../model/weather';
import type { MeadowLayout } from './layout';
import { PALETTE } from './palette';
import { TAP_RADIUS } from './tap-reach';

/** How far a cloud's puffs spread either side of its middle, in its radii. */
export const CLOUD_SPREAD = 4;
/** How far below its middle line a cloud's puffs reach, in its radii, its shaded underside included. */
const CLOUD_BELOW = 1.15;
/** How long after the tapped cloud the one opposite it round the sky starts to darken. */
export const DARKEN_LAG_MS = 600;
/** How long a rainbow takes to fade once a new shower starts under it. */
export const RAINBOW_OUT_MS = 600;
/** The slate wash's alpha with the meadow at its wettest. */
export const WASH_DEEPEST = 0.3;
/** The rainbow's alpha at its strongest. */
export const RAINBOW_DEEPEST = 0.55;
/** How much of the sun and its glow a full shower takes away, so it never rains in full sunshine. */
export const SUN_DIMMED = 0.5;

/** The sun's and its glow's alpha with the sky `wet` from 0 to 1 (`wetnessShown`). */
export function sunShown(wet: number): number {
  return 1 - SUN_DIMMED * wet;
}

/** How wide all the rainbow's bands together are, in its radii. */
const RAINBOW_WIDTH = 0.2;

/**
 * The rainbow's arch as the opening screen would show it: its middle at the
 * opening x round the sky opposite the sun, standing on the near hills' top
 * so its feet hide behind the far hills; its outer radius `r`, as wide as
 * the screen allows with its top on it, but on a screen held tall never so
 * low that the far hills' crests, which rise well over the horizon there,
 * hide it — its feet then stand off the screen's sides; and each band's
 * width, `band`.
 */
export function rainbowArc({
  width,
  nearHills,
  sun,
  camera,
}: Pick<MeadowLayout, 'width' | 'nearHills' | 'sun' | 'camera'>): Circle & {
  band: number;
} {
  const r = Math.min(0.8 * nearHills, Math.max(0.42 * width, 0.6 * nearHills));
  return {
    x: sun.x + Math.PI * pinholeOf(camera).arc,
    y: nearHills,
    r,
    band: (RAINBOW_WIDTH * r) / PALETTE.rainbow.length,
  };
}

/**
 * The showers the sky is showing: the meadow's span, and the one a new
 * shower replaced, with when the scene saw it go, which still dries and
 * still fades its rainbow out.
 */
export type Showers = {
  span: Rain | undefined;
  before: { rain: Rain; at: number } | undefined;
};

export const NO_SHOWERS: Showers = { span: undefined, before: undefined };

/**
 * `showers` once the meadow's span is `rain` at `now`: a restart pushes the
 * same shower's end and keeps what it replaced; a new start puts the old
 * span behind it.
 */
export function nextShowers(
  showers: Showers,
  rain: Rain | undefined,
  now: number,
): Showers {
  const was = showers.span;
  if (rain === was) return showers;
  if (was === undefined || rain?.startedAt === was.startedAt) {
    return { ...showers, span: rain };
  }
  return { span: rain, before: { rain: was, at: now } };
}

/**
 * How wet the sky shows at `now`, from 0 to 1: the wetter of the shower and
 * the one it replaced, so a shower started as the last one dries never
 * lifts the gloom at once.
 */
export function wetnessShown(
  { span: rain, before }: Showers,
  now: number,
): number {
  return Math.max(wetness(rain, now), wetness(before?.rain, now));
}

/**
 * How far behind the cloud that started the shower, standing at `lead`, a
 * cloud at `azimuth` darkens, in ms: in step with it alongside, by
 * `DARKEN_LAG_MS` opposite it round the sky. With no cloud tapped, half that
 * for every cloud.
 */
export function cloudLag(azimuth: number, lead: number | undefined): number {
  if (lead === undefined) return DARKEN_LAG_MS / 2;
  return (DARKEN_LAG_MS * Math.abs(wrap(azimuth - lead))) / Math.PI;
}

/** How dark a cloud lagging `lag` ms (`cloudLag`) is at `now`, from 0 to 1. */
export function cloudDarkness(
  showers: Showers,
  now: number,
  lag: number,
): number {
  return wetnessShown(showers, now - lag);
}

/**
 * How strongly the rainbow shows at `now`, from 0 to 1: the shower's own,
 * or the one a new shower started under fading from where it stood over
 * `RAINBOW_OUT_MS`, the model's having dropped to 0 at once.
 */
export function rainbowShown(
  { span: rain, before }: Showers,
  now: number,
): number {
  const fading =
    before === undefined
      ? 0
      : rainbow(before.rain, before.at) *
        (1 - smooth((now - before.at) / RAINBOW_OUT_MS));
  return Math.max(rainbow(rain, now), fading);
}

/**
 * Which of `clouds`, each where the screen shows it now (`undefined` while
 * off it), a tap at `at` lands on: within its drawn puffs across, and at
 * least `TAP_RADIUS` up and down from its middle line; of several, the one
 * whose middle is nearest across.
 */
export function cloudAt(
  at: Point,
  clouds: ReadonlyArray<Circle | undefined>,
): number | undefined {
  let found: number | undefined;
  let nearest = Infinity;
  for (const [index, cloud] of clouds.entries()) {
    if (!cloud) continue;
    const { x, y, r } = cloud;
    const across = Math.abs(at.x - x);
    const down = at.y - y;
    const reach = Math.max(TAP_RADIUS, r);
    const below = Math.max(TAP_RADIUS, r * CLOUD_BELOW);
    if (across > r * CLOUD_SPREAD || down < -reach || down > below) continue;
    if (across < nearest) {
      nearest = across;
      found = index;
    }
  }
  return found;
}
