import { keptIn } from '@/kernel/shared/cache';
import type { CanDispose } from '@/kernel/shared/typings';

import { pathHash } from '@/dice/shared/roll';

import type { Sound } from '@/cube/entities/theme';

import { type Mix, samplesOf, type SoundCue, voicedOf } from '../model/cue';
import { air, hum, impulse } from '../model/tone';

/** How `play` places its samples; what is left out is full, centred and dry. */
export type Played = Partial<Mix>;

/** Everything heard in the cube but speech. */
export type Soundscape = CanDispose & {
  /** From a user gesture: makes the audio context, or resumes it. */
  unlock: () => void;
  /**
   * The floor's sound and the body's scale on it. A different sound
   * crossfades the room tone and its reverb over a second; the same one is
   * free, so a frame may call this.
   */
  setPlace: (sound: Sound, scale: number) => void;
  /** Heard only once unlocked: a cue belongs to its moment and is not kept. */
  cue: (cue: SoundCue) => void;
  /** Samples made elsewhere — the voice's — through this room. */
  play: (samples: Float32Array, sampleRate: number, how?: Played) => void;
};

/** The whole mix's level. */
const LOUDNESS = 0.8;

/** The room tone's levels: the hum, and the air at `sound.air` of 1. */
const HUM_LEVEL = 0.05;
const AIR_LEVEL = 0.16;

/** How much of the room tone goes through the reverb beside its dry self. */
const TONE_REVERB = 0.5;

/** How loud the reverb's return is. */
const REVERB_LEVEL = 2.5;

/** Seconds a change of place takes. */
const CROSSFADE = 1;

/** A place's room tone and reverb, sounding. */
type Place = {
  /** What plays through this room's reverb is connected here. */
  send: AudioNode;
  level: GainNode;
  loops: AudioBufferSourceNode[];
};

type Rig = {
  context: AudioContext;
  master: GainNode;
  place: Place | undefined;
};

/** The dice every sound's seed is drawn from. */
const word = pathHash('0');

function bufferOf(
  context: BaseAudioContext,
  channels: readonly Float32Array[],
  rate: number,
): AudioBuffer {
  const buffer = context.createBuffer(
    channels.length,
    channels[0]?.length ?? 1,
    rate,
  );
  for (const [channel, samples] of channels.entries()) {
    buffer.getChannelData(channel).set(samples);
  }
  return buffer;
}

/** The air's loop, one for every place a context sounds: only its level differs. */
const airs = new WeakMap<BaseAudioContext, AudioBuffer>();

const airOf = (context: BaseAudioContext): AudioBuffer =>
  keptIn(airs, context, () =>
    bufferOf(
      context,
      [air(word('air'), context.sampleRate)],
      context.sampleRate,
    ),
  );

function loopInto(
  context: BaseAudioContext,
  buffer: AudioBuffer,
  level: number,
  outs: readonly AudioNode[],
): AudioBufferSourceNode {
  const source = new AudioBufferSourceNode(context, { buffer, loop: true });
  const gain = new GainNode(context, { gain: level });
  source.connect(gain);
  for (const out of outs) gain.connect(out);
  source.start();
  return source;
}

/** `sound`'s room, silent until its level is raised. */
function placeOf({ context, master }: Rig, sound: Sound): Place {
  const rate = context.sampleRate;
  const level = new GainNode(context, { gain: 0 });
  level.connect(master);
  const reverb = new ConvolverNode(context, {
    // Each ear its own tail, so the room has width.
    buffer: bufferOf(
      context,
      ['left', 'right'].map((ear) =>
        impulse(sound.echo, word(`echo/${sound.echo}/${ear}`), rate),
      ),
      rate,
    ),
  });
  const returned = new GainNode(context, { gain: REVERB_LEVEL });
  reverb.connect(returned).connect(level);
  const toned = new GainNode(context, { gain: TONE_REVERB });
  toned.connect(reverb);
  const loops = [
    loopInto(context, airOf(context), AIR_LEVEL * sound.air, [level, toned]),
  ];
  if (sound.hum > 0) {
    loops.push(
      loopInto(
        context,
        bufferOf(
          context,
          [hum(sound.hum, word(`hum/${sound.hum}`), rate)],
          rate,
        ),
        HUM_LEVEL,
        [level, toned],
      ),
    );
  }
  return { send: reverb, level, loops };
}

