/** How much of `samples` sounds at `hertz`: the Goertzel sum, per sample. */
export function powerAt(
  samples: Float32Array,
  sampleRate: number,
  hertz: number,
): number {
  const turn = 2 * Math.cos((2 * Math.PI * hertz) / sampleRate);
  let last = 0;
  let before = 0;
  for (const sample of samples) {
    const next = sample + turn * last - before;
    before = last;
    last = next;
  }
  return (
    (last * last + before * before - turn * last * before) / samples.length ** 2
  );
}

/** The power of `samples` wholeBetween `from` and `to` hertz, read every 50. */
export function powerIn(
  samples: Float32Array,
  sampleRate: number,
  from: number,
  to: number,
): number {
  let sum = 0;
  for (let hertz = from; hertz <= to; hertz += 50) {
    sum += powerAt(samples, sampleRate, hertz);
  }
  return sum;
}
