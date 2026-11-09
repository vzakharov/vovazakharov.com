import { harmonicSlot } from '../../series';
import type { World } from './world-schema';

/** A degree's amplitude per unit normal. */
export type Envelope = (l: number) => number;

/** Flat to the knee, falling as `l^−slope` past it: `(knee² + l²)^(−slope/2)`. */
export const kneeEnvelope =
  (knee: number, slope: number): Envelope =>
  (l) =>
    (knee * knee + l * l) ** (-slope / 2);

/** The lead's probe's envelope: knee 6, slope 2. */
export const PROBE_ENVELOPE = kneeEnvelope(6, 2);

/**
 * The sea's decode, in units of the field's expected deviation `σ` over the
 * sphere: the land's mean is `σ·(SEA_MEAN + SEA_SPREAD·sea)`, so a world's
 * land share is about `Φ(SEA_MEAN + SEA_SPREAD·sea)`. At the probe's envelope
 * they give worlds 1 to 50 a mean land share of 29.0%, Earth's, ranging 23% to
 * 36% — pinned by a test at a lower degree, where the share barely moves.
 */
export const SEA_MEAN = -0.556;
export const SEA_SPREAD = 0.1;

/**
 * `σ`: the deviation over the sphere that `Σ_{l ≥ 1} env(l)·Y_lm·normal`
 * has in expectation, `√(Σ_l (2l + 1)·env(l)² / 4π)`.
 */
export function fieldDeviation(envelope: Envelope, degree: number): number {
  let variance = 0;
  for (let l = 1; l <= degree; l += 1)
    variance += (2 * l + 1) * envelope(l) ** 2;
  return Math.sqrt(variance / (4 * Math.PI));
}

/**
 * The land's series up to `degree`, at `sphere-series`'s slots: `c_00` from
 * the sea (`Y_00 = 1/√(4π)` turning the mean into it), and
 * `c_lm = env(l)·harmonic(l, m)`.
 */
export function landSeries(
  { sea, harmonic }: World['land'],
  degree: number,
  envelope: Envelope,
): Float64Array {
  const c = new Float64Array((degree + 1) ** 2);
  const sigma = fieldDeviation(envelope, degree);
  c[0] = Math.sqrt(4 * Math.PI) * sigma * (SEA_MEAN + SEA_SPREAD * sea);
  for (let l = 1; l <= degree; l += 1) {
    const amplitude = envelope(l);
    for (let m = -l; m <= l; m += 1) {
      c[harmonicSlot(l, m)] = amplitude * harmonic.at({ l, m });
    }
  }
  return c;
}
