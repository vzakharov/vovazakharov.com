import { clamp01 } from '@/cube/shared/lib/ease';

import {
  chance,
  CYCLE,
  dying,
  filterOf,
  noiseOf,
  sampled,
  type Struck,
  swell,
} from '../../dsp';

/** A bubble of air under water, and the second of the splash it closes at. */
type Bubble = Struck & { closes: number };

/** Seconds a bubble sings for. */
const BUBBLE_DIES = 0.045;

/**
 * A body entering or moving through water. `strength` runs from 0 (a hand
 * trailed through it) to 1 (falling in): a harder one is longer, lower and
 * throws more water. The slap of the surface, the sheet of water thrown and
 * falling back as a hiss that darkens, and the bubbles dragged under closing
 * one by one.
 */
export function splash(
  strength: number,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const hard = clamp01(strength);
  const noise = noiseOf(seed);
  const seconds = 0.45 + 0.75 * hard;
  const bubbles: readonly Bubble[] = Array.from(
    { length: Math.round(4 + 14 * hard) },
    () => ({
      closes: 0.03 + (seconds - 0.12) * chance(noise) ** 1.6,
      hz: (520 + 2400 * chance(noise) ** 2) * (1.3 - 0.5 * hard),
      force: 0.12 + 0.3 * chance(noise),
      dies: BUBBLE_DIES,
    }),
  );
  const slap = filterOf('low', rate);
  const sheet = filterOf('band', rate);
  const spray = filterOf('high', rate);
  return sampled(seconds, rate, (t) => {
    const x = t / seconds;
    const hit =
      hard * 2.2 * slap(noise(), 260 - 90 * hard, 0.9) * dying(t, 0.07);
    const thrown =
      (0.5 + 0.9 * hard) *
      sheet(noise(), (2600 - 900 * hard) * 2 ** (-1.6 * x), 0.6) *
      swell(0.12 + 0.88 * x) ** 0.5 *
      dying(t, seconds * 1.4);
    const fell = 0.35 * spray(noise(), 4200, 0.7) * swell((x - 0.15) / 0.85);
    let sang = 0;
    for (const { closes, hz, force, dies } of bubbles) {
      const since = t - closes;
      if (since < 0 || since > 2 * dies) continue;
      // A closing bubble's pitch climbs as it shrinks.
      const rising = hz * (1 + 4 * since);
      sang += force * Math.sin(CYCLE * rising * since) * dying(since, dies);
    }
    return (0.3 + 0.7 * hard) * (hit + thrown + fell + sang);
  });
}
