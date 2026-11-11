import type { Source, Voice } from './voice';

/**
 * What goes into the throat's resonances each sample: the voiced sound at
 * `hertz` as loud as `voicing`, and air as loud as `breath`.
 */
export type Exciter = (
  hertz: number,
  voicing: number,
  breath: number,
) => number;

/** The shares of a glottal cycle the folds spend opening, then closing. */
const OPENING = 0.4;
const CLOSING = 0.16;

/**
 * The rate of airflow through the vocal folds over one cycle, `phase` on
 * `[0, 1)`: a slow rise as they open, a fall to -1 as they snap shut — the snap
 * is what rings the throat — and nothing while they stay shut.
 */
export function glottal(phase: number): number {
  if (phase < OPENING) {
    return (CLOSING / OPENING) * Math.sin((Math.PI * phase) / OPENING);
  }
  if (phase < OPENING + CLOSING) {
    return -Math.sin((Math.PI / 2) * ((phase - OPENING) / CLOSING));
  }
  return 0;
}

/** How far a living throat's pitch and loudness stray from cycle to cycle. */
const JITTER = 0.012;
const SHIMMER = 0.06;

/** How loud let-out air is against the voice. */
const AIR = 0.11;

/** The hertz above which a clear voice's pulses are dulled. */
const BRIGHT = 5000;

/**
 * What a source is made from. `hush` scales noise so that a band of it is as
 * loud at any sample rate: `random` is white, and white noise spreads over
 * however many hertz the rate holds.
 */
type Making = {
  voice: Voice;
  sampleRate: number;
  random: () => number;
  hush: number;
};

/** A cycle counted in `[0, 1)` at whatever pitch each sample asks for. */
function cycle(sampleRate: number, turned: () => number) {
  let phase = 0;
  let stray = 1;
  return (hertz: number): number => {
    phase += (hertz * stray) / sampleRate;
    if (phase >= 1) {
      phase -= Math.floor(phase);
      stray = turned();
    }
    return phase;
  };
}

function throat({ voice, sampleRate, random, hush }: Making): Exciter {
  let loud = 1;
  let dulled = 0;
  const turn = cycle(sampleRate, () => {
    loud = 1 + SHIMMER * voice.waver * random();
    return 1 + JITTER * voice.waver * random();
  });
  const dull =
    1 -
    Math.exp((-2 * Math.PI * BRIGHT * (1 - 0.7 * voice.breath)) / sampleRate);
  return (hertz, voicing, breath) => {
    const phase = turn(hertz);
    dulled += dull * (glottal(phase) * loud - dulled);
    const leak = phase < OPENING + CLOSING ? voice.breath : 0.3 * voice.breath;
    return dulled * voicing + random() * hush * AIR * (breath + leak * voicing);
  };
}

const whisper =
  ({ random, hush }: Making): Exciter =>
  (_, voicing, breath) =>
    random() * hush * AIR * 1.6 * (voicing + breath);

/** The share of a buzzer's cycle its pulse lasts. */
const DUTY = 0.1;

function buzz({ sampleRate, random, hush }: Making): Exciter {
  const turn = cycle(sampleRate, () => 1);
  return (hertz, voicing, breath) =>
    (turn(hertz) < DUTY ? 1 : -DUTY / (1 - DUTY)) * 0.5 * voicing +
    random() * hush * AIR * breath;
}

/** What each source puts into the resonances; a whistle has none to excite. */
export const EXCITERS: Record<
  Exclude<Source, 'whistle'>,
  (making: Making) => Exciter
> = {
  throat,
  whisper,
  buzz,
};
