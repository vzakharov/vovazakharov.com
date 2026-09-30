/**
 * The flowers' instrument: a soft keyed voice for the twelve notes, and eight
 * soft drums in a downtempo kit — sines and filtered noise with rounded
 * attacks, never an acoustic kit's crack and sizzle. Each is its parts as
 * data, which the tests measure, and `playParts` plays them.
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

/** A filter's centre or corner, in Hz, and its Q as Web Audio reads it for that filter's type. */
export type Band = { frequency: number; q: number };

/** One enveloped oscillator of a voice, through a lowpass where one is given (`q` in dB). */
export type TonePart = Swell & { lowpass?: Band };

/** White noise through a bandpass, enveloped. */
export type HissPart = Envelope & Band;

/** What a voice is made of, which `playParts` plays and the tests measure. */
export type Part =
  | ({ kind: 'tone' } & TonePart)
  | ({ kind: 'hiss' } & HissPart);

/** A soft keyed note: a sine and a quiet triangle under a lowpass, and a sine an octave up. */
export function noteParts(note: number): Part[] {
  const pitch = frequencyOf(note);
  const envelope = noteEnvelope(note);
  const lowpass = {
    frequency: Math.min(NOTE_CEILING, pitch * NOTE_BRIGHTNESS),
    q: 0.5,
  };
  const partial = (shape: 'sine' | 'triangle', at: number, peak: number) =>
    ({
      kind: 'tone',
      ...envelope,
      shape,
      pitches: [at, at],
      peak,
      lowpass,
    }) as const;
  return [
    partial('sine', pitch, envelope.peak),
    partial('triangle', pitch, envelope.peak * 0.3),
    partial('sine', pitch * 2, envelope.overtone),
  ];
}

/** A drum's pitched part: a sine or a triangle, gliding down as a skin does. */
type Body = Pick<Swell, 'pitches' | 'lasts' | 'peak'> & {
  shape: 'sine' | 'triangle';
};

/** A drum's noisy part: noise through a bandpass. */
type Hiss = Pick<Swell, 'lasts' | 'peak'> & Band;

/**
 * A drum: its `body`, the skin's low sound; its `ring`, the skin's higher
 * mode, which a phone's speaker gives back where it loses the body; and its
 * `hiss`. All three share the drum's `attack`.
 */
export type DrumSpec = Pick<Swell, 'attack'> & {
  body?: Body;
  ring?: Body;
  hiss?: Hiss;
};

/**
 * The kit, each drum soft: a rounded attack, the noise filtered, the skins
 * sines, loud enough beside a note to be heard in a chord on a phone.
 */
export const DRUM_SPECS = {
  kick: {
    attack: 0.006,
    body: { shape: 'sine', pitches: [115, 48], lasts: 0.5, peak: 0.45 },
    ring: { shape: 'sine', pitches: [480, 360], lasts: 0.2, peak: 0.26 },
  },
  'tom-low': {
    attack: 0.006,
    body: { shape: 'sine', pitches: [150, 104], lasts: 0.5, peak: 0.34 },
    ring: { shape: 'sine', pitches: [420, 330], lasts: 0.24, peak: 0.2 },
  },
  'tom-mid': {
    attack: 0.006,
    body: { shape: 'sine', pitches: [205, 146], lasts: 0.42, peak: 0.3 },
    ring: { shape: 'sine', pitches: [560, 440], lasts: 0.22, peak: 0.19 },
  },
  'tom-high': {
    attack: 0.006,
    body: { shape: 'sine', pitches: [280, 205], lasts: 0.36, peak: 0.27 },
    ring: { shape: 'sine', pitches: [760, 600], lasts: 0.2, peak: 0.18 },
  },
  snare: {
    attack: 0.005,
    body: { shape: 'triangle', pitches: [210, 170], lasts: 0.12, peak: 0.2 },
    hiss: { frequency: 1700, q: 0.7, lasts: 0.26, peak: 0.7 },
  },
  rim: {
    attack: 0.004,
    body: { shape: 'triangle', pitches: [820, 760], lasts: 0.09, peak: 0.55 },
    hiss: { frequency: 2400, q: 4, lasts: 0.09, peak: 0.35 },
  },
  hat: {
    attack: 0.004,
    hiss: { frequency: 4600, q: 1.1, lasts: 0.14, peak: 0.9 },
  },
  shaker: {
    attack: 0.035,
    hiss: { frequency: 4200, q: 1.4, lasts: 0.18, peak: 0.45 },
  },
} as const satisfies Record<Drum, DrumSpec>;

export function drumParts(drum: Drum): Part[] {
  const { attack, body, ring, hiss }: DrumSpec = DRUM_SPECS[drum];
  const tones = [body, ring].flatMap((part) =>
    part ? [{ kind: 'tone', ...part, attack } as const] : [],
  );
  return hiss ? [...tones, { kind: 'hiss', ...hiss, attack }] : tones;
}

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

function filterOn(
  context: AudioContext,
  type: 'lowpass' | 'bandpass',
  { frequency, q: Q }: Band,
): BiquadFilterNode {
  return new BiquadFilterNode(context, { type, frequency, Q });
}

function playHiss(context: AudioContext, out: AudioNode, hiss: HissPart): void {
  const now = context.currentTime;
  const noise = new AudioBufferSourceNode(context, {
    buffer: noiseOf(context),
  });
  noise
    .connect(filterOn(context, 'bandpass', hiss))
    .connect(envelopeAt(context, now, hiss))
    .connect(out);
  // A different stretch of the noise each hit, so no two sound quite alike.
  noise.start(now, Math.random() * 0.5);
  noise.stop(now + hiss.lasts + 0.05);
}

/** Plays `parts` together, each from the context's current time. */
export function playParts(parts: readonly Part[]): Voice {
  return (context, out) => {
    for (const part of parts) {
      if (part.kind === 'hiss') {
        playHiss(context, out, part);
        continue;
      }
      const { lowpass } = part;
      if (!lowpass) {
        swell(context, out, part);
        continue;
      }
      const filter = filterOn(context, 'lowpass', lowpass);
      filter.connect(out);
      swell(context, filter, part);
    }
  };
}

export function noteVoice(note: number): Voice {
  return playParts(noteParts(note));
}

export function drumVoice(drum: Drum): Voice {
  return playParts(drumParts(drum));
}
