import assert from 'node:assert/strict';

export const RATE = 48_000;

/** The loudest sample of `samples`. */
export function peak(samples: Float32Array): number {
  let most = 0;
  for (const sample of samples) most = Math.max(most, Math.abs(sample));
  return most;
}

/** Fails unless every sample of `samples` is finite and inside ±1, and some is heard. */
export function assertAudible(samples: Float32Array): void {
  assert.ok(samples.length > 0);
  assert.ok(samples.every((sample) => Number.isFinite(sample)));
  assert.ok(samples.every((sample) => Math.abs(sample) <= 1));
  assert.ok(peak(samples) > 0.01, `too quiet: ${peak(samples)}`);
}

/** The root mean square of `samples`. */
export const loudness = (samples: Float32Array): number =>
  Math.sqrt(
    samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length,
  );

/**
 * The share of `samples`' energy above `hz`, by a one-pole split: enough to
 * tell a bright sound from a dull one.
 */
export function brightness(samples: Float32Array, hz: number): number {
  const keep = Math.exp((-2 * Math.PI * hz) / RATE);
  let low = 0;
  let high = 0;
  let all = 0;
  for (const sample of samples) {
    low = keep * low + (1 - keep) * sample;
    high += (sample - low) ** 2;
    all += sample * sample;
  }
  return high / all;
}
