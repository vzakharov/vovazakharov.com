/**
 * Where the sun and the moon stand as the light turns, what of the sky a tap
 * on either reaches, which stars the moon's halo leaves showing and which
 * clouds pass in front of it: pure, from the sun's screen point and the
 * meadow's `duskness`.
 */

import type { Circle, Point } from '../../model/geometry';
import { smooth } from '../../model/motion';
import { cloudBox } from './cloud-puffs';
import { STAR_RAY_REACH } from './dusk-stars';
import { shiftOf } from './panorama';
import { SUN_RAY_REACH } from './sun-layout';
import { TAP_RADIUS } from './tap-reach';
import type { View } from './view';

/** How far the sun sinks toward the hills by full dusk, in its radii. */
const SUN_SINK = 0.4;
/** How far below the sun's place the moon starts its rise, in its radii. */
const MOON_RISE = 0.5;
/**
 * How far past the moon's halo, in its radii, a star fades back in: a star
 * at the halo's edge is gone, one this much further out shows whole.
 */
const STAR_FADE = 0.3;
/** How far toward dusk the sun is gone and the moon starts to show. */
const HAND_OVER = 0.5;

/**
 * The sun's place on the screen as `view` shows it, unsunk: where the moon
 * rises, the tap turns the light and the stars keep clear of.
 */
export function sunOnScreen(view: View, sun: Circle): Circle {
  return { ...sun, x: sun.x + shiftOf(view, sun.x) };
}

/** How far below its place the sun stands `level` of the way to dusk, in CSS px. */
export function sunSunk(r: number, level: number): number {
  return SUN_SINK * r * level;
}

/**
 * How much of the sun shows `level` of the way to dusk, 1 by day: gone by
 * `HAND_OVER`, before the moon shows at all, so the two rosettes never lie
 * one through the other.
 */
export function sunUp(level: number): number {
  return 1 - smooth(level / HAND_OVER);
}

/** How much of the moon shows `level` of the way to dusk: none until `HAND_OVER`, whole at dusk. */
export function moonUp(level: number): number {
  return smooth((level - HAND_OVER) / (1 - HAND_OVER));
}

/** How far below the sun's place the moon stands `level` of the way to dusk, in CSS px. */
export function moonBelow(r: number, level: number): number {
  return MOON_RISE * r * (1 - level);
}

/** How far from the sun's screen point a tap turns the light: its drawn rays, at least a finger's reach. */
export function duskReach(r: number): number {
  return Math.max(TAP_RADIUS, r * SUN_RAY_REACH);
}

/**
 * Whether a tap at `at` lands on the sun, or the moon in its place, standing
 * at `sun`: anywhere its rays reach (`duskReach`), or on its drawn disc alone
 * — the reach a cloud's tap box, wider than its puffs, never takes from it.
 */
export function onTheSun(
  sun: Circle,
  at: Point,
  within: 'disc' | 'rays',
): boolean {
  const reach = within === 'disc' ? sun.r : duskReach(sun.r);
  return Math.hypot(at.x - sun.x, at.y - sun.y) <= reach;
}

/**
 * The moon `level` of the way to dusk, risen toward the sun's place `sun`
 * on the screen.
 */
export function moonAt(sun: Circle, level: number): Circle {
  return { ...sun, y: sun.y + moonBelow(sun.r, level) };
}

/**
 * How much of `star` shows beside `moon`, 0 to 1: nothing of it anywhere the
 * moon's halo reaches — rays to rays — fading in over `STAR_FADE` of the
 * moon's radii beyond, so a turn of the eye never puts a star in its halo.
 */
export function starClear(star: Circle, moon: Circle): number {
  const gone = moon.r * SUN_RAY_REACH + star.r * STAR_RAY_REACH[1];
  const apart = Math.hypot(star.x - moon.x, star.y - moon.y) - gone;
  return Math.min(1, Math.max(0, apart / (moon.r * STAR_FADE)));
}

/**
 * Whether `cloud`'s drawn puffs may reach over `moon` or its halo: the
 * clouds that drift in front of it, which it is cut round.
 */
export function cloudOverMoon(cloud: Circle, moon: Circle): boolean {
  const { left, right, top, bottom } = cloudBox(cloud);
  const reach = moon.r * SUN_RAY_REACH;
  return (
    left < moon.x + reach &&
    right > moon.x - reach &&
    top < moon.y + reach &&
    bottom > moon.y - reach
  );
}

/**
 * Whether the page is dark: Mantine's resolved scheme on `<html>` when it
 * writes one (`light` or `dark`), else the system's preference — the
 * Artifact has no Mantine.
 */
export function darkScheme(
  mantine: string | undefined,
  prefersDark: boolean,
): boolean {
  return mantine === 'dark' || mantine === 'light'
    ? mantine === 'dark'
    : prefersDark;
}
