/**
 * The rain's voice: a hiss of brown noise under a low filter and a patter of
 * tiny ticks, held at the shower's level while it falls, and the low whoosh a
 * cloud answers a tap with. Kept soft and low, under the flowers' notes: in
 * an offline render, the loudest 40 ms of a full shower above 300 Hz — what
 * a phone's speaker plays — lies about 12 dB under a middle note's, and the
 * whoosh's about 10 dB under.
 */

import { brownNoise, envelopeAt, swell, type Voice } from './synth';

/** The hiss's loudness at full wetness, and the corner it is filtered under. */
const HISS_PEAK = 0.075;
const HISS_CORNER = 450;
/**
 * The patter is this many looping layers of ticks, each sounding over its own
 * share of `downpour`, so the ticks come faster as the drops come on without
 * a node built per tick.
 */
const PATTER_LAYERS = 3;
/** How long a layer loops, in seconds: long enough that no rhythm is heard. */
const PATTER_SECONDS = 2.7;
/** Ticks a second in one layer. */
const TICKS_PER_SECOND = 7;
/** The patter's loudness at full wetness, and the corner its ticks are rounded under. */
const PATTER_PEAK = 0.03;
const PATTER_CORNER = 1600;
/** How long a tick lasts, in seconds, and the pitches it starts between, in Hz. */
const TICK_SECONDS = 0.012;
const TICK_PITCHES = [420, 900] as const;
/** How quickly a level follows a change, as a time constant in seconds: smooth, never a click. */
const FOLLOW_SECONDS = 0.08;
/** A change in level smaller than this is not passed on: a steady shower costs a frame nothing. */
const LEVEL_STEP = 0.004;
/** How long the voice keeps sounding once the shower is dry, while its last level dies. */
const TAIL_SECONDS = 0.3;

/** The whoosh: how long it lasts, how loud it gets, how slowly it swells. */
const WHOOSH_SECONDS = 0.85;
const WHOOSH_PEAK = 0.3;
const WHOOSH_ATTACK = 0.2;

/**
 * How loud patter layer `layer` (from 0) plays at `downpour`: each layer comes
 * in over its own share of the downpour, in order, so the tick rate follows it.
 */
export function layerLevel(downpour: number, layer: number): number {
  return Math.min(1, Math.max(0, downpour * PATTER_LAYERS - layer));
}

/**
 * Fills `samples` at `rate` with ticks scattered `perSecond` on average: each
 * a sine under a Hann window, gliding down a third, at a random pitch in
 * `TICK_PITCHES` and a random loudness up to 1. The window rounds every tick
 * in and out, so none of them clicks.
 */
export function fillPatter(
  samples: Float32Array,
  rate: number,
  perSecond: number,
  random: () => number = Math.random,
): void {
  const ticks = Math.round((samples.length / rate) * perSecond);
  const length = Math.round(TICK_SECONDS * rate);
  const [low, high] = TICK_PITCHES;
  for (let tick = 0; tick < ticks; tick++) {
    const start = Math.floor(random() * samples.length);
    const pitch = low + random() * (high - low);
    const loudness = 0.3 + 0.7 * random();
    let phase = 0;
    for (let index = 0; index < length; index++) {
      const along = index / length;
      phase += (2 * Math.PI * pitch * (1 - along / 3)) / rate;
      const window = 0.5 - 0.5 * Math.cos(2 * Math.PI * along);
      // A tick past the end wraps to the start, as the loop plays it.
      const at = (start + index) % samples.length;
      samples[at] = (samples[at] ?? 0) + loudness * window * Math.sin(phase);
    }
  }
}

/** The brown noise and the patter layers, made once per context and shared by every shower. */
type Buffers = { hiss: AudioBuffer; patter: AudioBuffer[] };

const made = new WeakMap<BaseAudioContext, Buffers>();

function buffersOf(context: BaseAudioContext): Buffers {
  const known = made.get(context);
  if (known) return known;
  const length = Math.ceil(context.sampleRate * PATTER_SECONDS);
  const buffers = {
    hiss: brownNoise(context, 3),
    patter: Array.from({ length: PATTER_LAYERS }, () => {
      const buffer = context.createBuffer(1, length, context.sampleRate);
      fillPatter(
        buffer.getChannelData(0),
        context.sampleRate,
        TICKS_PER_SECOND,
      );
      return buffer;
    }),
  };
  made.set(context, buffers);
  return buffers;
}

