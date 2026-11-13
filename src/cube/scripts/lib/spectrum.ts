/** What a script measures of a sound: its spectrum over time, and its levels. */

/** Samples a spectrum's window holds, and how far the next one is moved on. */
const WINDOW = 2048;
const HOP = 512;

/** In-place radix-2 transform of `re`, `im`, whose length is a power of two. */
function transform(re: Float64Array, im: Float64Array): void {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j] ?? 0, re[i] ?? 0];
      [im[i], im[j]] = [im[j] ?? 0, im[i] ?? 0];
    }
  }
  for (let size = 2; size <= n; size *= 2) {
    const turn = (-2 * Math.PI) / size;
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < size / 2; k += 1) {
        const cos = Math.cos(turn * k);
        const sin = Math.sin(turn * k);
        const a = start + k;
        const b = a + size / 2;
        const bre = (re[b] ?? 0) * cos - (im[b] ?? 0) * sin;
        const bim = (re[b] ?? 0) * sin + (im[b] ?? 0) * cos;
        re[b] = (re[a] ?? 0) - bre;
        im[b] = (im[a] ?? 0) - bim;
        re[a] = (re[a] ?? 0) + bre;
        im[a] = (im[a] ?? 0) + bim;
      }
    }
  }
}

/** A sound's power in each of `WINDOW / 2` even bands, a column per hop. */
export type Spectrogram = {
  columns: Float64Array[];
  /** Hertz one band is wide, and seconds one column is. */
  hzPerBand: number;
  secondsPerColumn: number;
};

/** The spectrogram of `samples` at `rate`, each window a full-scale sine's power 1. */
export function spectrogramOf(
  samples: Float32Array,
  rate: number,
): Spectrogram {
  const hann = Float64Array.from(
    { length: WINDOW },
    (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / WINDOW),
  );
  const columns: Float64Array[] = [];
  for (let from = 0; from + WINDOW <= samples.length; from += HOP) {
    const re = Float64Array.from(hann, (w, i) => w * (samples[from + i] ?? 0));
    const im = new Float64Array(WINDOW);
    transform(re, im);
    columns.push(
      Float64Array.from({ length: WINDOW / 2 }, (_, band) => {
        const size = Math.hypot(re[band] ?? 0, im[band] ?? 0) / (WINDOW / 4);
        return size * size;
      }),
    );
  }
  return { columns, hzPerBand: rate / WINDOW, secondsPerColumn: HOP / rate };
}

/** A level as decibels under full scale; silence is −120. */
export const decibels = (power: number): number =>
  10 * Math.log10(Math.max(power, 1e-12));

/**
 * The power of `spectrogram` between `low` and `high` hertz, column by
 * column: how loud that part of the sound is over time.
 */
export function bandOver(
  { columns, hzPerBand }: Spectrogram,
  low: number,
  high: number,
): number[] {
  const from = Math.max(1, Math.round(low / hzPerBand));
  const to = Math.min(WINDOW / 2, Math.round(high / hzPerBand));
  return columns.map((column) => {
    let power = 0;
    for (let band = from; band < to; band += 1) power += column[band] ?? 0;
    // A Hann window spreads a tone over a band and a half.
    return power / 1.5;
  });
}

/** Hertz an ear hears as one band low down: what masks a tone is what is in it. */
const CRITICAL_BAND = 100;

/**
 * How far the clearest partial of `tone` stands over what `masker` puts in
 * the ear's band around it, in decibels, column by column, looking between
 * `low` and `high` hertz. An ear picks a steady tone out of noise from about
 * −4; at +10 nobody misses it.
 */
export function standingOut(
  tone: Spectrogram,
  masker: Spectrogram,
  low: number,
  high: number,
): number[] {
  const { hzPerBand, columns } = tone;
  const half = Math.round(CRITICAL_BAND / 2 / hzPerBand);
  const from = Math.max(half + 1, Math.round(low / hzPerBand));
  const to = Math.round(high / hzPerBand);
  return columns.map((column, at) => {
    const noise = masker.columns[at];
    let best = -120;
    for (let band = from; band < to; band += 1) {
      let partial = 0;
      for (let near = band - 1; near <= band + 1; near += 1) {
        partial += column[near] ?? 0;
      }
      let masking = 0;
      for (let near = band - half; near <= band + half; near += 1) {
        masking += noise?.[near] ?? 0;
      }
      best = Math.max(best, decibels(partial) - decibels(masking));
    }
    return best;
  });
}

export const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

/** The root mean square of `samples`, and their loudest, both in decibels. */
export function levelOf(samples: Float32Array): { rms: number; peak: number } {
  let energy = 0;
  let peak = 0;
  for (const sample of samples) {
    energy += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }
  return {
    rms: decibels(energy / Math.max(1, samples.length)),
    peak: decibels(peak * peak),
  };
}

/**
 * How well `a` follows `b`, from −1 to 1, at the shift of `b` (in steps, up
 * to `within` either way) where it follows best: that shift is how late `a`
 * is on `b`.
 */
export function following(
  a: readonly number[],
  b: readonly number[],
  within: number,
): { fit: number; late: number } {
  const fitAt = (shift: number): number => {
    const pairs: Array<[number, number]> = [];
    for (const [i, own] of a.entries()) {
      const other = b[i - shift];
      if (other !== undefined) pairs.push([own, other]);
    }
    const ma = mean(pairs.map(([x]) => x));
    const mb = mean(pairs.map(([, y]) => y));
    let top = 0;
    let va = 0;
    let vb = 0;
    for (const [x, y] of pairs) {
      top += (x - ma) * (y - mb);
      va += (x - ma) ** 2;
      vb += (y - mb) ** 2;
    }
    return top / Math.sqrt(va * vb || 1);
  };
  let best = { fit: -1, late: 0 };
  for (let late = -within; late <= within; late += 1) {
    const fit = fitAt(late);
    if (fit > best.fit) best = { fit, late };
  }
  return best;
}
