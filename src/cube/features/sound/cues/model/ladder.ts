import type { Ladder, Limb } from '@/cube/shared/lib/acoustics';

import {
  dying,
  filterOf,
  noiseOf,
  ringing,
  sampled,
  type Sounding,
  type Struck,
} from '../../dsp';

/** How a ladder answers a limb on a rung. */
type Rung = Sounding & {
  /** The rattle of the ladder against the sill and in its own joints. */
  rattle: Struck & { resonance: number };
};

const RUNGS: Record<Ladder, Rung> = {
  // A hollow extrusion: bright, inharmonic, and it sings for a while.
  aluminium: {
    seconds: 0.55,
    modes: [
      { hz: 286, dies: 0.16, force: 0.3 },
      { hz: 742, dies: 0.4, force: 0.34 },
      { hz: 1388, dies: 0.34, force: 0.26 },
      { hz: 2217, dies: 0.26, force: 0.18 },
      { hz: 3470, dies: 0.16, force: 0.1 },
    ],
    rattle: { hz: 3100, dies: 0.09, force: 0.5, resonance: 1.2 },
  },
  // A turned stick in its sockets: a knock, and the joint's dry creak.
  wood: {
    seconds: 0.32,
    modes: [
      { hz: 212, dies: 0.07, force: 0.5 },
      { hz: 498, dies: 0.05, force: 0.34 },
      { hz: 1130, dies: 0.03, force: 0.16 },
    ],
    rattle: { hz: 1300, dies: 0.07, force: 0.35, resonance: 2.5 },
  },
};

/** How hard each limb comes down, and the weight behind it. */
const LIMBS: Record<Limb, { push: number; weight: Struck; pitch: number }> = {
  hand: {
    push: 0.55,
    weight: { hz: 150, dies: 0.03, force: 0.15 },
    pitch: 1.12,
  },
  foot: { push: 1, weight: { hz: 78, dies: 0.07, force: 0.6 }, pitch: 1 },
};

/** Seconds the first contact's slap lasts. */
const SLAP_DIES = 0.006;

/**
 * A `limb` coming down on a rung of a `ladder`: the slap of the contact, the
 * rung ringing as its material does, and the ladder shifting against the sill.
 * `seed` moves which part of the rung is struck, so no two rungs are one
 * sound.
 */
export function rung(
  ladder: Ladder,
  limb: Limb,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const { seconds, modes, rattle } = RUNGS[ladder];
  const { push, weight, pitch } = LIMBS[limb];
  const noise = noiseOf(seed);
  const tune = pitch * (1 + 0.05 * noise());
  // Where along the rung it lands decides how much of each mode it wakes.
  const woken = modes.map(() => 0.55 + 0.45 * Math.abs(noise()));
  const shaken = filterOf('band', rate);
  const rattles = 0.02 + 0.015 * Math.abs(noise());
  return sampled(seconds, rate, (t) => {
    const rang = modes.reduce(
      (sum, mode, index) => sum + (woken[index] ?? 1) * ringing(mode, t, tune),
      0,
    );
    const slap = 0.5 * noise() * dying(t, SLAP_DIES);
    const shifted =
      rattle.force *
      shaken(noise(), rattle.hz * tune, rattle.resonance) *
      dying(t - rattles, rattle.dies);
    return push * (rang + slap + shifted + ringing(weight, t));
  });
}
