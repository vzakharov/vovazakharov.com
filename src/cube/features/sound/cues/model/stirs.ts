import {
  chance,
  CYCLE,
  dying,
  filterOf,
  noiseOf,
  sampled,
  swell,
} from '../../dsp';

/** Seconds a hinge creaks for. */
const CREAK_SECONDS = 1.6;

/**
 * A hinge or a floorboard giving: the wood sticking and slipping, a click
 * train whose rate wanders between a growl and a whine, rung through the
 * board.
 */
export function creak(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const tune = 1 + 0.2 * noise();
  const board = filterOf('band', rate);
  const body = filterOf('band', rate);
  let phase = 0;
  let wander = 0;
  return sampled(CREAK_SECONDS, rate, (t) => {
    const x = t / CREAK_SECONDS;
    wander += (noise() - wander) * (8 / rate);
    phase += (22 + 30 * x + 60 * wander) / rate;
    const click = phase % 1 < 0.08 ? 1 : 0;
    phase %= 1;
    const rung =
      board(click, 720 * tune, 9) + 0.6 * body(click, 1650 * tune, 12);
    return 1.8 * swell(x) ** 0.5 * rung;
  });
}

/** Seconds something is dragged for. */
const SCRAPE_SECONDS = 0.9;

/**
 * Furniture dragged over the floor: a grit of noise through the legs' rasp,
 * judders where they catch, and the floor's low complaint under it.
 */
export function scrape(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const tune = 1 + 0.15 * noise();
  const rasp = filterOf('band', rate);
  const floor = filterOf('low', rate);
  return sampled(SCRAPE_SECONDS, rate, (t) => {
    const x = t / SCRAPE_SECONDS;
    const judder = 0.55 + 0.45 * Math.sin(CYCLE * (17 + 6 * x) * t) ** 2;
    const grit = noise();
    return (
      swell(x) ** 0.4 *
      judder *
      (2.4 * rasp(grit, 520 * tune, 2.5) + 3 * floor(grit, 140, 0.9))
    );
  });
}

/** Seconds paper is heard rustling, and crinkles in that time. */
const RUSTLE_SECONDS = 1.2;
const CRINKLES = 26;

/** A draw in `[0, 1)` bunched toward the middle. */
const swellPick = (draw: number): number =>
  0.5 + (Math.asin(2 * draw - 1) / Math.PI) * 0.9;

/** Paper moving: a run of crinkles, bright and brief, thickest midway. */
export function rustle(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const crinkles = Array.from({ length: CRINKLES }, () => {
    const at = RUSTLE_SECONDS * swellPick(chance(noise));
    return { at, force: 0.4 + 0.6 * chance(noise) };
  });
  const bright = filterOf('high', rate);
  return sampled(RUSTLE_SECONDS + 0.05, rate, (t) => {
    const crinkled = crinkles.reduce(
      (sum, { at, force }) => sum + force * dying(t - at, 0.025),
      0,
    );
    return 1.6 * bright(noise() * crinkled, 2800, 0.8);
  });
}

/** A balloon bursting: a crack of air over the thump of its skin letting go. */
export function pop(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const hz = 70 * (1 + 0.2 * noise());
  const air = filterOf('low', rate);
  return sampled(0.35, rate, (t) => {
    const crack = air(noise(), 5200 * dying(t, 0.05) + 300, 0.7);
    const thump = Math.sin(CYCLE * hz * t) * dying(t, 0.12);
    return 3 * crack * dying(t, 0.06) + 0.8 * thump;
  });
}

/** Seconds a cat's mew lasts. */
const MEW_SECONDS = 0.7;

/**
 * A cat: a voice that rises and falls back through an open mouth, `me` then
 * `ow`, the vowel narrowing as it closes.
 */
export function mew(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const tune = 1 + 0.12 * noise();
  const first = filterOf('band', rate);
  const second = filterOf('band', rate);
  let phase = 0;
  return sampled(MEW_SECONDS, rate, (t) => {
    const x = t / MEW_SECONDS;
    const hz = tune * (520 + 300 * Math.sin(Math.PI * Math.min(1, 1.4 * x)));
    phase = (phase + hz / rate) % 1;
    const voiced = 2 * phase - 1 + 0.08 * noise();
    const open = 1 - 0.6 * x;
    const vowel =
      first(voiced, 900 + 500 * open, 6) +
      0.7 * second(voiced, 2200 + 900 * open, 8);
    return 1.4 * swell(x) ** 0.5 * vowel;
  });
}
