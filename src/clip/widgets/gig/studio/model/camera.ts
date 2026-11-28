import type { Zooming } from '@/scene/shared/lib/plane';

import { noise, type Point } from '@/clip/shared/ink';
import { KICKS, pulse, punch } from '@/clip/shared/score';

/** Where a jerked camera sits against its rest: an offset, a turn in degrees and a zoom. */
export type Jerk = Zooming & { shift: Point; rot: number };

/** How hard the camera is thrown about; every field scales one of its motions. */
export type Violence = {
  /** How far the camera lands off its mark on a cut, before it snaps back. */
  whip?: number;
  /** How hard a kick knocks it. */
  kick?: number;
  /** How much the hand holding it shakes between hits. */
  shake?: number;
};

// How fast a whip dies away, and how fast it swings through its mark, per second.
const WHIP_DAMP = 6;
const WHIP_SWING = 17;
// How often the holding hand's shake changes its mind, a second.
const SHAKE_RATE = 15;
// Seconds over which a pulse's knock falls to a third.
const BEAT_DECAY = 0.1;

/** A heading for throw `n` of `key`, as a unit vector: never a throw that goes nowhere. */
function thrown(key: number, n: number): [number, number] {
  const angle = Math.PI * noise(key, n);
  return [Math.cos(angle), Math.sin(angle)];
}

/**
 * The camera at `playhead` for a shot cut at `cut`: it lands off its mark on
 * the cut and swings through it once before it settles, is knocked on every
 * kick and less on every pulse, and shakes in between. Each cut and each kick
 * throws it its own way; a pure function of its arguments.
 */
export function jerk(
  playhead: number,
  cut: number,
  { whip = 1, kick = 1, shake = 1 } = {},
): Jerk {
  const since = Math.max(0, playhead - cut);
  const key = Math.round(cut * 1000);
  const swing =
    whip * Math.exp(-WHIP_DAMP * since) * Math.cos(WHIP_SWING * since);
  const kicked = kick * punch(KICKS, playhead);
  const kickKey = KICKS.findLastIndex((hit) => hit <= playhead);
  const { fraction, seconds } = pulse(playhead);
  const beat = kick * 0.6 * Math.exp(-(fraction * seconds) / BEAT_DECAY);
  const step = Math.floor(playhead * SHAKE_RATE);
  const [whipX, whipY] = thrown(key, 1);
  const [kickX, kickY] = thrown(kickKey, 3);
  // A turn always one way or the other, never a near-zero one.
  const lean = (k: number, n: number): number =>
    Math.sign(noise(k, n)) * (0.6 + 0.4 * Math.abs(noise(k, n + 1)));
  return {
    shift: [
      swing * whipX * 220 + kicked * kickX * 90 + shake * noise(step, 5) * 14,
      swing * whipY * 150 +
        kicked * kickY * 60 +
        beat * 34 +
        shake * noise(step, 6) * 12,
    ],
    rot:
      swing * lean(key, 4) * 14 +
      kicked * lean(kickKey, 7) * 7 +
      shake * noise(step, 9) * 1.2,
    zoom: 1 + Math.abs(swing) * 0.22 + kicked * 0.25 + beat * 0.08,
  };
}
