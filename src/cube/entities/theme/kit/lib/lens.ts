import type { Rgb } from '@/cube/shared/lib/colour';
import { vec3f } from '@/cube/shared/shader';

import type { Aired } from '../model/theme';
import type { Exposed } from './grade';

/** A floor's air and lens, as numbers. */
export type Graded = Aired &
  Exposed & {
    /** The light left with every other light gone. */
    ambient: Rgb;
    /** Metres at which the air has swallowed about two thirds of a thing. */
    visibility: number;
    /** How far bright things bleed, and how far colours part in the corners. */
    glow: number;
    fringe: number;
    /** How far the screen's corners darken, and how strong the grain is. */
    vignette: number;
    noise: number;
  };

/** `light`, a WGSL expression for the point `s`'s light, seen through `look`'s air. */
export const hazed = (light: string, look: Graded): string =>
  `haze(${light}, s, ${vec3f(look.air)}, ${look.visibility.toFixed(1)})`;

/** `themeLens` for a floor seen through `look`'s lens, over the `GRADE` piece. */
export const lensListing = (look: Graded): string => /* wgsl */ `
fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, ${look.glow.toFixed(3)}, ${look.fringe.toFixed(4)}) * ${look.exposure.toFixed(3)};
  return tonemap(seen) * vignette(l, ${look.vignette.toFixed(3)}) + grain(l) * ${look.noise.toFixed(4)};
}`;
