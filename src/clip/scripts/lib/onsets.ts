import type { Ranged } from '@/kernel/shared/typings';

import type { Sampled } from './decode';
import { magnitudes } from './spectrum';

export type Picking = Sampled & {
  /** The band read, in Hz. */
  band: Ranged;
  /** How far the band's level must climb over `RISE_HOPS` to count, in dB. */
  minRise: number;
  /** The shortest time between two onsets, in seconds. */
  minGap: number;
};

const WINDOW = 2048;
const HOP = 128;
/** The span a rise is measured over: about 23 ms at 22.05 kHz. */
const RISE_HOPS = 4;
/** How many hops either side an onset's rise must top. */
const PEAK_HOPS = 5;

/**
 * The times, in seconds, at which the band of `samples` jumps in level: each
 * a local peak of the climb in dB over `RISE_HOPS` hops, above `minRise`
 * and more than `minGap` after the one before.
 */
export function onsets(
  samples: Float32Array,
  { samplingHz, band, minRise, minGap }: Picking,
): number[] {
  const binHz = samplingHz / WINDOW;
  const first = Math.ceil(band.from / binHz);
  const last = Math.ceil(band.to / binHz);
  const frames = Math.max(0, Math.floor((samples.length - WINDOW) / HOP) + 1);
  const level = Array.from({ length: frames }, (_, n) => {
    const bins = magnitudes(samples.subarray(n * HOP, n * HOP + WINDOW));
    let sum = 0;
    for (let bin = first; bin < last; bin += 1) sum += bins[bin] ?? 0;
    return 20 * Math.log10(sum + 1e-6);
  });
  const climb = level.map((db, n) =>
    Math.max(0, db - (level[n - RISE_HOPS] ?? db)),
  );
  const picked: number[] = [];
  for (const [n, height] of climb.entries()) {
    const around = climb.slice(Math.max(0, n - PEAK_HOPS), n + PEAK_HOPS + 1);
    const time = (n * HOP) / samplingHz;
    const previous = picked.at(-1) ?? Number.NEGATIVE_INFINITY;
    if (
      height > minRise &&
      height >= Math.max(...around) &&
      time - previous > minGap
    )
      picked.push(time);
  }
  return picked;
}
