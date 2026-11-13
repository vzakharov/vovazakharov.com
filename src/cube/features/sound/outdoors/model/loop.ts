import type { Timed } from '@/kernel/shared/typings';

import { samplesIn } from '../../dsp';

/**
 * A stretch of sound that repeats with no seam, rendered a piece at a time so
 * that no frame waits for the whole of it. Its `seconds` divide the hour, so
 * a loop started at the clock's own place in it is the same sound for
 * everyone, all hour.
 */
export type Loop = Timed & {
  rate: number;
  /** The loop's samples; silence past what has been rendered. */
  samples: Float32Array<ArrayBuffer>;
  /** Renders up to `count` samples more; true once the loop is whole. */
  render: (count: number) => boolean;
};

/** The sample `i` of a loop `length` long, asked for in order. */
type Drawn = (i: number, length: number) => number;

/**
 * A loop of `seconds` whose sample `i` is `at(i, length)`, where `at` comes
 * round by itself: what it gives at `length` is what it gave at 0.
 */
export function turning(seconds: number, rate: number, at: Drawn): Loop {
  const length = samplesIn(seconds, rate);
  const samples = new Float32Array(length);
  let done = 0;
  return {
    rate,
    seconds,
    samples,
    render: (count) => {
      const upTo = Math.min(length, done + count);
      for (; done < upTo; done += 1) samples[done] = at(done, length);
      return done === length;
    },
  };
}

/** The loudness a folded loop is brought to, as a root mean square. */
const FOLDED_LOUDNESS = 0.2;

/**
 * A loop of `seconds` of something with no period of its own — noise through
 * filters: `fold` seconds more are drawn past its end and laid over its head
 * at equal power, and the whole is brought to one loudness, so every such
 * loop is as loud as every other and a layer's level is its gain alone.
 */
export function folded(
  seconds: number,
  fold: number,
  rate: number,
  at: Drawn,
): Loop {
  const length = samplesIn(seconds, rate);
  const over = samplesIn(fold, rate);
  const raw = new Float32Array(length + over);
  const samples = new Float32Array(length);
  let done = 0;
  const close = (): void => {
    let energy = 0;
    for (let i = 0; i < length; i += 1) {
      const here = raw[i] ?? 0;
      const along = i / over;
      const sample =
        along < 1
          ? Math.sqrt(along) * here +
            Math.sqrt(1 - along) * (raw[length + i] ?? 0)
          : here;
      samples[i] = sample;
      energy += sample * sample;
    }
    const scale = FOLDED_LOUDNESS / Math.sqrt(energy / length || 1);
    for (let i = 0; i < length; i += 1) {
      samples[i] = Math.tanh((samples[i] ?? 0) * scale);
    }
  };
  return {
    rate,
    seconds,
    samples,
    render: (count) => {
      if (done === raw.length) return true;
      const upTo = Math.min(raw.length, done + count);
      for (; done < upTo; done += 1) raw[done] = at(done, length);
      if (done < raw.length) return false;
      close();
      return true;
    },
  };
}

/** `loop`, rendered whole at once: for a test or a script, never a frame. */
export function whole(loop: Loop): Loop {
  loop.render(Number.POSITIVE_INFINITY);
  return loop;
}

/**
 * A loop's sample `at` seconds into the hour, between its two nearest: what an
 * ear hears of it at that moment whatever rate it is played at.
 */
export function heardAt({ samples, rate, seconds }: Loop, at: number): number {
  const along = (((at % seconds) + seconds) % seconds) * rate;
  const before = Math.floor(along) % samples.length;
  const here = samples[before] ?? 0;
  const next = samples[(before + 1) % samples.length] ?? 0;
  return here + (along - Math.floor(along)) * (next - here);
}
