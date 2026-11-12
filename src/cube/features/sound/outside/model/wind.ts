import { chance, CYCLE, filterOf, noiseOf } from '../../dsp';
import { folded, type Loop } from './loop';

/**
 * Wind over an open beach, as it would sound if it never let up: air with no
 * edge to whistle on, so a soft band whose pitch drifts as the stream does,
 * over a low push and under a little breath. A gust is in its gain.
 */
export function wind(seed: number, rate: number): Loop {
  const noise = noiseOf(seed);
  const turns = [CYCLE * chance(noise), CYCLE * chance(noise)] as const;
  const stream = filterOf('band', rate);
  const push = filterOf('low', rate);
  const breath = filterOf('high', rate);
  return folded(15, 1.5, rate, (i, length) => {
    const white = noise();
    const x = (CYCLE * i) / length;
    const drift =
      0.45 * Math.sin(x + turns[0]) + 0.25 * Math.sin(3 * x + turns[1]);
    return (
      1.2 * stream(white, 480 * 2 ** drift, 1.3) +
      0.35 * push(white, 170, 0.6) +
      0.05 * breath(white, 3200, 0.7)
    );
  });
}

/**
 * Wind in one ear: the rumble of air tumbling over the ear itself, in fits.
 * Each ear has its own, since the eddies at one are not the other's.
 */
export function buffet(seed: number, rate: number): Loop {
  const noise = noiseOf(seed);
  const eddy = noiseOf(seed + 1);
  const rumble = filterOf('low', rate);
  const fits = filterOf('low', rate);
  return folded(8, 1, rate, () => {
    const fit = Math.max(0, 5 * fits(Math.abs(eddy()), 7, 0.9) - 1.4);
    return fit * rumble(noise(), 110, 0.9);
  });
}
