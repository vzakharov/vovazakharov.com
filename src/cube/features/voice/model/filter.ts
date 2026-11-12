/** A filter with memory: tuned now and then, run once a sample. */
export type Filter = {
  tune: (hertz: number, width: number) => void;
  run: (sample: number) => number;
};

/** The share of the sample rate past which a resonance cannot be made. */
const REACH = 0.47;

/**
 * One resonance of the throat: a two-pole filter passing what is far below
 * `hertz` as it came and ringing at `hertz`, the more the narrower `width`.
 * Tuned out of the sample rate's reach, it passes everything as it came.
 */
export function resonator(sampleRate: number): Filter {
  let a = 1;
  let b = 0;
  let c = 0;
  let last = 0;
  let before = 0;
  return {
    tune: (hertz, width) => {
      const within = hertz < REACH * sampleRate;
      c = within ? -Math.exp((-2 * Math.PI * width) / sampleRate) : 0;
      b = within
        ? 2 *
          Math.exp((-Math.PI * width) / sampleRate) *
          Math.cos((2 * Math.PI * hertz) / sampleRate)
        : 0;
      a = 1 - b - c;
    },
    run: (sample) => {
      const out = a * sample + b * last + c * before;
      before = last;
      last = out;
      return out;
    },
  };
}

/** A band of whatever is put in, `width` hertz around `hertz`, as loud as it came. */
export function bandpass(sampleRate: number): Filter {
  let gain = 0;
  let b = 0;
  let c = 0;
  let in1 = 0;
  let in2 = 0;
  let out1 = 0;
  let out2 = 0;
  return {
    tune: (hertz, width) => {
      const centre = Math.min(hertz, REACH * sampleRate);
      const radius = Math.exp((-Math.PI * width) / sampleRate);
      gain = (1 - radius * radius) / 2;
      b = 2 * radius * Math.cos((2 * Math.PI * centre) / sampleRate);
      c = -radius * radius;
    },
    run: (sample) => {
      const out = gain * (sample - in2) + b * out1 + c * out2;
      in2 = in1;
      in1 = sample;
      out2 = out1;
      out1 = out;
      return out;
    },
  };
}

/** White noise on `[-1, 1)` grown from `seed`, the same for the same seed. */
export function noise(seed: number): () => number {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 2 ** 31 - 1;
  };
}
