import { ENERGY_DIGITS } from './energy-data';
import { VOICE_DIGITS } from './voice-data';

/** Frames a second of the loudness `energy` and `voice` read. */
export const ENERGY_RATE = 30;

/**
 * The loudness `digits` hold at `t`, in `[0, 1]`: a digit a frame, eased
 * between frames. Before the first frame and past the last, 0.
 */
function levelAt(digits: string, t: number): number {
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

/** How loud the mix is at `t`, in `[0, 1]`: 0 in a hole, 1 on the loudest stab. */
export const energy = (t: number, digits: string = ENERGY_DIGITS): number =>
  levelAt(digits, t);

/**
 * How loud the lead vocal is at `t`, in `[0, 1]`, read off its stem;
 * `undefined` where the stem has no frame, which is past its end.
 */
export const voice = (
  t: number,
  digits: string = VOICE_DIGITS,
): number | undefined =>
  t >= 0 && t * ENERGY_RATE < digits.length - 1
    ? levelAt(digits, t)
    : undefined;
