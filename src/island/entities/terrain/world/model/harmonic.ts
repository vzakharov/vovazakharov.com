import {
  decodeNormal,
  decodeUniform,
  encodeNormal,
  encodeUniform,
} from './decode';
import type { Wavevector } from './layout';

/**
 * The envelope's scale `s`: `0.45 / √(Σ (e(k)/s)²)` over every `k ≠ 0` with
 * `|kx|, |ky| ≤ K`, which by Parseval makes the waves' expected variance over
 * the square `0.45²` — a harmonic and its conjugate, `2·e·f·cos(2πk·p + φ)`,
 * contribute `2·e(k)²·E[f²]` to it, and `k = 0` none, being the mean. Pinned
 * by a test against that sum.
 */
export const ENVELOPE_SCALE = 0.440_740_600_901_753_3;

/**
 * Wavevectors up to this length take a tenth of the envelope there: at full
 * strength the four `|k| = 1` modes tilt and shift the dome rather than carve
 * coast, yet our fitted island still needs some room in its lowest modes.
 */
const LOW_LENGTH = 1.5;
const LOW_SHARE = 0.1;

/**
 * `e(k) = s · |k|^-2`, but `0.1 · e(1.5)` for every `|k| ≤ 1.5`: harmonic
 * `k`'s amplitude per unit factor.
 */
export function envelope({ kx, ky }: Wavevector): number {
  const squared = kx * kx + ky * ky;
  return squared <= LOW_LENGTH ** 2
    ? (LOW_SHARE * ENVELOPE_SCALE) / LOW_LENGTH ** 2
    : ENVELOPE_SCALE / squared;
}

const TURN = 2 * Math.PI;

/** A complex Fourier coefficient. */
export type Coefficient = { re: number; im: number };

/**
 * Harmonic `k`'s coefficient `c_k = e(k) · factor · e^{iφ}` from its phase
 * and factor words, the phase uniform on `[0, 2π)` and the factor unit
 * normal. The field is `Σ c_k e^{2πi k·p}` over the half-plane and each
 * conjugate `c_{−k} = c̄_k`, `p` in units of the square's side, so `c_k` is
 * the field's `fft2` bin `k` over `n²`. `c_0` is its own conjugate and keeps
 * only the real part.
 */
export function coefficientOf(
  k: Wavevector,
  phaseWord: number,
  factorWord: number,
): Coefficient {
  const amplitude = envelope(k) * decodeNormal(factorWord);
  const phase = decodeUniform(phaseWord, 0, TURN);
  const isMean = k.kx === 0 && k.ky === 0;
  return {
    re: amplitude * Math.cos(phase),
    im: isMean ? 0 : amplitude * Math.sin(phase),
  };
}

/**
 * The phase and factor words `coefficientOf` reads nearest `c`: the factor
 * `|c| / e(k)` and the phase `arg c`, but for `k = 0` the factor `re / e(0)`,
 * either sign, at the phase word nearest 0.
 */
export function encodeCoefficient(
  k: Wavevector,
  { re, im }: Coefficient,
): { phaseWord: number; factorWord: number } {
  const e = envelope(k);
  if (k.kx === 0 && k.ky === 0) {
    return { phaseWord: 0, factorWord: encodeNormal(re / e) };
  }
  const angle = Math.atan2(im, re);
  return {
    phaseWord: encodeUniform(angle < 0 ? angle + TURN : angle, 0, TURN),
    factorWord: encodeNormal(Math.hypot(re, im) / e),
  };
}
