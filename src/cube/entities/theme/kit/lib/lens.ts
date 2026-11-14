import type { Rgb } from '@/cube/shared/lib/colour';

/** A lens that lets in a share of the scene's light. */
export type Exposed = {
  /** What scene light is multiplied by before the film's curve. */
  exposure: number;
};

/** A lens that darkens towards the screen's corners. */
export type Vignetted = {
  /** How far the corners darken, 0 not at all. */
  vignette: number;
};

/**
 * A floor's lens and the air it looks through, as numbers. The air's colour
 * is the theme's own, `AIR` in its shader.
 */
export type Graded = Exposed &
  Vignetted & {
    /** The light left with every other light gone. */
    ambient: Rgb;
    /** Metres at which the air has swallowed about two thirds of a thing. */
    visibility: number;
    /** How far bright things bleed, and how far colours part in the corners. */
    glow: number;
    fringe: number;
    /** How strong the grain is. */
    noise: number;
  };

/** `light`, a WGSL expression for the point `s`'s light, seen through the floor's air. */
export const hazed = (light: string, look: Graded): string =>
  `haze(${light}, s, AIR, ${look.visibility.toFixed(1)})`;

/** `themeLens` for a floor seen through `look`'s lens, over the `GRADE` piece. */
export const lensListing = (look: Graded): string => /* wgsl */ `
fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, ${look.glow.toFixed(3)}, ${look.fringe.toFixed(4)}) * ${look.exposure.toFixed(3)};
  return tonemap(seen) * vignette(l, ${look.vignette.toFixed(3)}) + grain(l) * ${look.noise.toFixed(4)};
}`;
