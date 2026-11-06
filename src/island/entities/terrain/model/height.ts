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

/** The longest noise octave; each next one halves the wavelength. */
const LONGEST_WAVELENGTH_METRES = 400_000;
/**
 * Each octave's amplitude in metres, longest first (400 km … 6 m). The
 * regional band (400–50 km) falls fast; the hill band (25 km–400 m) slowly,
 * so hills of a hundred metres and more stand over a few kilometres; the
 * fine band halves per halving — a constant slope of ~0.1 per octave — so
 * every scale down to a step's length has relief and none is a cliff.
 */
const AMPLITUDES_METRES = [
  600, 380, 260, 200, 240, 220, 190, 150, 110, 75, 45, 20, 10, 5, 2.5, 1.25,
  0.6,
] as const;
/**
 * How much of the regional octaves — wavelengths of `REGIONAL_METRES` and
 * up — survives at the coast and at sea. The shorter octaves keep their full
 * size everywhere, faded only near the coastline, so every lowland has hills.
 */
const COASTAL_ROUGHNESS = 0.25;
const REGIONAL_METRES = 50_000;
/** The distance inland over which the noise grows to ~63% of its full size. */
const ROUGHNESS_REACH_METRES = 300_000;
/** The shortest octave of the hill band, whose noise is `humped`. */
const HILL_METRES = 300;

/**
 * Noise in `[-1, 1]` bent onto `[-0.23, 1]` by a parabola, flat at the
 * bottom: hills rise to full height and valleys stay broad and shallow, so
 * the hill band sinks no lowland below the sea.
 */
const humped = (n: number) => n * (0.6 + 0.4 * n);

type Octave = {
  layer: number;
  cyclesPerMetre: number;
  amplitude: number;
  cos: number;
  sin: number;
  wavelength: number;
  regional: boolean;
  hill: boolean;
};

/** Each octave turned against the last so their lattices never line up. */
const OCTAVE_TABLE: readonly Octave[] = AMPLITUDES_METRES.map(
  (amplitude, o) => {
    const wavelength = LONGEST_WAVELENGTH_METRES / 2 ** o;
    return {
      layer: o,
      wavelength,
      cyclesPerMetre: 1 / wavelength,
      amplitude,
      regional: wavelength >= REGIONAL_METRES,
      hill: wavelength < REGIONAL_METRES && wavelength >= HILL_METRES,
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
 * 6 m, the regional ones growing in amplitude inland, each faded out within one of its
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
  let regional = 0;
  let local = 0;
  for (const octave of OCTAVE_TABLE) {
    const fade = ramp(away / octave.wavelength);
    if (fade === 0) continue;
    const u = (x * octave.cos - y * octave.sin) * octave.cyclesPerMetre;
    const v = (x * octave.sin + y * octave.cos) * octave.cyclesPerMetre;
    const salt = noiseSalt(seed, octave.layer);
    const noise = valueNoise(salt, u, v);
    const value =
      octave.amplitude * fade * (octave.hill ? humped(noise) : noise);
    if (octave.regional) regional += value;
    else local += value;
  }
  return base + roughness * regional + local;
}
