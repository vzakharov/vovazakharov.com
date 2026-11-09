/** A complex signal as two equal-length arrays. */
export type Complex = { re: Float64Array; im: Float64Array };

const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

/**
 * An in-place radix-2 FFT: forward `X_k = Σ x_j e^{−2πijk/n}`, or with
 * `inverse` the same sum with `+`, unscaled.
 */
function transform({ re, im }: Complex, inverse: boolean) {
  const length = re.length;
  for (let j = 1, reversed = 0; j < length; j += 1) {
    let bit = length >> 1;
    for (; reversed & bit; bit >>= 1) reversed ^= bit;
    reversed ^= bit;
    if (j < reversed) {
      const tr = re[j] ?? 0;
      const ti = im[j] ?? 0;
      re[j] = re[reversed] ?? 0;
      im[j] = im[reversed] ?? 0;
      re[reversed] = tr;
      im[reversed] = ti;
    }
  }
  const sign = inverse ? 1 : -1;
  for (let size = 2; size <= length; size <<= 1) {
    const half = size >> 1;
    const angle = (sign * 2 * Math.PI) / size;
    for (let m = 0; m < half; m += 1) {
      const wr = Math.cos(angle * m);
      const wi = Math.sin(angle * m);
      for (let start = 0; start < length; start += size) {
        const a = start + m;
        const b = a + half;
        const br = re[b] ?? 0;
        const bi = im[b] ?? 0;
        const tr = br * wr - bi * wi;
        const ti = br * wi + bi * wr;
        const ar = re[a] ?? 0;
        const ai = im[a] ?? 0;
        re[a] = ar + tr;
        im[a] = ai + ti;
        re[b] = ar - tr;
        im[b] = ai - ti;
      }
    }
  }
}

function checked({ re, im }: Complex, what: string) {
  if (!isPowerOfTwo(re.length) || im.length !== re.length) {
    throw new Error(
      `${what}: ${re.length}/${im.length} values, need a power of two`,
    );
  }
}

function scale({ re, im }: Complex, factor: number) {
  for (let j = 0; j < re.length; j += 1) {
    re[j] = (re[j] ?? 0) * factor;
    im[j] = (im[j] ?? 0) * factor;
  }
}

/** In place: `X_k = Σ_j x_j e^{−2πijk/n}`, `n` a power of two. */
export function fft(signal: Complex): void {
  checked(signal, 'fft');
  transform(signal, false);
}

/** In place, `fft`'s inverse: `x_j = (1/n) Σ_k X_k e^{+2πijk/n}`. */
export function ifft(signal: Complex): void {
  checked(signal, 'ifft');
  transform(signal, true);
  scale(signal, 1 / signal.re.length);
}