/** A looping buffer into a gain held at 0, which `RainVoice` raises. */
function loopInto(
  context: BaseAudioContext,
  buffer: AudioBuffer,
  into: AudioNode,
): { source: AudioBufferSourceNode; gain: GainNode } {
  const source = new AudioBufferSourceNode(context, { buffer, loop: true });
  const gain = new GainNode(context, { gain: 0 });
  source.connect(gain).connect(into);
  // Each layer from its own point of the loop, so a restart never repeats the last one.
  source.start(context.currentTime, Math.random() * PATTER_SECONDS);
  return { source, gain };
}

/**
 * A shower's sound, built once when the shower is first heard and set each
 * frame by `set`, which passes a level on only when it has moved; `stop`
 * lets it die away once the meadow is dry.
 */
export class RainVoice {
  private readonly context: BaseAudioContext;
  private readonly sources: AudioBufferSourceNode[];
  private readonly hiss: GainNode;
  private readonly patter: GainNode[];
  private downpour = 0;
  private wetness = 0;

  constructor(context: BaseAudioContext, out: AudioNode) {
    this.context = context;
    const buffers = buffersOf(context);
    const hissFilter = new BiquadFilterNode(context, {
      type: 'lowpass',
      frequency: HISS_CORNER,
    });
    hissFilter.connect(out);
    const patterFilter = new BiquadFilterNode(context, {
      type: 'lowpass',
      frequency: PATTER_CORNER,
    });
    patterFilter.connect(out);
    const hiss = loopInto(context, buffers.hiss, hissFilter);
    const patter = buffers.patter.map((buffer) =>
      loopInto(context, buffer, patterFilter),
    );
    this.hiss = hiss.gain;
    this.patter = patter.map(({ gain }) => gain);
    this.sources = [hiss.source, ...patter.map(({ source }) => source)];
  }

  /** Follows the shower: the ticks' rate by `downpour`, the whole by `wetness`, both from 0 to 1. */
  set(downpour: number, wetness: number): void {
    if (
      Math.abs(downpour - this.downpour) < LEVEL_STEP &&
      Math.abs(wetness - this.wetness) < LEVEL_STEP
    ) {
      return;
    }
    this.downpour = downpour;
    this.wetness = wetness;
    const now = this.context.currentTime;
    this.hiss.gain.setTargetAtTime(HISS_PEAK * wetness, now, FOLLOW_SECONDS);
    for (const [layer, gain] of this.patter.entries()) {
      gain.gain.setTargetAtTime(
        PATTER_PEAK * wetness * layerLevel(downpour, layer),
        now,
        FOLLOW_SECONDS,
      );
    }
  }

  /** Takes every level to nothing and stops the loops once it has got there. */
  stop(): void {
    const now = this.context.currentTime;
    for (const gain of [this.hiss, ...this.patter]) {
      gain.gain.setTargetAtTime(0, now, FOLLOW_SECONDS / 3);
    }
    for (const source of this.sources) source.stop(now + TAIL_SECONDS);
  }
}

/**
 * A cloud answering a tap: the hiss's brown noise swelling under a filter that
 * opens and closes again, over a low sine's sigh.
 */
export const whoosh: Voice = (context, out) => {
  const at = context.currentTime;
  const noise = new AudioBufferSourceNode(context, {
    buffer: buffersOf(context).hiss,
  });
  const filter = new BiquadFilterNode(context, {
    type: 'lowpass',
    frequency: 160,
  });
  filter.frequency.setValueAtTime(160, at);
  filter.frequency.exponentialRampToValueAtTime(480, at + WHOOSH_ATTACK * 1.4);
  filter.frequency.exponentialRampToValueAtTime(140, at + WHOOSH_SECONDS);
  noise
    .connect(filter)
    .connect(
      envelopeAt(context, at, {
        peak: WHOOSH_PEAK,
        attack: WHOOSH_ATTACK,
        lasts: WHOOSH_SECONDS,
      }),
    )
    .connect(out);
  noise.start(at, Math.random() * 2);
  noise.stop(at + WHOOSH_SECONDS + 0.05);
  swell(context, out, {
    shape: 'sine',
    pitches: [95, 130, 80],
    lasts: WHOOSH_SECONDS,
    peak: 0.08,
    attack: WHOOSH_ATTACK,
  });
};
