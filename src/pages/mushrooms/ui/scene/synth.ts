/** The synthesizer's building blocks, which every voice of the meadow is played with. */

/** A sound, played into `out` from the context's current time. */
export type Voice = (context: AudioContext, out: AudioNode) => void;

/** A major pentatonic from C5, so any run of chimes is in tune. */
export const PENTATONIC = [
  523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66,
];

/** An oscillator's waveform, and how loud it gets. */
export type Voiced = { shape: OscillatorType; peak: number };

/**
 * One enveloped oscillator: `shape` gliding through `pitches` over `lasts`,
 * rising to `peak` over `attack` seconds, `delay` seconds from now.
 */
export type Swell = Voiced & {
  pitches: readonly number[];
  /** How long it sounds, in seconds. */
  lasts: number;
  attack: number;
  delay?: number;
};

/** Plays `swell` into `out`, returning its oscillator for a caller to bend further. */
export function swell(
  context: AudioContext,
  out: AudioNode,
  { shape, pitches, lasts, peak, attack, delay = 0 }: Swell,
): OscillatorNode {
  const now = context.currentTime + delay;
  const oscillator = new OscillatorNode(context, {
    type: shape,
    frequency: pitches[0],
  });
  // Anchors each ramp at the note's own start rather than at the call.
  oscillator.frequency.setValueAtTime(oscillator.frequency.value, now);
  for (const [index, pitch] of pitches.slice(1).entries()) {
    oscillator.frequency.exponentialRampToValueAtTime(
      pitch,
      now + (lasts * (index + 1)) / pitches.length,
    );
  }
  const envelope = envelopeAt(context, now, { peak, attack, lasts });
  oscillator.connect(envelope).connect(out);
  oscillator.start(now);
  oscillator.stop(now + lasts + 0.05);
  return oscillator;
}

/** How a sound's loudness goes: up to `peak` over `attack`, then dying away by `lasts`. */
export type Envelope = Pick<Swell, 'peak' | 'attack' | 'lasts'>;

/** A gain that plays `envelope` from `at` on the context's clock. */
export function envelopeAt(
  context: AudioContext,
  at: number,
  { peak, attack, lasts }: Envelope,
): GainNode {
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.setValueAtTime(0, at);
  envelope.gain.linearRampToValueAtTime(peak, at + attack);
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + lasts);
  return envelope;
}

/** A `swell` with a quick attack, as most of the meadow's voices have. */
export function tone(
  context: AudioContext,
  out: AudioNode,
  shape: OscillatorType,
  pitches: readonly number[],
  seconds: number,
  peak: number,
  delay = 0,
): OscillatorNode {
  return swell(context, out, {
    shape,
    pitches,
    lasts: seconds,
    peak,
    attack: 0.01,
    delay,
  });
}
