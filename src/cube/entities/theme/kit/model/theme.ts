import type { Named } from '@/kernel/shared/typings';

import type { Sound } from '@/cube/shared/lib/acoustics';
import type { Rgb } from '@/cube/shared/lib/colour';
import type { Furnishing } from '@/cube/shared/lib/thing';
import { assemble, vec3f, type Wgsl, wgsl } from '@/cube/shared/shader';

import { CORE } from '../lib/core';
import { STUFF } from '../lib/stuff.shader.generated';

/**
 * One floor's look and sound, `name` the place in a word or three, as a
 * caption would have it. Its `shader` is WGSL over the kit defining the
 * three functions every floor answers with:
 *
 *   fn themeMaterial(s: Surf) -> Material          what the point is made of
 *   fn themeLight(s: Surf, m: Material) -> vec3f   that, lit, as scene light
 *   fn themeLens(l: Lens) -> vec3f                 a pixel of the frame an eye
 *                                                  on this floor sees
 */
export type FloorTheme = Named & {
  /** The air's colour: what shows where no face is drawn. */
  air: Rgb;
  /** Half a corner pillar's thickness, in room sides; 0 for none. */
  pillar: number;
  /** The share of rooms whose lamps have failed. */
  dark: number;
  shader: Wgsl;
  sound: Sound;
  decor: readonly Furnishing[];
};

/**
 * What stands at the head of a floor's shader. A material is chosen by the
 * face's kind, which the compiler cannot prove steady across a pixel's
 * neighbours; relief is measured across them all the same, and is wrong only
 * along an edge between two kinds, where it is not looked for.
 */
const DIRECTIVES = 'diagnostic(off, derivative_uniformity);';

/** Themes by the number of the floor each is for. */
export type Floors = Readonly<Partial<Record<number, FloorTheme>>>;

/**
 * A floor's whole shader: its theme's three functions, everything they call,
 * `AIR` — the theme's air, which its WGSL names without importing — the core
 * kit, and `stage`, the entry points, which call the theme's three without
 * importing them and import every kit name they use.
 */
export const floorSource = (
  { shader, air }: FloorTheme,
  ...stage: readonly Wgsl[]
): string =>
  `${DIRECTIVES}\n\n${assemble([
    wgsl('air', `const AIR = ${vec3f(air)};`),
    shader,
    STUFF,
    CORE,
    ...stage,
  ])}`;
