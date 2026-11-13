import type { Hushing } from '@/kernel/shared/typings';

import {
  type Beds,
  EASE,
  FADE_EASE,
  FILTER_EASE,
  HUM_Q,
  type Layer,
  type Loop,
  MUFFLED,
  OPEN_AIR,
  type OutsideMix,
  SOUND_LAYERS,
  WALL_Q,
} from '../../outdoors';

/** Milliseconds of a frame the loops' rendering may take, and samples a go. */
const BUDGET = 4;
const PIECE = 8192;

/** Seconds a layer takes to come in once its loops are whole, and to go. */
const FADE = 1.5;

/**
 * Renders `beds` a few milliseconds at a time until every loop is whole, the
 * layers in their order, so the surf is ready first. Returns how to stop.
 */
export function renderInPieces(beds: Beds): () => void {
  const waiting = SOUND_LAYERS.flatMap((layer) => beds[layer]);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const work = (): void => {
    const until = performance.now() + BUDGET;
    while (waiting.length > 0 && performance.now() < until) {
      if (waiting[0]?.render(PIECE) ?? true) waiting.shift();
    }
    timer = waiting.length > 0 ? setTimeout(work) : undefined;
  };
  work();
  return () => {
    clearTimeout(timer);
  };
}

const isWhole = (loop: Loop): boolean => loop.render(0);

/** One layer sounding: its level in each ear. */
type Sounding = {
  sources: AudioBufferSourceNode[];
  ears: readonly [leftEar: GainNode, rightEar: GainNode];
};

/** The outside as the mixer plays it. */
export type Outdoors = Hushing & {
  /**
   * The mix at `seconds` into the hour, to ease toward. A layer joins the
   * first time this is called with its loops whole, at the clock's own place
   * in them.
   */
  set: (mix: OutsideMix, seconds: number) => void;
};

/**
 * The outside's loops playing into `out`: every layer's two loops each to its
 * own ear at the mix's level, the sea and the wind through one low-pass that
 * is the wall between them and an ear indoors.
 */
export function outdoorsOf(
  context: AudioContext,
  out: AudioNode,
  beds: Beds,
): Outdoors {
  const level = new GainNode(context, { gain: 0 });
  level.connect(out);
  level.gain.setTargetAtTime(1, context.currentTime, FADE / 3);
  const wall = new BiquadFilterNode(context, {
    type: 'lowpass',
    frequency: OPEN_AIR,
    Q: WALL_Q,
  });
  wall.connect(level);
  // The hum's own wall: both close as an ear steps over the sill.
  const humWall = new BiquadFilterNode(context, {
    type: 'lowpass',
    frequency: OPEN_AIR,
    Q: HUM_Q,
  });
  humWall.connect(level);
  const sounding = new Map<Layer, Sounding>();

  function start(layer: Layer, seconds: number): Sounding | undefined {
    const loops = beds[layer];
    if (!loops.every((loop) => isWhole(loop))) return undefined;
    // A layer whose loops were late comes in under the ones already there.
    const joined = new GainNode(context, { gain: 0 });
    joined.gain.setTargetAtTime(1, context.currentTime, FADE / 3);
    const into = layer === 'hum' ? humWall : level;
    joined.connect(MUFFLED.has(layer) ? wall : into);
    const merged = new ChannelMergerNode(context, { numberOfInputs: 2 });
    merged.connect(joined);
    const sources: AudioBufferSourceNode[] = [];
    const earOf = (ear: number, loop: Loop): GainNode => {
      const gain = new GainNode(context, { gain: 0 });
      gain.connect(merged, 0, ear);
      const buffer = context.createBuffer(1, loop.samples.length, loop.rate);
      buffer.getChannelData(0).set(loop.samples);
      const source = new AudioBufferSourceNode(context, { buffer, loop: true });
      source.connect(gain);
      source.start(0, seconds % loop.seconds);
      sources.push(source);
      return gain;
    };
    const ears = [earOf(0, loops[0]), earOf(1, loops[1])] as const;
    return { sources, ears };
  }

  return {
    set: (mix, seconds) => {
      const now = context.currentTime;
      wall.frequency.setTargetAtTime(mix.muffle, now, FILTER_EASE);
      humWall.frequency.setTargetAtTime(mix.humMuffle, now, FILTER_EASE);
      for (const layer of SOUND_LAYERS) {
        let playing = sounding.get(layer);
        if (playing === undefined) {
          playing = start(layer, seconds);
          if (playing === undefined) continue;
          sounding.set(layer, playing);
        }
        const { leftEar, rightEar } = mix.layers[layer];
        // A level falls slower than it rises, so a cut is a sweep, not a click.
        for (const [ear, target] of [leftEar, rightEar].entries()) {
          const gain = playing.ears[ear]?.gain;
          if (gain === undefined) continue;
          gain.setTargetAtTime(
            target,
            now,
            target < gain.value ? FADE_EASE : EASE,
          );
        }
      }
    },
    stop: () => {
      const now = context.currentTime;
      level.gain.setTargetAtTime(0, now, FADE / 3);
      for (const { sources } of sounding.values()) {
        for (const source of sources) source.stop(now + FADE);
      }
      setTimeout(() => {
        level.disconnect();
      }, FADE * 1000);
    },
  };
}
