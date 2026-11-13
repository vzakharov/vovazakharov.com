import { CYCLE, dying, filterOf, noiseOf, sampled } from '../../dsp';

/** The pitch the boom comes to rest at, and how far above it it starts. */
const BOOM = { restHz: 34, dropHz: 70, dropsIn: 0.11, dies: 0.65 };

/**
 * The cube's sill crossed: the shut-off of the outside, from a sweep, ending in
 * a low boom — a sine falling to the bottom of what a speaker has, its second
 * harmonic over it for the speakers that have no bottom, and a muffled thump
 * for the first instant.
 */
export function threshold(
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const thump = filterOf('low', rate);
  let phase = 0;
  return sampled(1, rate, (t) => {
    const hz = BOOM.restHz + BOOM.dropHz * dying(t, BOOM.dropsIn);
    phase += hz / rate;
    const attack = Math.min(1, t / 0.008);
    const body = Math.sin(CYCLE * phase) + 0.45 * Math.sin(CYCLE * 2 * phase);
    const knock = 1.4 * thump(noise(), 140, 0.9) * dying(t, 0.05);
    return 1.5 * (attack * body * dying(t, BOOM.dies) + knock);
  });
}
