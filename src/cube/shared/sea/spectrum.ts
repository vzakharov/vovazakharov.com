/**
 * The open sea's wave spectrum: how much of the surface's variance travels at
 * each wavenumber and heading. Two seas are summed — a swell from far away and
 * the local wind's own waves — each a JONSWAP peak (Hasselmann et al. 1973)
 * spread about its heading as cos^2s (Mitsuyasu et al. 1975).
 */

import { HOUR_SECONDS, RADIANS_A_TURN, SEA_GRAVITY } from '../outside/swell';

/** Wavenumber at which surface tension pulls as hard as gravity, rad/m. */
const CAPILLARY = 370;

/** One sea: a peak, how tall, how sharp, where it is going and how spread. */
export type Sea = {
  /** Angular frequency of the peak, rad/s. */
  peakOmega: number;
  /** Significant wave height, metres: four standard deviations of the surface. */
  significant: number;
  /** JONSWAP's peak enhancement; 1 is a fully developed sea, 3.3 a young one. */
  sharpness: number;
  /** Where it travels, radians from +x toward +z. */
  towards: number;
  /** The cos^2s exponent at the peak; swell is narrow (large), wind sea broad. */
  narrowness: number;
  /**
   * How the ripples depart from the bare shape: the tail is multiplied by
   * (1 + k / RIPPLE_BEND)^tailBend. `rippled` sets it for a wind sea; 0 leaves the
   * tail alone.
   */
  tailBend: number;
};

/** Deep-water angular frequency at wavenumber `k`, gravity and capillary. */
export const dispersion = (k: number): number =>
  Math.sqrt(SEA_GRAVITY * k * (1 + (k / CAPILLARY) ** 2));

/** dω/dk at wavenumber `k`: the speed a group of such waves travels at. */
export const groupSpeed = (k: number): number =>
  (SEA_GRAVITY * (1 + 3 * (k / CAPILLARY) ** 2)) / (2 * dispersion(k));

/**
 * Whole turns per hour of a wave of wavenumber `k`. Every component's
 * frequency is a multiple of one turn an hour, which is what brings the whole
 * sea back to itself when the clock's hour wraps.
 */
export const turnsPerHour = (k: number): number =>
  Math.max(1, Math.round((dispersion(k) * HOUR_SECONDS) / RADIANS_A_TURN));

/** The JONSWAP shape at `omega`, unscaled: the peak's value is of order 1. */
function shape(omega: number, { peakOmega: peak, sharpness }: Sea): number {
  const ratio = omega / peak;
  const width = omega <= peak ? 0.07 : 0.09;
  const bump = Math.exp(-((ratio - 1) ** 2) / (2 * width ** 2));
  return ratio ** -5 * Math.exp(-1.25 * ratio ** -4) * sharpness ** bump;
}

/** ln Γ(x) for x > 0 (Lanczos, g = 7). */
function logGamma(x: number): number {
  const coefficients = [
    0.999_999_999_999_809_9, 676.520_368_121_885_1, -1259.139_216_722_402_8,
    771.323_428_777_653_1, -176.615_029_162_140_6, 12.507_343_278_686_905,
    -0.138_571_095_265_720_12, 9.984_369_578_019_572e-6,
    1.505_632_735_149_311_6e-7,
  ];
  const at = x - 1;
  let sum = 0;
  for (const [index, coefficient] of coefficients.entries()) {
    sum += index === 0 ? coefficient : coefficient / (at + index);
  }
  const t = at + 7.5;
  return (
    0.5 * Math.log(2 * Math.PI) + (at + 0.5) * Math.log(t) - t + Math.log(sum)
  );
}

/**
 * The share of a sea's energy at `omega` heading `theta`, per radian: it
 * integrates to 1 round the compass at every frequency.
 */
export function spreading(omega: number, theta: number, sea: Sea): number {
  const ratio = omega / sea.peakOmega;
  const s = Math.max(
    1,
    sea.narrowness * (ratio <= 1 ? ratio ** 5 : ratio ** -2.5),
  );
  const norm = Math.exp(
    logGamma(s + 1) - logGamma(s + 0.5) - Math.log(2 * Math.sqrt(Math.PI)),
  );
  const half = Math.cos((theta - sea.towards) / 2);
  return norm * Math.abs(half) ** (2 * s);
}

