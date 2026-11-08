/** A complex signal as two equal-length arrays. */
export type Complex = { re: Float64Array; im: Float64Array };

const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

/**
 * An in-place radix-2 FFT of `length` values starting at `offset`, `stride`
 * apart: forward `X_k = Σ x_j e^{−2πijk/n}`, or with `inverse` the same sum
 * with `+`, unscaled.
 */
function transform(
  { re, im }: Complex,
  inverse: boolean,
  length: number,
  offset: number,
  stride: number,
) {
  const at = (j: number) => offset + j * stride;
  for (let j = 1, reversed = 0; j < length; j += 1) {
    let bit = length >> 1;
    for (; reversed & bit; bit >>= 1) reversed ^= bit;
    reversed ^= bit;
    if (j < reversed) {
      const a = at(j);
      const b = at(reversed);
      const tr = re[a] ?? 0;
      const ti = im[a] ?? 0;
      re[a] = re[b] ?? 0;
      im[a] = im[b] ?? 0;
      re[b] = tr;
      im[b] = ti;
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
        const a = at(start + m);
        const b = at(start + m + half);
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

function checked({ re, im }: Complex, n: number, what: string) {
  if (!isPowerOfTwo(n) || re.length !== n || im.length !== n) {
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
  checked(signal, signal.re.length, 'fft');
  transform(signal, false, signal.re.length, 0, 1);
}

/** In place, `fft`'s inverse: `x_j = (1/n) Σ_k X_k e^{+2πijk/n}`. */
export function ifft(signal: Complex): void {
  const n = signal.re.length;
  checked(signal, n, 'ifft');
  transform(signal, true, n, 0, 1);
  scale(signal, 1 / n);
}

function transform2(signal: Complex, n: number, inverse: boolean) {
  checked(signal, n * n, inverse ? 'ifft2' : 'fft2');
  for (let row = 0; row < n; row += 1)
    transform(signal, inverse, n, row * n, 1);
  for (let column = 0; column < n; column += 1) {
    transform(signal, inverse, n, column, n);
  }
}

/**
 * In place, on an `n × n` row-major grid (`n` a power of two), value `(x, y)`
 * at `y·n + x`: `X[ky·n + kx] = Σ x[y·n + x] e^{−2πi(kx·x + ky·y)/n}`.
 */
export function fft2(signal: Complex, n: number): void {
  transform2(signal, n, false);
}

/** In place, `fft2`'s inverse, scaled by `1/n²`. */
export function ifft2(signal: Complex, n: number): void {
  transform2(signal, n, true);
  scale(signal, 1 / (n * n));
}
