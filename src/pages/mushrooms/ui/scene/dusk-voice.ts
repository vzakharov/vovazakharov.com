/**
 * The crickets' voice at dusk: a few crickets, each a high sine chirping in
 * short bursts on its own seeded rhythm and from its own side, held at the
 * dusk's level, under the meadow rather than over it.
 */

import { mulberry32, type Random } from '../../model/random';

/** The chorus's loudness at full dusk: a single pulse peaks at this, about half a bird note's. */
const CRICKET_LOUDNESS = 0.018;
/** Each cricket's pitch in Hz, its side across the stereo field and the seed of its rhythm. */
const CRICKETS = [
  { pitch: 4300, pan: -0.6, seed: 17 },
  { pitch: 4750, pan: 0.15, seed: 29 },
  { pitch: 5100, pan: 0.65, seed: 43 },
] as const;
/** How many chirps one cricket's loop holds: enough that its rhythm never sounds like a loop. */
const CHIRPS_PER_LOOP = 9;
/** Seconds from one chirp's start to the next. */
const CHIRP_GAP_SECONDS = [0.6, 1.4] as const;
/** Pulses in one chirp. */
const PULSES = [3, 4] as const;
/** How long a pulse lasts, and how far apart pulses start, in seconds. */
const PULSE_SECONDS = 0.03;
const PULSE_SPACING = 0.045;
/** How quickly the level follows a change, as a time constant in seconds: smooth, never a click. */
const FOLLOW_SECONDS = 0.15;
/** A change in level smaller than this is not passed on: a still dusk costs a frame nothing. */
const LEVEL_STEP = 0.004;
/** How long the voice keeps sounding once day is back, while its last level dies. */
const TAIL_SECONDS = 0.5;

/** The dusk level a turn toward day passes under as morning comes, and the birds greet it. */
export const MORNING = 0.3;

/** Whether the light, from `was` to `level` (`duskness`), has just passed under `MORNING`. */
export function morningComes(was: number, level: number): boolean {
  return was >= MORNING && level < MORNING;
}

/** One cricket's loop: when each of its pulses starts, in seconds, and how long the loop lasts. */
type Rhythm = { onsets: number[]; loopSeconds: number };

/**
 * A loop of `CHIRPS_PER_LOOP` chirps drawn from `random`: each chirp
 * `PULSES` pulses `PULSE_SPACING` apart, the next starting a
 * `CHIRP_GAP_SECONDS` later. The loop lasts as long as its gaps, so the
 * gap from its last chirp round to its first is one of them too.
 */
export function chirpRhythm(random: Random): Rhythm {
  const onsets: number[] = [];
  let at = 0;
  for (let chirp = 0; chirp < CHIRPS_PER_LOOP; chirp++) {
    const [fewest, most] = PULSES;
    const pulses = fewest + Math.floor(random() * (most - fewest + 1));
    for (let pulse = 0; pulse < pulses; pulse++) {
      onsets.push(at + pulse * PULSE_SPACING);
    }
    const [shortest, longest] = CHIRP_GAP_SECONDS;
    at += shortest + random() * (longest - shortest);
  }
  return { onsets, loopSeconds: at };
}

/**
 * Fills `samples` at `rate` with a sine at `pitch` sounding at each of
 * `onsets`, in seconds, for `PULSE_SECONDS` under a Hann window, so no pulse
 * clicks in or out.
 */
export function fillChirps(
  samples: Float32Array,
  rate: number,
  pitch: number,
  onsets: readonly number[],
): void {
  const length = Math.round(PULSE_SECONDS * rate);
  for (const onset of onsets) {
    const start = Math.round(onset * rate);
    for (let index = 0; index < length; index++) {
      const along = index / length;
      const window = 0.5 - 0.5 * Math.cos(2 * Math.PI * along);
      // A pulse past the end wraps to the start, as the loop plays it.
      const at = (start + index) % samples.length;
      samples[at] =
        (samples[at] ?? 0) +
        window * Math.sin((2 * Math.PI * pitch * index) / rate);
    }
  }
}

/** A cricket's loop and its side, as `CRICKETS` places it. */
type Placed = { buffer: AudioBuffer; pan: number };

/** Each cricket's loop, made once per context and shared by every dusk. */
const made = new WeakMap<BaseAudioContext, Placed[]>();

function buffersOf(context: BaseAudioContext): Placed[] {
  const known = made.get(context);
  if (known) return known;
  const rate = context.sampleRate;
  const buffers = CRICKETS.map(({ pitch, pan, seed }) => {
    const { onsets, loopSeconds } = chirpRhythm(mulberry32(seed));
    const length = Math.ceil(loopSeconds * rate);
    const buffer = context.createBuffer(1, length, rate);
    fillChirps(buffer.getChannelData(0), rate, pitch, onsets);
    return { buffer, pan };
  });
  made.set(context, buffers);
  return buffers;
}

/**
 * The crickets' chorus, built once when dusk is first heard and set each
 * frame by `set`, which passes a level on only when it has moved; `stop` lets
 * it die away once day is back.
 */
export class DuskVoice {
  private readonly context: BaseAudioContext;
  private readonly sources: AudioBufferSourceNode[];
  private readonly gain: GainNode;
  private level = 0;

  constructor(context: BaseAudioContext, out: AudioNode) {
    this.context = context;
    this.gain = new GainNode(context, { gain: 0 });
    this.gain.connect(out);
    this.sources = buffersOf(context).map(({ buffer, pan }) => {
      const source = new AudioBufferSourceNode(context, { buffer, loop: true });
      source.connect(new StereoPannerNode(context, { pan })).connect(this.gain);
      // Each cricket from its own point of its loop, so a new dusk never opens on the same chirps.
      source.start(context.currentTime, Math.random() * buffer.duration);
      return source;
    });
  }

  /** Follows the dusk's `level` (`duskness`), from 0 to 1. */
  set(level: number): void {
    if (Math.abs(level - this.level) < LEVEL_STEP) return;
    this.level = level;
    this.gain.gain.setTargetAtTime(
      CRICKET_LOUDNESS * level,
      this.context.currentTime,
      FOLLOW_SECONDS,
    );
  }

  /** Takes the chorus to nothing and stops the loops once it has got there. */
  stop(): void {
    const now = this.context.currentTime;
    this.gain.gain.setTargetAtTime(0, now, FOLLOW_SECONDS / 3);
    for (const source of this.sources) source.stop(now + TAIL_SECONDS);
  }
}
