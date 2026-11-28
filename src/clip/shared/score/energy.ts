import { ENERGY_DIGITS } from './energy-data';

/** Frames a second of the loudness `energy` reads. */
export const ENERGY_RATE = 30;

/**
 * How loud the mix is at `t`, in `[0, 1]`: 0 in a hole, 1 on the loudest
 * stab, eased between frames. Before the song and after it, 0.
 */
export function energy(t: number, digits: string = ENERGY_DIGITS): number {
  const at = t * ENERGY_RATE;
  const frame = Math.floor(at);
  const level = (n: number) => {
    const digit = digits[n];
    return digit === undefined ? 0 : Number(digit) / 9;
  };
  if (frame < 0) return 0;
  const share = at - frame;
  return level(frame) * (1 - share) + level(frame + 1) * share;
}
