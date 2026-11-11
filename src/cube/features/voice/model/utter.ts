import { diceOf } from './chance';
import { bandpass, noise, resonator } from './filter';
import type { Line } from './line';
import { EXCITERS } from './source';
import { type Curve, FRAME, type Track, trackOf } from './track';
import type { Voice } from './voice';

/** How wide the first three resonances ring, in hertz, undamped. */
const WIDTHS = [70, 100, 150] as const;

/** The fourth and fifth resonances, which no phone moves: hertz and width. */
const UPPER = [
  [3500, 250],
  [4500, 300],
] as const;

/** How loud a consonant's hiss at level 1 is against the voice. */
const HISS = 1.25;

/** The sample rate noise is as loud at as it is written. */
const HUSHED_AT = 16_000;

/** The loudest sample of a line. */
const PEAK = 0.9;

/** Hertz of the slow wobbles of a living voice's pitch, and how deep they go. */
const FLUTTER = [12.7, 7.1, 4.7] as const;
const FLUTTER_DEPTH = 0.012;

/**
 * What turns a moment of the track into a sample: shaped once a frame, at
 * `seconds` into the line, from the frame's curves, then sounded once a
 * sample at that sample's levels.
 */
type Mouth = {
  shape: (now: (curve: Curve) => number, seconds: number) => void;
  sound: (voicing: number, breath: number, hiss: number) => number;
};

type Setting = { voice: Voice; sampleRate: number; random: () => number };

const hushOf = (sampleRate: number) => Math.sqrt(sampleRate / HUSHED_AT);

/** A consonant's hiss: noise through its band. */
function hissing({ sampleRate, random }: Setting) {
  const hush = hushOf(sampleRate);
  const band = bandpass(sampleRate);
  return {
    tune: (now: (curve: Curve) => number) => {
      band.tune(now('hissCentre'), now('hissWidth'));
    },
    run: (hiss: number): number => band.run(random() * hush * hiss) * HISS,
  };
}

/** A source through five resonances in a row, a band of hiss beside them. */
function resonant(source: keyof typeof EXCITERS, setting: Setting): Mouth {
  const { voice, sampleRate, random } = setting;
  const excite = EXCITERS[source]({
    voice,
    sampleRate,
    random,
    hush: hushOf(sampleRate),
  });
  const lower = WIDTHS.map(() => resonator(sampleRate));
  const upper = UPPER.map(([hertz, width]) => {
    const fixed = resonator(sampleRate);
    fixed.tune(hertz * voice.tract, width);
    return fixed;
  });
  const hisser = hissing(setting);
  let hertz = voice.pitch;
  return {
    shape: (now, seconds) => {
      const formants = [now('f1'), now('f2'), now('f3')];
      const leak = 1 + 2 * now('breath');
      for (const [n, filter] of lower.entries()) {
        const width = (WIDTHS[n] ?? 100) * (n === 0 ? leak : now('damp'));
        filter.tune(formants[n] ?? 0, width);
      }
      hisser.tune(now);
      const flutter = FLUTTER.reduce(
        (sum, wobble) => sum + Math.sin(2 * Math.PI * wobble * seconds),
        0,
      );
      hertz =
        voice.pitch *
        2 ** (now('semitones') / 12) *
        (1 + (FLUTTER_DEPTH * voice.waver * flutter) / FLUTTER.length);
    },
    sound: (voicing, breath, hiss) => {
      let sample = excite(hertz, voicing, breath);
      for (const filter of lower) sample = filter.run(sample);
      for (const filter of upper) sample = filter.run(sample);
      return sample + hisser.run(hiss);
    },
  };
}

/** How loud each of a whistle's three tones is. */
const TONES = [1, 0.6, 0.35] as const;

/** No throat: a pure tone on each resonance, and the hiss as it is. */
function whistling(setting: Setting): Mouth {
  const { sampleRate } = setting;
  const hisser = hissing(setting);
  const phases = [0, 0, 0];
  let steps = [0, 0, 0];
  return {
    shape: (now) => {
      steps = [now('f1'), now('f2'), now('f3')].map(
        (hertz) => (2 * Math.PI * Math.min(hertz, sampleRate / 2)) / sampleRate,
      );
      hisser.tune(now);
    },
    sound: (voicing, breath, hiss) => {
      let sample = 0;
      for (const [n, tone] of TONES.entries()) {
        const phase = (phases[n] ?? 0) + (steps[n] ?? 0);
        phases[n] = phase;
        sample += tone * Math.sin(phase);
      }
      return sample * 0.5 * (voicing + 0.6 * breath) + hisser.run(hiss);
    },
  };
}

const mouthOf = (setting: Setting): Mouth =>
  setting.voice.source === 'whistle'
    ? whistling(setting)
    : resonant(setting.voice.source, setting);

/** `samples` with what stands still taken out and its loudest at `PEAK`. */
function levelled(samples: Float32Array, sampleRate: number): Float32Array {
  const keep = 1 - (2 * Math.PI * 40) / sampleRate;
  let last = 0;
  let out = 0;
  let peak = 0;
  for (const [n, sample] of samples.entries()) {
    out = sample - last + keep * out;
    last = sample;
    samples[n] = out;
    peak = Math.max(peak, Math.abs(out));
  }
  return peak > 0 ? samples.map((sample) => (sample * PEAK) / peak) : samples;
}

const reader =
  (track: Track) =>
  (curve: Curve, at: number): number => {
    const frame = Math.min(track.frames - 1, Math.floor(at));
    const values = track.curves[curve];
    const low = values[frame] ?? 0;
    return low + ((values[frame + 1] ?? low) - low) * (at - frame);
  };

/**
 * `line` said by `voice`, as samples within ±1 at `sampleRate`: the same
 * samples for the same line, voice and rate.
 */
export function utter(
  line: Line,
  voice: Voice,
  sampleRate: number,
): Float32Array {
  const track = trackOf(line, voice);
  const read = reader(track);
  const samples = new Float32Array(
    Math.round(track.frames * FRAME * sampleRate),
  );
  const random = noise(
    Math.floor(diceOf(voice.seed)(`utter/${line.text}`) * 2 ** 32),
  );
  const mouth = mouthOf({ voice, sampleRate, random });
  const perFrame = FRAME * sampleRate;
  let shaped = -1;
  for (let n = 0; n < samples.length; n += 1) {
    const at = n / perFrame;
    const frame = Math.floor(at);
    if (frame !== shaped) {
      mouth.shape((curve) => read(curve, frame), frame * FRAME);
      shaped = frame;
    }
    samples[n] = mouth.sound(
      read('voicing', at),
      read('breath', at),
      read('hiss', at),
    );
  }
  return levelled(samples, sampleRate);
}
