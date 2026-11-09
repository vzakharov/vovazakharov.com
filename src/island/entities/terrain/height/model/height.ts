import { type CoastField, sampleCoastField } from '../../coast-field';
import { groundSlope, OCTAVES, reliefAt } from './relief';
import { noiseSalt, valueNoise } from './value-noise';

/** Each octave turned against the last so their lattices never line up. */
const PLANE_OCTAVES = OCTAVES.map((octave) => ({
  ...octave,
  cos: Math.cos(0.618 * (octave.index + 1)),
  sin: Math.sin(0.618 * (octave.index + 1)),
}));

/**
 * An octave's steepest slope per unit of amplitude over its wavelength: the
 * quintic lattice ramp (15/8 of a step of 2, along both axes) bent by the
 * hump (×1.4), its coastal fade (a smoothstep, 1.5, over a distance changing
 * up to √2 per metre) and its detail fade (under 1).
 */
const OCTAVE_STEEPEST = 3.75 * Math.SQRT2 * 1.4 + 1.5 * Math.SQRT2 + 1;

/** `groundSlope` for the plane's two-axis lattices. */
export const GROUND_SLOPE = groundSlope(OCTAVE_STEEPEST);

/**
 * Metres above sea level at plane point `(x, y)` metres, negative offshore —
 * a pure function of the field and the seed (read as a 32-bit integer), the
 * octaves drawn on the plane (`reliefAt` gives the shape).
 */
export function heightAt(
  field: CoastField,
  seed: number,
  x: number,
  y: number,
  finest = 0,
): number {
  return reliefAt(
    sampleCoastField(field, x, y),
    finest,
    PLANE_OCTAVES,
    ({ index, cyclesPerMetre, cos, sin }) =>
      valueNoise(
        noiseSalt(seed, index),
        (x * cos - y * sin) * cyclesPerMetre,
        (x * sin + y * cos) * cyclesPerMetre,
      ),
  );
}
