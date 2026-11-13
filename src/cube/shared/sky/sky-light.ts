import type { Rgb } from '../lib/colour';
import { dot3, type Vec3 } from '../lib/vec';
import {
  ATMOSPHERE,
  groundGlow,
  march,
  perChannel,
  rayEnd,
  sampleTable,
  scatteringAt,
  scatterTable,
  scatterUv,
  sunTransmittance,
} from './atmosphere';

/** The eye's radius: a person's height over the sea, which is all it ever is. */
export const EYE_RADIUS = ATMOSPHERE.ground + 0.002;

/** Rayleigh's phase function at cosine `c`, over the whole sphere. */
export const rayleighPhase = (c: number): number =>
  (3 / (16 * Math.PI)) * (1 + c * c);

/** Cornette and Shanks's phase function for asymmetry `g` at cosine `c`. */
export const miePhase = (c: number, g: number): number =>
  ((3 / (8 * Math.PI)) * ((1 - g * g) * (1 + c * c))) /
  ((2 + g * g) * (1 + g * g - 2 * g * c) ** 1.5);

const SKY_STEPS = 32;

/**
 * The clear sky along a ray, split by what turns with the angle to the sun:
 * its radiance is `rayleigh` and `mie`, each times its phase function, plus
 * `many`, which has none.
 */
export type SkyParts = Record<'rayleigh' | 'mie' | 'many', Rgb>;

/**
 * The clear sky along `dir` from the eye, under a sun toward `sun` of unit
 * irradiance: single scattering by each kind of air, and in `many` every
 * further order and the sea's own glow where the ray lands.
 */
export const skyParts = (dir: Vec3, sun: Vec3): SkyParts => {
  const between = dot3(dir, sun);
  const { reach, lands } = rayEnd(EYE_RADIUS, dir[1]);
  const ray = { r: EYE_RADIUS, mu: dir[1], sun: sun[1], between };
  const rayleigh = [0, 0, 0];
  const mie = [0, 0, 0];
  const { light, through } = march(
    ray,
    reach,
    SKY_STEPS,
    (radius, cosine, weigh) => {
      const s = scatteringAt(radius - ATMOSPHERE.ground);
      const direct = sunTransmittance(radius, cosine);
      const many = sampleTable(scatterTable(), ...scatterUv(radius, cosine));
      for (const c of [0, 1, 2] as const) {
        rayleigh[c] = (rayleigh[c] ?? 0) + weigh[c] * s.rayleigh[c] * direct[c];
        mie[c] = (mie[c] ?? 0) + weigh[c] * s.mie[c] * direct[c];
      }
      return perChannel((c) => (s.rayleigh[c] + s.mie[c]) * many[c]);
    },
  );
  const glow = lands
    ? groundGlow((EYE_RADIUS * sun[1] + reach * between) / ATMOSPHERE.ground)
    : ([0, 0, 0] as const);
  return {
    rayleigh: perChannel((c) => rayleigh[c] ?? 0),
    mie: perChannel((c) => mie[c] ?? 0),
    many: perChannel((c) => light[c] + through[c] * glow[c]),
  };
};

/** `parts` as one radiance, seen at cosine `between` to the sun. */
export const skyOf = (parts: SkyParts, between: number): Rgb => {
  const rayleigh = rayleighPhase(between);
  const mie = miePhase(between, ATMOSPHERE.mie.g);
  return perChannel(
    (c) => parts.rayleigh[c] * rayleigh + parts.mie[c] * mie + parts.many[c],
  );
};

/** The clear sky's radiance along `dir` from the eye, under that sun. */
export const clearSky = (dir: Vec3, sun: Vec3): Rgb =>
  skyOf(skyParts(dir, sun), dot3(dir, sun));

const FILL_RINGS = 8;
const FILL_SPOKES = 8;

/**
 * The light a matte white face gets from the half of the sky on the `up` side
 * (1 the sky, −1 the sea and the air under the horizon), per unit of sun
 * irradiance over π — the scale a sunlit face is measured in.
 */
export const hemisphereFill = (sun: Vec3, up: 1 | -1): Rgb => {
  const lift = Math.hypot(sun[0], sun[2]);
  const sum = [0, 0, 0];
  for (let i = 0; i < FILL_RINGS; i++) {
    // Even steps of the squared cosine weigh each ray by its cosine.
    const y = Math.sqrt((i + 0.5) / FILL_RINGS);
    const flat = Math.sqrt(1 - y * y);
    for (let j = 0; j < FILL_SPOKES; j++) {
      // Half a turn from the sun's side: the sky is the same on both hands.
      const turn = (Math.PI * (j + 0.5)) / FILL_SPOKES;
      const sky = clearSky(
        [flat * Math.cos(turn), up * y, flat * Math.sin(turn)],
        [lift, sun[1], 0],
      );
      for (const c of [0, 1, 2] as const) sum[c] = (sum[c] ?? 0) + sky[c];
    }
  }
  // The face shows the cosine-weighted mean radiance, and π of the scale's
  // units is one of radiance per unit of sun irradiance.
  return perChannel(
    (c) => ((sum[c] ?? 0) * Math.PI) / (FILL_RINGS * FILL_SPOKES),
  );
};

const RING_LIFT = (4 * Math.PI) / 180;
/** The ring's spokes start this far round from the sun, whose own glare a phase function carries. */
const RING_FROM = Math.PI / 4;

/**
 * The mean radiance of the sky just over the horizon, away from the sun's
 * own glare: what a cloud's flank is lit by from the side, per unit of sun
 * irradiance over π.
 */
export const horizonFill = (sun: Vec3): Rgb => {
  const lift = Math.hypot(sun[0], sun[2]);
  const sum = [0, 0, 0];
  for (let j = 0; j < FILL_SPOKES; j++) {
    const turn = RING_FROM + ((Math.PI - RING_FROM) * (j + 0.5)) / FILL_SPOKES;
    const sky = clearSky(
      [
        Math.cos(RING_LIFT) * Math.cos(turn),
        Math.sin(RING_LIFT),
        Math.cos(RING_LIFT) * Math.sin(turn),
      ],
      [lift, sun[1], 0],
    );
    for (const c of [0, 1, 2] as const) sum[c] = (sum[c] ?? 0) + sky[c];
  }
  return perChannel((c) => ((sum[c] ?? 0) * Math.PI) / FILL_SPOKES);
};

/** The contract's scale: what the brightest channel of a face square to the sun shows. */
const SUN_PEAK = 8;

/**
 * Every number the outside is lit by, from a sun toward `sun`: `white` is a
 * face square to the sun above the air, and the rest follow from the model.
 */
export const lightUnder = (
  sun: Vec3,
): Record<'sun' | 'sky' | 'ground' | 'horizon', Rgb> & { white: number } => {
  const reaching = sunTransmittance(EYE_RADIUS, sun[1]);
  const white = SUN_PEAK / Math.max(...reaching);
  const scaled = (light: Rgb): Rgb => perChannel((c) => light[c] * white);
  return {
    white,
    sun: scaled(reaching),
    sky: scaled(hemisphereFill(sun, 1)),
    ground: scaled(hemisphereFill(sun, -1)),
    horizon: scaled(horizonFill(sun)),
  };
};
