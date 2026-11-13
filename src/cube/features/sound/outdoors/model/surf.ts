import { chance, CYCLE, filterOf, noiseOf } from '../../dsp';
import { folded, type Loop } from './loop';

/**
 * The break offshore, as it would sound if it never stopped: the low roar of
 * water falling on water, tumbling unevenly, over the weight of the thump
 * under it. The wave that is breaking is in its gain, not in the loop.
 */
export function roar(seed: number, rate: number): Loop {
  const noise = noiseOf(seed);
  const churn = noiseOf(seed + 1);
  const low = filterOf('low', rate);
  const body = filterOf('band', rate);
  const weight = filterOf('band', rate);
  const tumble = filterOf('low', rate);
  return folded(12, 1, rate, () => {
    const white = noise();
    // Water falls in lumps: the roar's level wanders several times a second.
    const lumps = 0.4 + 2.4 * tumble(Math.abs(churn()), 5, 0.7);
    return (
      lumps * (1.6 * low(white, 620, 0.6) + 0.8 * body(white, 170, 0.8)) +
      0.9 * weight(white, 58, 1.1)
    );
  });
}

/**
 * The sheet of a spent wave running up the sand: a bright hiss, grained by
 * the thousands of small collapses in its front edge.
 */
export function hiss(seed: number, rate: number): Loop {
  const noise = noiseOf(seed);
  const grain = noiseOf(seed + 1);
  const floor = filterOf('high', rate);
  const roof = filterOf('low', rate);
  const sizzle = filterOf('low', rate);
  return folded(10, 1, rate, () => {
    const grained = 0.5 + 1.6 * sizzle(Math.abs(grain()), 45, 0.7);
    return grained * roof(floor(noise(), 1700, 0.7), 8500, 0.7);
  });
}

/** Bubbles bursting in a second of draining foam beside the ear. */
const BURSTS = 900;

/** How many bubbles are heard ringing at once. */
const RINGING = 12;

/** Seconds a burst bubble rings for. */
const BURST_DIES = 0.004;

/**
 * The backwash: foam left on the sand fizzing out as its bubbles burst, each
 * a tick at a pitch of its own too short to hear as one, over the dull drag
 * of water and grains drawn back down the slope.
 */
export function fizz(seed: number, rate: number): Loop {
  const noise = noiseOf(seed);
  const burst = noiseOf(seed + 1);
  const drag = filterOf('band', rate);
  const air = filterOf('high', rate);
  const fading = Math.exp(-6.9 / (BURST_DIES * rate));
  const turns = new Float64Array(RINGING);
  const steps = new Float64Array(RINGING);
  const louds = new Float64Array(RINGING);
  let next = 0;
  return folded(9, 1, rate, () => {
    const white = noise();
    if (chance(burst) < BURSTS / rate) {
      // Small bubbles are the many and the high ones.
      steps[next] = (2400 * 4 ** chance(burst)) / rate;
      louds[next] = 0.3 + 0.7 * chance(burst);
      turns[next] = 0;
      next = (next + 1) % RINGING;
    }
    let ticked = 0;
    for (let n = 0; n < RINGING; n += 1) {
      const loud = louds[n] ?? 0;
      turns[n] = (turns[n] ?? 0) + (steps[n] ?? 0);
      ticked += loud * Math.sin(CYCLE * (turns[n] ?? 0));
      louds[n] = loud * fading;
    }
    return ticked + 0.1 * air(white, 5200, 0.7) + 0.35 * drag(white, 430, 0.9);
  });
}

/**
 * The open sea all around, further off than any one wave: every break and
 * every slap for a mile run together, darker than the surf at hand and
 * heaving slowly.
 */
export function wash(seed: number, rate: number): Loop {
  const noise = noiseOf(seed);
  const turn = CYCLE * chance(noise);
  const deep = filterOf('low', rate);
  const middle = filterOf('low', rate);
  const top = filterOf('low', rate);
  return folded(20, 2, rate, (i, length) => {
    const white = noise();
    const heave = 1 + 0.22 * Math.sin((2 * CYCLE * i) / length + turn);
    return (
      heave *
      (deep(white, 240, 0.5) +
        0.6 * middle(white, 1100, 0.5) +
        0.2 * top(white, 3600, 0.5))
    );
  });
}
