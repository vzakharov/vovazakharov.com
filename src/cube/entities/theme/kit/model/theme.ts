import type { Named } from '@/kernel/shared/typings';

import type { Rgb } from '@/cube/shared/lib/colour';
import type { Thing } from '@/cube/shared/lib/thing';

import { CORE } from '../lib/core';
import { STUFF } from '../lib/stuff';
import { assemble, type Wgsl, wgsl } from '../lib/wgsl';

/** What a floor is underfoot, which is how a step on it sounds. */
export const FOOTINGS = [
  'carpet',
  'tile',
  'concrete',
  'wood',
  'metal',
  'wet',
  'soft',
  'hollow',
] as const;
export type Footing = (typeof FOOTINGS)[number];

/** How a floor sounds with nobody on it. */
export type Sound = {
  footing: Footing;
  /** The lamps' hum, in hertz; 0 where they make none. */
  hum: number;
  /** Moving air, 0 (still) to 1 (a duct beside the ear). */
  air: number;
  /** How long a clap rings, in seconds. */
  echo: number;
};

/** One kind of thing a floor's rooms hold. */
export type Furnishing = {
  thing: Thing;
  /** How many of it a room holds on average: 0.2 is one room in five. */
  perRoom: number;
};

/** A place with air of a colour: what shows where no face is drawn. */
export type Aired = { air: Rgb };

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
export type FloorTheme = Named &
  Aired & {
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
 * and `stage` — the entry points, which may call the theme's three, the core
 * kit and `ownedMark`.
 */
export const floorSource = ({ shader }: FloorTheme, stage: string): string =>
  `${DIRECTIVES}\n\n${assemble([shader, STUFF, wgsl('stage', stage, CORE)])}`;