function fade({ context }: Rig, place: Place, to: number): void {
  const now = context.currentTime;
  place.level.gain.setValueAtTime(place.level.gain.value, now);
  place.level.gain.linearRampToValueAtTime(to, now + CROSSFADE);
}

/** Fades `place` out and lets it go once it is silent. */
function retire(rig: Rig, place: Place): void {
  fade(rig, place, 0);
  const [first] = place.loops;
  first?.addEventListener('ended', () => {
    place.level.disconnect();
  });
  for (const loop of place.loops) {
    loop.stop(rig.context.currentTime + CROSSFADE);
  }
}

const sameTone = (a: Sound, b: Sound): boolean =>
  a.hum === b.hum && a.air === b.air && a.echo === b.echo;

/**
 * The cube's sound: a room tone that follows the place, and cues played into
 * it. Browser only, and silent until `unlock`; where there is no Web Audio it
 * stays silent and nothing else changes.
 */
export function createSoundscape(): Soundscape {
  let rig: Rig | undefined;
  let here: Sound | undefined;
  let size = 1;
  let cues = 0;

  function settle(): void {
    if (rig === undefined || here === undefined) return;
    const old = rig.place;
    if (old !== undefined) retire(rig, old);
    rig.place = placeOf(rig, here);
    fade(rig, rig.place, 1);
  }

  function emit(
    samples: Float32Array,
    rate: number,
    { loudness = 1, balance = 0, reverb = 0 }: Played,
    playbackRate = 1,
  ): void {
    if (rig?.context.state !== 'running') return;
    const { context, master, place } = rig;
    const source = new AudioBufferSourceNode(context, {
      buffer: bufferOf(context, [samples], rate),
      playbackRate,
    });
    const placed = new StereoPannerNode(context, { pan: balance });
    const dry = new GainNode(context, { gain: loudness });
    source.connect(placed).connect(dry).connect(master);
    const wet = new GainNode(context, { gain: loudness * reverb });
    if (place !== undefined) placed.connect(wet).connect(place.send);
    source.addEventListener('ended', () => {
      dry.disconnect();
      wet.disconnect();
    });
    source.start();
  }

  return {
    unlock() {
      if (rig === undefined) {
        if (typeof AudioContext === 'undefined') return;
        const context = new AudioContext();
        const master = new GainNode(context, { gain: LOUDNESS });
        // A landing over a ring over the hum stays under full scale.
        master
          .connect(
            new DynamicsCompressorNode(context, {
              threshold: -14,
              knee: 12,
              ratio: 4,
              attack: 0.004,
              release: 0.2,
            }),
          )
          .connect(context.destination);
        rig = { context, master, place: undefined };
        settle();
      }
      rig.context.resume().catch(reportError);
    },
    setPlace(sound, scale) {
      size = scale;
      const moved = here === undefined || !sameTone(here, sound);
      here = sound;
      if (moved) settle();
    },
    cue(cue) {
      if (rig?.context.state !== 'running' || here === undefined) return;
      // A room's sound comes with its seed; the body's own are numbered.
      const seed =
        'seed' in cue ? cue.seed : word(`${cue.kind}/${(cues += 1)}`);
      const rate = rig.context.sampleRate;
      const { playbackRate, ...mix } = voicedOf(cue, size);
      emit(samplesOf(cue, here.footing, seed, rate), rate, mix, playbackRate);
    },
    play(samples, sampleRate, how = {}) {
      emit(samples, sampleRate, how);
    },
    dispose() {
      rig?.context.close().catch(reportError);
      rig = undefined;
    },
  };
}
