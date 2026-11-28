import { rng } from '@/clip/shared/ink';

import type { Rendered } from '../lib/wav';
import { IDENT_CUES } from './ident-cues';

/** The hiss's level over the snow, and under the locked test card. */
const HISS = { snow: 0.07, card: 0.03 } as const;
/** The beeps: a test tone's pitch and level, a short pip and the last long one. */
const BEEP = { hz: 1000, gain: 0.16, pip: 0.12, last: 0.55 } as const;
/** How long a level takes to change, so no edge clicks. */
const RAMP = 0.012;
/** The band the hiss is heard in: tape hiss, not rumble. */
const HISS_BAND = { from: 2500, to: 9000 } as const;

/** Stops whatever of the pre-roll's sound is still to play. */
export type Hush = () => void;

/**
 * Plays the pre-roll's sound on `audio` — the tape hiss from the snow to the
 * song's first hit, a beep on each line the test card writes — with film
 * time `from` heard at the context's time `at`. The page runs it on an
 * `AudioContext`, the film on an `OfflineAudioContext`, so both hear one
 * score.
 */
export function identSound(
  audio: BaseAudioContext,
  at: number,
  from: number,
): Hush {
  const { snow, tuned, lines, address, end } = IDENT_CUES;
  const when = (cue: number) => at + cue - from;
  const sources: AudioScheduledSourceNode[] = [];
  if (from < end) {
    const hiss = noise(audio, end - snow);
    const band = new BiquadFilterNode(audio, {
      type: 'bandpass',
      frequency: Math.sqrt(HISS_BAND.from * HISS_BAND.to),
      Q: 0.6,
    });
    const level = new GainNode(audio, { gain: 0 });
    hiss.connect(band).connect(level).connect(audio.destination);
    const ramps: ReadonlyArray<readonly [number, number]> = [
      [snow, HISS.snow],
      [tuned, HISS.card],
      [end, 0],
    ];
    level.gain.setValueAtTime(0, at);
    for (const [cue, gain] of ramps) {
      if (cue + RAMP <= from) level.gain.setValueAtTime(gain, at);
      else level.gain.setTargetAtTime(gain, Math.max(at, when(cue)), RAMP / 3);
    }
    hiss.start(Math.max(at, when(snow)), Math.max(0, from - snow));
    hiss.stop(when(end) + RAMP * 4);
    sources.push(hiss);
  }
  const beeps = [
    ...lines.map((cue) => [cue, BEEP.pip] as const),
    [address, BEEP.last] as const,
  ];
  for (const [cue, length] of beeps) {
    if (cue < from) continue;
    sources.push(beep(audio, when(cue), length));
  }
  return () => {
    for (const source of sources) source.stop();
  };
}

/** The sample rate the film's sound is rendered at. */
const FILM_RATE = 44_100;

/** The pre-roll's sound from the film's first frame, rendered offline in stereo. */
export async function renderedIdent(): Promise<Rendered> {
  const offline = new OfflineAudioContext(
    2,
    Math.ceil(IDENT_CUES.end * FILM_RATE),
    FILM_RATE,
  );
  identSound(offline, 0, 0);
  const rendered = await offline.startRendering();
  const { sampleRate } = rendered;
  return {
    sampleRate,
    channels: [0, 1].map((channel) => rendered.getChannelData(channel)),
  };
}

/** `seconds` of white noise, the same every time. */
function noise(
  audio: BaseAudioContext,
  seconds: number,
): AudioBufferSourceNode {
  const buffer = audio.createBuffer(
    1,
    Math.ceil(seconds * audio.sampleRate),
    audio.sampleRate,
  );
  const samples = buffer.getChannelData(0);
  const random = rng(7);
  for (let n = 0; n < samples.length; n += 1) samples[n] = random() * 2 - 1;
  return new AudioBufferSourceNode(audio, { buffer });
}

/** A test tone `length` seconds long from `at`, its edges ramped. */
function beep(
  audio: BaseAudioContext,
  at: number,
  length: number,
): OscillatorNode {
  const tone = new OscillatorNode(audio, { frequency: BEEP.hz });
  const level = new GainNode(audio, { gain: 0 });
  tone.connect(level).connect(audio.destination);
  level.gain.setValueAtTime(0, at);
  level.gain.linearRampToValueAtTime(BEEP.gain, at + RAMP);
  level.gain.setValueAtTime(BEEP.gain, at + length - RAMP);
  level.gain.linearRampToValueAtTime(0, at + length);
  tone.start(at);
  tone.stop(at + length + RAMP);
  return tone;
}
