/**
 * The flowers' instrument: a soft keyed voice for the twelve notes, and eight
 * soft drums in a downtempo kit — sines and filtered noise with rounded
 * attacks, never an acoustic kit's crack and sizzle. Each is its envelope as
 * data, which the tests hold, and the few lines that play it.
 */

import type { Drum } from '../../model/flower-sounds';
import { frequencyOf, HIGHEST_NOTE, LOWEST_NOTE } from '../../model/notes';
import {
  type Envelope,
  envelopeAt,
  type Swell,
  swell,
  type Voice,
} from './synth';

/** A note's loudness and length, and its octave partial's peak. */
export type NoteEnvelope = Envelope & { overtone: number };

/**
 * The lowest note's and the highest's; the notes between lie on the line.
 * Low, a phone's speaker loses the fundamental, so the octave partial carries
 * it, louder and ringing longer; high, the ear hears more, so the peak comes
 * down about 6 dB and the ring shortens.
 */
const NOTE_ENDS: Readonly<Record<'low' | 'high', NoteEnvelope>> = {
  low: { peak: 0.15, overtone: 0.08, attack: 0.014, lasts: 1.5 },
  high: { peak: 0.075, overtone: 0.02, attack: 0.006, lasts: 0.8 },
};

export function noteEnvelope(note: number): NoteEnvelope {
  const t = Math.min(
    1,
    Math.max(0, (note - LOWEST_NOTE) / (HIGHEST_NOTE - LOWEST_NOTE)),
  );
  const { low, high } = NOTE_ENDS;
  const along = (key: keyof NoteEnvelope) =>
    low[key] + (high[key] - low[key]) * t;
  return {
    peak: along('peak'),
    overtone: along('overtone'),
    attack: along('attack'),
    lasts: along('lasts'),
  };
}

/** How far above a note its voice's filter opens, as a multiple of the note. */
const NOTE_BRIGHTNESS = 3;
/** The most the filter ever opens, in Hz: the voice stays round at the top. */
const NOTE_CEILING = 4200;

/** A soft keyed note: a sine and a quiet triangle under a lowpass, and a sine an octave up. */
export function noteVoice(note: number): Voice {
  const pitch = frequencyOf(note);
  const envelope = noteEnvelope(note);
  return (context, out) => {
    const filter = new BiquadFilterNode(context, {
      type: 'lowpass',
      frequency: Math.min(NOTE_CEILING, pitch * NOTE_BRIGHTNESS),
      Q: 0.5,
    });
    filter.connect(out);
    const partial = (shape: OscillatorType, at: number, peak: number) =>
      swell(context, filter, {
        ...envelope,
        shape,
        pitches: [at, at],
        peak,
      });
    partial('sine', pitch, envelope.peak);
    partial('triangle', pitch, envelope.peak * 0.3);
    partial('sine', pitch * 2, envelope.overtone);
  };
}

/** A drum's pitched part: a sine or a triangle, gliding down as a skin does. */
type Body = Pick<Swell, 'pitches' | 'lasts' | 'peak'> & {
  shape: 'sine' | 'triangle';
};

/** A drum's noisy part: noise through a filter, never brighter than `HISS_CEILING`. */
type Hiss = Pick<Swell, 'lasts' | 'peak'> & {
  filter: 'bandpass' | 'lowpass';
  frequency: number;
  q: number;
};

export type DrumSpec = Pick<Swell, 'attack'> & { body?: Body; hiss?: Hiss };

/** The brightest any hiss is filtered to, in Hz: a hat's shimmer, short of a cymbal's sizzle. */
export const HISS_CEILING = 8000;

/** The kit, each drum soft: a rounded attack, the noise filtered, the skins sines. */
export const DRUM_SPECS = {
  kick: {
    attack: 0.005,
    body: { shape: 'sine', pitches: [115, 48], lasts: 0.5, peak: 0.5 },
  },
  'tom-low': {
    attack: 0.006,
    body: { shape: 'sine', pitches: [150, 104], lasts: 0.5, peak: 0.34 },
  },
  'tom-mid': {
    attack: 0.006,
    body: { shape: 'sine', pitches: [205, 146], lasts: 0.42, peak: 0.3 },
  },
  'tom-high': {
    attack: 0.006,
    body: { shape: 'sine', pitches: [280, 205], lasts: 0.36, peak: 0.27 },
  },
  snare: {
    attack: 0.004,
    body: { shape: 'triangle', pitches: [210, 170], lasts: 0.12, peak: 0.12 },
    hiss: {
      filter: 'bandpass',
      frequency: 1700,
      q: 0.7,
      lasts: 0.26,
      peak: 0.24,
    },
  },
  rim: {
    attack: 0.003,
    body: { shape: 'triangle', pitches: [820, 760], lasts: 0.06, peak: 0.12 },
    hiss: {
      filter: 'bandpass',
      frequency: 2400,
      q: 4,
      lasts: 0.06,
      peak: 0.1,
    },
  },
  hat: {
    attack: 0.003,
    hiss: {
      filter: 'bandpass',
      frequency: 7000,
      q: 1.2,
      lasts: 0.08,
      peak: 0.12,
    },
  },
  shaker: {
    attack: 0.035,
    hiss: {
      filter: 'bandpass',
      frequency: 5200,
      q: 1.5,
      lasts: 0.17,
      peak: 0.1,
    },
  },
} as const satisfies Record<Drum, DrumSpec>;

/** One second of white noise per context, which every hiss plays a stretch of. */
const noises = new WeakMap<AudioContext, AudioBuffer>();

function noiseOf(context: AudioContext): AudioBuffer {
  const known = noises.get(context);
  if (known) return known;
  const buffer = context.createBuffer(
    1,
    context.sampleRate,
    context.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  for (let index = 0; index < samples.length; index++) {
    samples[index] = Math.random() * 2 - 1;
  }
  noises.set(context, buffer);
  return buffer;
}

export function drumVoice(drum: Drum): Voice {
  const spec: DrumSpec = DRUM_SPECS[drum];
  return (context, out) => {
    const { attack, body, hiss } = spec;
    if (body) swell(context, out, { ...body, attack });
    if (!hiss) return;
    const now = context.currentTime;
    const noise = new AudioBufferSourceNode(context, {
      buffer: noiseOf(context),
    });
    const { filter: type, frequency, q: Q, lasts } = hiss;
    const filter = new BiquadFilterNode(context, { type, frequency, Q });
    noise
      .connect(filter)
      .connect(envelopeAt(context, now, { ...hiss, attack }))
      .connect(out);
    // A different stretch of the noise each hit, so no two sound quite alike.
    noise.start(now, Math.random() * 0.5);
    noise.stop(now + lasts + 0.05);
  };
}
