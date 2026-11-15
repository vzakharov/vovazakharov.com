import { chance, CYCLE, dying, filterOf, noiseOf, samplesIn } from '../../dsp';

/** Seconds a room's hum and its air each loop over. */
const HUM_SECONDS = 2;
const AIR_SECONDS = 4;

/** The highest partial the hum carries, in hertz, and how many at most. */
const HUM_TOP = 5000;
const HUM_PARTIALS = 40;

/** Points one period of the hum is drawn with: a hundred to its highest partial's turn. */
const HUM_TABLE = 4096;

/** Where a ballast's buzz sits, in hertz, and how wide. */
const BUZZ = 2800;
const BUZZ_WIDTH = 900;

/** The hum's loudest sample. */
const HUM_PEAK = 0.6;

/**
 * A loop of the lamps' hum at `hz`: the fundamental, its harmonics falling
 * away with the odd ones forward, and the ballast's buzz where they pass
 * `BUZZ`. The loop holds a whole number of periods and of its slow waver, so
 * it repeats with no seam; that rounds the pitch by under a quarter hertz.
 */
export function hum(
  hz: number,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  if (!(hz > 0)) return new Float32Array(1);
  const noise = noiseOf(seed);
  const periods = Math.max(1, Math.round(hz * HUM_SECONDS));
  const length = samplesIn(periods / hz, rate);
  const count = Math.max(1, Math.min(HUM_PARTIALS, Math.floor(HUM_TOP / hz)));
  const partials = Array.from({ length: count }, (_, index) => {
    const k = index + 1;
    const buzz = 1 + 4 * Math.exp(-(((k * hz - BUZZ) / BUZZ_WIDTH) ** 2));
    const lean = k === 1 ? 1 : (k % 2 === 1 ? 0.5 : 0.3) / k ** 0.9;
    return {
      k,
      level: lean * buzz * (0.4 + 0.6 * chance(noise)),
      phase: CYCLE * chance(noise),
    };
  });
  const total = partials.reduce((sum, { level }) => sum + level, 0);
  // One period, summed once; the loop reads along it, so a change of place
  // costs a table rather than every partial at every sample.
  const period = Float64Array.from({ length: HUM_TABLE }, (_, at) =>
    partials.reduce(
      (sounding, { k, level, phase }) =>
        sounding + level * Math.sin((k * CYCLE * at) / HUM_TABLE + phase),
      0,
    ),
  );
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const along = (((periods * i) / length) % 1) * HUM_TABLE;
    const at = Math.floor(along);
    const here = period[at] ?? 0;
    const sum =
      here + (along - at) * ((period[(at + 1) % HUM_TABLE] ?? 0) - here);
    const waver = 1 + 0.06 * Math.sin((3 * CYCLE * i) / length);
    samples[i] = (HUM_PEAK / total) * waver * sum;
  }
  return samples;
}

/** Seconds of the air's tail folded over its head to close the loop. */
const AIR_FOLD = 0.5;

/**
 * A loop of moving air at full strength: noise rounded off low, with a duct's
 * body in it, breathing slowly. Its tail is folded over its head at equal
 * power, so it repeats with no seam.
 */
export function air(seed: number, rate: number): Float32Array<ArrayBuffer> {
  const noise = noiseOf(seed);
  const length = samplesIn(AIR_SECONDS, rate);
  const fold = samplesIn(AIR_FOLD, rate);
  const round = filterOf('low', rate);
  const duct = filterOf('band', rate);
  const raw = new Float32Array(length + fold);
  for (let i = 0; i < raw.length; i += 1) {
    const white = noise();
    const breathing = 1 + 0.25 * Math.sin((CYCLE * i) / length);
    raw[i] =
      breathing * (0.5 * round(white, 900, 0.6) + 0.8 * duct(white, 320, 0.9));
  }
  const samples = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const here = raw[i] ?? 0;
    const along = i / fold;
    const folded =
      along < 1
        ? Math.sqrt(along) * here +
          Math.sqrt(1 - along) * (raw[length + i] ?? 0)
        : here;
    samples[i] = Math.tanh(folded);
  }
  return samples;
}

/** The shortest tail a room is given, in seconds: a padded cell still has one. */
const SHORTEST_ECHO = 0.08;

/** How many first reflections stand out of the tail. */
const REFLECTIONS = 6;

/** Samples the tail's darkening filter holds one tuning for. */
const RETUNE_EVERY = 64;

/**
 * A room's impulse response, its tail `echo` seconds to −60 dB: a few first
 * reflections off the walls, then noise dying away and darkening as it goes.
 * It carries unit energy, so a longer tail is not a louder room.
 */
export function impulse(
  echo: number,
  seed: number,
  rate: number,
): Float32Array<ArrayBuffer> {
  const seconds = Math.max(SHORTEST_ECHO, echo);
  const noise = noiseOf(seed);
  const length = samplesIn(seconds, rate);
  const dark = filterOf('low', rate);
  const samples = new Float32Array(length);
  let energy = 0;
  let corner = 0;
  for (let i = 0; i < length; i += 1) {
    const x = i / length;
    // The filter retunes a block at a time: tuning it is most of a sample's cost.
    if (i % RETUNE_EVERY === 0) corner = 800 + 9000 * Math.exp(-3 * x);
    const sample = dark(noise(), corner, 0.7) * dying(x, 1);
    samples[i] = sample;
    energy += sample * sample;
  }
  // Reflections come within the first 60 ms of a small room, later in a big one.
  const within = Math.min(length - 1, 0.06 * (1 + seconds) * rate);
  for (let tap = 0; tap < REFLECTIONS; tap += 1) {
    const at = Math.floor(chance(noise) * within);
    const sample = (samples[at] ?? 0) + (noise() < 0 ? -1 : 1) / (2 + tap);
    energy += sample * sample - (samples[at] ?? 0) ** 2;
    samples[at] = sample;
  }
  const scale = 1 / Math.sqrt(energy);
  return samples.map((sample) => sample * scale);
}