/** Wavenumber, rad/m, past which a sea's `tailBend` exponent bends its spectrum. */
const RIPPLE_BEND = 10;

const thinning = (k: number, { tailBend }: Sea): number =>
  (1 + k / RIPPLE_BEND) ** tailBend;

/** Sample points, log-spaced, a quadrature over wavenumber runs on. */
const QUADRATURE = 2048;
const K_FLOOR = 1e-3;
/** Past this, rad/m, viscosity has taken the ripples. */
export const K_CEILING = 1000;

/**
 * ∫ weight(k) · shape · thinning dk over [`from`, `to`], the shape taken in
 * wavenumber: the omnidirectional spectrum before it is scaled to a height.
 */
function integral(
  sea: Sea,
  weight: (k: number) => number,
  from = K_FLOOR,
  to = K_CEILING,
): number {
  const step = Math.log(to / from) / QUADRATURE;
  let sum = 0;
  for (let index = 0; index < QUADRATURE; index += 1) {
    const k = from * Math.exp((index + 0.5) * step);
    sum +=
      weight(k) *
      shape(dispersion(k), sea) *
      groupSpeed(k) *
      thinning(k, sea) *
      k *
      step;
  }
  return sum;
}

/** What scales the bare shape so the sea stands `sea.significant` tall. */
const scaleOf = (sea: Sea): number =>
  sea.significant ** 2 / 16 / integral(sea, () => 1);

/**
 * The mean square slope of `sea`'s waves between two wavenumbers: what the
 * glitter's width is made of.
 */
export const slopeVariance = (
  sea: Sea,
  from = K_FLOOR,
  to = K_CEILING,
): number => scaleOf(sea) * integral(sea, (k) => k * k, from, to);

/**
 * `sea` with its tail bent until its whole mean square slope is `slopes`.
 * A bare JONSWAP tail misjudges the ripples; Cox and Munk (1954) measured
 * from the sun's glitter how steep the surface really is.
 */
export function rippled(sea: Sea, slopes: number): Sea {
  let low = -2;
  let high = 2;
  for (let round = 0; round < 50; round += 1) {
    const middle = (low + high) / 2;
    if (slopeVariance({ ...sea, tailBend: middle }) > slopes) high = middle;
    else low = middle;
  }
  return { ...sea, tailBend: (low + high) / 2 };
}

/** Cox and Munk's mean square slope under a wind of `wind` m/s at 10 m. */
export const coxMunk = (wind: number): number => 0.003 + 0.005_12 * wind;

/**
 * A wind sea grown by `wind` m/s over `fetch` metres of water, travelling
 * toward `heading` — JONSWAP's own growth laws for its peak and height.
 */
export function windSea(wind: number, fetch: number, heading: number): Sea {
  const peak = 22 * (SEA_GRAVITY ** 2 / (wind * fetch)) ** (1 / 3);
  const height = 1.6e-3 * wind * Math.sqrt(fetch / SEA_GRAVITY);
  return rippled(
    {
      peakOmega: peak,
      significant: height,
      sharpness: 3.3,
      towards: heading,
      narrowness: 12,
      tailBend: 0,
    },
    coxMunk(wind),
  );
}

/**
 * How `seas` spread their variance over the wavenumber plane: `at(kx, kz)` is
 * m² per (rad/m)², and summed over the plane it is the surface's variance.
 */
export function spectrumOf(seas: readonly Sea[]): {
  at: (kx: number, kz: number) => number;
} {
  const scaled = seas.map((sea) => ({ sea, scale: scaleOf(sea) }));
  return {
    at: (kx, kz) => {
      const k = Math.hypot(kx, kz);
      if (k < K_FLOOR || k > K_CEILING) return 0;
      const omega = dispersion(k);
      const theta = Math.atan2(kz, kx);
      return scaled.reduce(
        (sum, { sea, scale }) =>
          sum +
          ((scale * shape(omega, sea) * groupSpeed(k) * thinning(k, sea)) / k) *
            spreading(omega, theta, sea),
        0,
      );
    },
  };
}
