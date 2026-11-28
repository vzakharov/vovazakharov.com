import { spawnSync } from 'node:child_process';

/** Audio read at `samplingHz` samples a second. */
export type Sampled = { samplingHz: number };

export type Decoding = Sampled & {
  /** Seconds skipped at the file's start. */
  skip?: number;
};

/** `file` as mono float samples at `samplingHz`. */
export function decode(
  file: string,
  { samplingHz, skip = 0 }: Decoding,
): Float32Array {
  const run = spawnSync(
    'ffmpeg',
    [
      ['-hide_banner', '-loglevel', 'error'],
      ['-ss', String(skip), '-i', file],
      ['-ac', '1', '-ar', String(samplingHz), '-f', 'f32le', '-'],
    ].flat(),
    { maxBuffer: 1 << 30 },
  );
  if (run.status !== 0) throw new Error(`ffmpeg could not decode ${file}`);
  const { buffer, byteOffset, byteLength } = run.stdout;
  return new Float32Array(buffer.slice(byteOffset, byteOffset + byteLength));
}

/** The mean power of `samples[from, to)`, in dB below full scale. */
export function powerDb(
  samples: Float32Array,
  from: number,
  to: number,
): number {
  let sum = 0;
  for (let n = from; n < to; n += 1) sum += (samples[n] ?? 0) ** 2;
  return 10 * Math.log10(sum / Math.max(1, to - from) + 1e-12);
}
