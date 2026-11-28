/** The Hann window's weights for `size` samples, cached per size. */
const hanns = new Map<number, Float64Array>();

function hann(size: number): Float64Array {
  const cached = hanns.get(size);
  if (cached) return cached;
  const weights = Float64Array.from(
    { length: size },
    (_, n) => 0.5 - 0.5 * Math.cos((2 * Math.PI * n) / (size - 1)),
  );
  hanns.set(size, weights);
  return weights;
}

/**
 * The magnitude of each frequency bin of `frame`, Hann-windowed, bins
 * `0 … size / 2`. `frame.length` must be a power of two.
 */
export function magnitudes(frame: Float32Array): Float64Array {
  const size = frame.length;
  if (size === 0 || (size & (size - 1)) !== 0)
    throw new Error(`A frame of ${String(size)} is not a power of two`);
  const window = hann(size);
  const re = Float64Array.from(frame, (sample, n) => sample * (window[n] ?? 0));
  const im = new Float64Array(size);

  // Bit-reversed order, then the butterflies of an in-place radix-2 FFT.
  for (let n = 1, m = 0; n < size; n += 1) {
    let bit = size >> 1;
    for (; m & bit; bit >>= 1) m ^= bit;
    m ^= bit;
    if (n < m) {
      [re[n], re[m]] = [re[m] ?? 0, re[n] ?? 0];
      [im[n], im[m]] = [im[m] ?? 0, im[n] ?? 0];
    }
  }
  for (let span = 2; span <= size; span <<= 1) {
    const turn = (-2 * Math.PI) / span;
    for (let start = 0; start < size; start += span) {
      for (let k = 0; k < span / 2; k += 1) {
        const wr = Math.cos(turn * k);
        const wi = Math.sin(turn * k);
        const a = start + k;
        const b = a + span / 2;
        const br = re[b] ?? 0;
        const bi = im[b] ?? 0;
        const tr = br * wr - bi * wi;
        const ti = br * wi + bi * wr;
        re[b] = (re[a] ?? 0) - tr;
        im[b] = (im[a] ?? 0) - ti;
        re[a] = (re[a] ?? 0) + tr;
        im[a] = (im[a] ?? 0) + ti;
      }
    }
  }
  return Float64Array.from({ length: size / 2 + 1 }, (_, bin) =>
    Math.hypot(re[bin] ?? 0, im[bin] ?? 0),
  );
}
