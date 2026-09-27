/** The synthesizer's building blocks, which every voice of the meadow is played with. */

/** A sound, played into `out` from the context's current time. */
export type Voice = (context: AudioContext, out: AudioNode) => void;

/** A major pentatonic from C5, so any run of chimes is in tune. */
export const PENTATONIC = [
  523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66,
];

/**
 * One enveloped oscillator: `shape` gliding through `pitches` over `seconds`,
 * `delay` seconds from now.
 */
export function tone(
  context: AudioContext,
  out: AudioNode,
  shape: OscillatorType,
  pitches: readonly number[],
  seconds: number,
  peak: number,
  delay = 0,
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
      now + (seconds * (index + 1)) / pitches.length,
    );
  }
  const envelope = new GainNode(context, { gain: 0 });
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(peak, now + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  oscillator.connect(envelope).connect(out);
  oscillator.start(now);
  oscillator.stop(now + seconds + 0.05);
  return oscillator;
}
