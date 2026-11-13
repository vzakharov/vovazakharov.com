import { vecf, wgsl } from '../shader/wgsl';

/**
 * Pure sea water's absorption per metre, red to blue, with a little of the
 * green a coast's water carries (Pope & Fry 1997 for the water itself; Morel
 * & Maritorena 2001 for what lives in it).
 */
const ABSORB = [0.42, 0.063, 0.022] as const;
/** Sea water's backscatter per metre, red to blue (Morel & Maritorena 2001). */
const BACKSCATTER = [0.0035, 0.0048, 0.0062] as const;
/** The share of what a coast's water scatters that goes backward (Petzold 1972). */
const BACKWARD_SHARE = 0.0183;
/** What a beam loses per metre, absorbed or scattered out of its line. */
const ATTENUATE = ABSORB.map(
  (absorb, channel) => absorb + (BACKSCATTER[channel] ?? 0) / BACKWARD_SHARE,
);

/** The numbers above, but the backward share, as WGSL constants of those names. */
export const WATER_OPTICS = wgsl(
  'sea/water-optics',
  /* wgsl */ `
const ABSORB = ${vecf(ABSORB)};
const BACKSCATTER = ${vecf(BACKSCATTER)};
const ATTENUATE = ${vecf(ATTENUATE)};
`,
);
