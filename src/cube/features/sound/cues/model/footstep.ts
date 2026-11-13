import type { Underfoot } from '@/cube/shared/lib/acoustics';
import { clamp01 } from '@/cube/shared/lib/ease';

import {
  dying,
  filterOf,
  noiseOf,
  ringing,
  sampled,
  type Sounding,
  type Struck,
} from '../../dsp';

/** The sole's scrape: noise through a band that may slide as it dies. */
type Scuff = Struck & {
  resonance: number;
  /** Octaves the band rises over the scuff's life: a wet floor's squelch. */
  sweep: number;
};

/** How one footing answers a foot, and for how long. */
type Tread = Sounding & {
  /** The heel's weight. */
  thump: Struck;
  scuff: Scuff;
  /** The hard edge of the first contact, 0 for none. */
  click: number;
};

const TREADS: Record<Underfoot, Tread> = {
  carpet: {
    seconds: 0.16,
    thump: { hz: 70, dies: 0.05, force: 0.5 },
    scuff: { hz: 900, dies: 0.07, force: 0.4, resonance: 0.7, sweep: 0 },
    click: 0,
    modes: [],
  },
  tile: {
    seconds: 0.14,
    thump: { hz: 110, dies: 0.03, force: 0.35 },
    scuff: { hz: 3200, dies: 0.03, force: 0.5, resonance: 1.2, sweep: 0 },
    click: 0.5,
    modes: [{ hz: 1900, dies: 0.03, force: 0.15 }],
  },
  concrete: {
    seconds: 0.16,
    thump: { hz: 90, dies: 0.04, force: 0.55 },
    scuff: { hz: 1800, dies: 0.05, force: 0.5, resonance: 0.8, sweep: 0 },
    click: 0.25,
    modes: [],
  },
  wood: {
    seconds: 0.24,
    thump: { hz: 140, dies: 0.06, force: 0.55 },
    scuff: { hz: 1200, dies: 0.04, force: 0.3, resonance: 1, sweep: 0 },
    click: 0.2,
    modes: [
      { hz: 310, dies: 0.09, force: 0.35 },
      { hz: 540, dies: 0.06, force: 0.2 },
    ],
  },
  metal: {
    seconds: 0.7,
    thump: { hz: 120, dies: 0.04, force: 0.3 },
    scuff: { hz: 2500, dies: 0.03, force: 0.25, resonance: 1, sweep: 0 },
    click: 0.4,
    modes: [
      { hz: 523, dies: 0.5, force: 0.3 },
      { hz: 1187, dies: 0.35, force: 0.22 },
      { hz: 1931, dies: 0.25, force: 0.15 },
      { hz: 2764, dies: 0.18, force: 0.1 },
    ],
  },
  wet: {
    seconds: 0.26,
    thump: { hz: 80, dies: 0.04, force: 0.35 },
    scuff: { hz: 1100, dies: 0.14, force: 0.7, resonance: 2.5, sweep: 1.4 },
    click: 0,
    modes: [],
  },
  soft: {
    seconds: 0.22,
    thump: { hz: 55, dies: 0.09, force: 0.6 },
    scuff: { hz: 400, dies: 0.1, force: 0.25, resonance: 0.7, sweep: 0 },
    click: 0,
    modes: [],
  },
  hollow: {
    seconds: 0.5,
    thump: { hz: 75, dies: 0.16, force: 0.7 },
    scuff: { hz: 1000, dies: 0.04, force: 0.25, resonance: 0.8, sweep: 0 },
    click: 0.1,
    modes: [
      { hz: 150, dies: 0.22, force: 0.4 },
      { hz: 226, dies: 0.16, force: 0.2 },
    ],
  },
  sand: {
    seconds: 0.3,
    thump: { hz: 46, dies: 0.07, force: 0.4 },
    scuff: { hz: 2600, dies: 0.16, force: 0.55, resonance: 0.5, sweep: -0.9 },
    click: 0,
    modes: [],
  },
  'wet-sand': {
    seconds: 0.28,
    thump: { hz: 62, dies: 0.06, force: 0.55 },
    scuff: { hz: 1500, dies: 0.12, force: 0.5, resonance: 1.4, sweep: 0.8 },
    click: 0,
    modes: [],
  },
  shallows: {
    seconds: 0.45,
    thump: { hz: 70, dies: 0.05, force: 0.3 },
    scuff: { hz: 1900, dies: 0.3, force: 0.8, resonance: 0.6, sweep: -0.7 },
    click: 0,
    modes: [],
  },
};

/** Seconds a step on `footing` lasts. */
export const stepSeconds = (footing: Underfoot): number =>
  TREADS[footing].seconds;

/** Seconds the first contact's click lasts. */
const CLICK_DIES = 0.004;

/**
 * Seconds the click and the scuff take to arrive: the step's first sample is
 * silence.
 */
const CLICK_RISES = 0.0005;

/**
 * One step on `footing`, `strength` from 0 (a creep) to 1 (a stamp): a harder
 * step is louder and harder-edged. `seed` moves its pitch and its noise, so
 * no two steps are one sound.
 */
export function footstep(
  footing: Underfoot,
  strength: number,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const { seconds, thump, scuff, click, modes } = TREADS[footing];
  const noise = noiseOf(seed);
  const tune = 1 + 0.08 * noise();
  const tunes = modes.map(() => tune * (1 + 0.02 * noise()));
  const push = 0.3 + 0.7 * clamp01(strength);
  const band = filterOf('band', rate);
  return sampled(seconds, rate, (t) => {
    const scraped =
      band(
        noise(),
        scuff.hz * tune * 2 ** ((scuff.sweep * t) / scuff.dies),
        scuff.resonance,
      ) *
      Math.min(1, t / CLICK_RISES) *
      dying(t, scuff.dies) *
      scuff.force;
    const rung = modes.reduce(
      (sum, mode, index) => sum + ringing(mode, t, tunes[index]),
      0,
    );
    const edge =
      noise() *
      Math.min(1, t / CLICK_RISES) *
      dying(t, CLICK_DIES) *
      click *
      push;
    return push * (ringing(thump, t, tune) + 2 * scraped + rung + edge);
  });
}
