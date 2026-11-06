import { type CoastField, sampleCoastField } from './coast-field';
import { noiseSalt, valueNoise } from './value-noise';

/** The interior's base height, approached with distance from the coast. */
const PLATEAU_METRES = 1000;
/** The distance inland over which the plateau climbs to ~63% of its height. */
const PLATEAU_REACH_METRES = 180_000;

/** The ocean's depth far from the coast. */
const ABYSS_METRES = 3500;
/** The distance offshore over which the sea floor falls to ~63% of it. */
const SHELF_REACH_METRES = 30_000;

/** Noise octaves, longest first, each half the wavelength of the last. */
const OCTAVES = 16;
const LONGEST_WAVELENGTH_METRES = 400_000;
/** The longest octave's amplitude; each shorter one keeps `GAIN` of it. */
const LONGEST_AMPLITUDE_METRES = 700;
/** 0.6 per halving keeps ~0.3 m of relief at the 12 m octave. */
const GAIN = 0.6;
/**
 * How much of the landform octaves — wavelengths of `LANDFORM_METRES` and
 * up — survives at the coast and at sea. The shorter octaves keep their full
 * size everywhere, so the ground underfoot is never flat.
 */
const COASTAL_ROUGHNESS = 0.25;
const LANDFORM_METRES = 5000;
/** The distance inland over which the noise grows to ~63% of its full size. */
const ROUGHNESS_REACH_METRES = 300_000;

type Octave = {
  layer: number;
  frequency: number;
  amplitude: number;
  cos: number;
  sin: number;
  wavelength: number;
};

/** Each octave turned against the last so their lattices never line up. */
const OCTAVE_TABLE: readonly Octave[] = Array.from(
  { length: OCTAVES },
  (_, o) => {
    const wavelength = LONGEST_WAVELENGTH_METRES / 2 ** o;
    return {
      layer: o,
      wavelength,
      frequency: 1 / wavelength,
      amplitude: LONGEST_AMPLITUDE_METRES * GAIN ** o,
      cos: Math.cos(0.618 * (o + 1)),
      sin: Math.sin(0.618 * (o + 1)),
    };
  },
);

/** A smooth 0→1 ramp over `[0, 1]`, flat past it. */
const ramp = (t: number) => (t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * Metres above sea level at plane point `(x, y)` metres, negative offshore —
 * a pure function of the field and the seed (read as a 32-bit integer).
 *
 * A plateau climbs with distance from the coast, and the sea floor falls
 * away offshore. Value noise rides on both, its octaves from 400 km down to
 * 12 m growing in amplitude inland, each octave faded out within one of its
 * own wavelengths of the coastline, so the drawn coast stays where it is at
 * every scale but the finest, where the shore wanders by metres.
 */
export function heightAt(
  field: CoastField,
  seed: number,
  x: number,
  y: number,
): number {
  const d = sampleCoastField(field, x, y);
  const base =
    d >= 0
      ? PLATEAU_METRES * (1 - Math.exp(-d / PLATEAU_REACH_METRES))
      : -ABYSS_METRES * (1 - Math.exp(d / SHELF_REACH_METRES));
  const roughness =
    d > 0
      ? COASTAL_ROUGHNESS +
        (1 - COASTAL_ROUGHNESS) * (1 - Math.exp(-d / ROUGHNESS_REACH_METRES))
      : COASTAL_ROUGHNESS;
  const away = Math.abs(d);
  let landforms = 0;
  let texture = 0;
  for (const octave of OCTAVE_TABLE) {
    const fade = ramp(away / octave.wavelength);
    if (fade === 0) continue;
    const u = (x * octave.cos - y * octave.sin) * octave.frequency;
    const v = (x * octave.sin + y * octave.cos) * octave.frequency;
    const salt = noiseSalt(seed, octave.layer);
    const value = octave.amplitude * fade * valueNoise(salt, u, v);
    if (octave.wavelength >= LANDFORM_METRES) landforms += value;
    else texture += value;
  }
  return base + roughness * landforms + texture;
}
