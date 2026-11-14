import { ATMOSPHERE, SUN_DIR, SUN_WHITE } from '@/cube/shared/outside';
import { f32, vecf, wgsl } from '@/cube/shared/shader';

import { EYE_SUN } from './clear-sky-fit';

/**
 * The share of the haze's scattering that goes into the two narrow forward
 * lobes large droplets throw: the glare a degree from the limb, and the
 * aureole ten degrees wide. The broad lobe is the fitted sky's.
 */
const AUREOLE = [
  { g: 0.99, share: 0.02 },
  { g: 0.95, share: 0.06 },
] as const;

/** Kasten and Young's air mass along a ray `lift` radians over the horizon. */
const KASTEN = { a: 0.505_72, b: 6.079_95, c: -1.6364 } as const;
const airMass = (lift: number): number =>
  1 /
  (Math.sin(lift) + KASTEN.a * ((lift * 180) / Math.PI + KASTEN.b) ** KASTEN.c);

const BROAD = AUREOLE[1];

/**
 * The broad lobe's glow per unit of its phase function, along the ray to the
 * sun itself: what `sunHalo` spreads round the sun.
 */
const HALO = EYE_SUN.map(
  (reaching, channel) =>
    SUN_WHITE *
    Math.PI *
    BROAD.share *
    reaching *
    (ATMOSPHERE.mie.scatter[channel] ?? 0) *
    ATMOSPHERE.mie.height *
    airMass(Math.asin(SUN_DIR[1])),
);

/**
 * The glow's numbers as WGSL constants: the two lobes' asymmetry and share,
 * Kasten and Young's three, the haze's optical depth straight up, and the
 * broad lobe's glow along the ray to the sun.
 */
export const SUN_GLOW_NUMBERS = wgsl(
  'sky/sun-glow-numbers',
  /* wgsl */ `
const GLARE_G = ${f32(AUREOLE[0].g)};
const GLARE_SHARE = ${f32(AUREOLE[0].share)};
const AUREOLE_G = ${f32(BROAD.g)};
const AUREOLE_SHARE = ${f32(BROAD.share)};
const KASTEN_A = ${f32(KASTEN.a)};
const KASTEN_B = ${f32(KASTEN.b)};
const KASTEN_C = ${f32(KASTEN.c)};
const HAZE_OVERHEAD = ${vecf(ATMOSPHERE.mie.scatter.map((perKm) => perKm * ATMOSPHERE.mie.height))};
const SUN_HALO = ${vecf(HALO)};
`,
);
