/**
 * The ground's shape as a function of the signed distance to the coast and
 * of noise octaves the caller draws, wherever they are drawn
 * (`heightAtSphere` draws them in space).
 */

/** The interior's base height, approached with distance from the coast. */
const PLATEAU_METRES = 1000;
/** The distance inland over which the plateau climbs to ~63% of its height. */
const PLATEAU_REACH_METRES = 180_000;

/** The ocean's depth far from the coast. */
const ABYSS_METRES = 3500;
/** The distance offshore over which the sea floor falls to ~63% of it. */
const SHELF_REACH_METRES = 30_000;

/** The longest noise octave; each next one halves the wavelength. */
const LONGEST_WAVELENGTH_METRES = 400_000;
/**
 * Each octave's amplitude in metres, longest first (400 km … 6 m). The
 * regional band (400–50 km) falls fast; the hill band (25 km–400 m) slowly,
 * so hills of a hundred metres and more stand over a few kilometres; the
 * fine band halves per halving — a constant slope of ~0.1 per octave — so
 * every scale down to a step's length has relief and none is a cliff.
 */
const AMPLITUDES_METRES = [
  600, 380, 260, 200, 240, 220, 190, 150, 110, 75, 45, 20, 10, 5, 2.5, 1.25,
  0.6,
] as const;
/**
 * How much of the regional octaves — wavelengths of `REGIONAL_METRES` and
 * up — survives at the coast and at sea. The shorter octaves keep their full
 * size everywhere, faded only near the coastline, so every lowland has hills.
 */
const COASTAL_ROUGHNESS = 0.25;
const REGIONAL_METRES = 50_000;
/** The distance inland over which the noise grows to ~63% of its full size. */
const ROUGHNESS_REACH_METRES = 300_000;
/** The shortest octave of the hill band, whose noise is `humped`. */
const HILL_METRES = 300;

/**
 * The least height inland ground keeps, approached with distance from the
 * coast and zero on it: where the noise's troughs would sink the land below
 * the sea, it levels out a little above it instead, so no sea shows inland
 * and the coastline stays the field's zero line.
 */
const LOWLAND_METRES = 15;
/** The distance inland over which the least height climbs to ~63% of it. */
const LOWLAND_REACH_METRES = 5000;
/**
 * The shortest wavelength the lowland floor follows: inland ground rests on
 * the relief of the octaves this long and longer, not on a level sheet.
 */
const BROAD_METRES = 400;
/**
 * How much wider than the lowland the band over the floor is where ground
 * under it is squeezed rather than cut: by `reach·(1 − reach)³` of it, widest
 * (a tenth) ~1.4 km in and gone a dozen kilometres in. The deeper a trough,
 * the closer to the floor it lies, so a basin keeps its relief, smaller, and
 * shades.
 */
const SQUEEZE_METRES = 200;

const NOISE_REACH_METRES = AMPLITUDES_METRES.reduce((sum, a) => sum + a, 0);
/**
 * How far the octaves shorter than `BROAD_METRES` reach together, and so how
 * far below the broad relief the floor sinks with distance from the coast:
 * once it is that deep no trough reaches it, and inland relief is the noise's.
 */
const FINE_REACH_METRES = AMPLITUDES_METRES.filter(
  (_, o) => LONGEST_WAVELENGTH_METRES / 2 ** o < BROAD_METRES,
).reduce((sum, a) => sum + a, 0);
/** No ground lies higher than this, metres above sea level. */
export const HIGHEST_GROUND = PLATEAU_METRES + NOISE_REACH_METRES;
/** No ground lies lower than this, metres above sea level. */
export const LOWEST_GROUND = -ABYSS_METRES - NOISE_REACH_METRES;

/**
 * Noise in `[-1, 1]` bent onto `[-0.23, 1]` by a parabola, flat at the
 * bottom: hills rise to full height and valleys stay broad and shallow.
 */
const humped = (n: number) => n * (0.6 + 0.4 * n);

/** One noise octave; `index`, its place in `OCTAVES`, keys its lattice. */ export type Octave =
  {
    readonly index: number;
    readonly cyclesPerMetre: number;
    readonly amplitude: number;
    readonly wavelength: number;
    readonly regional: boolean;
    readonly hill: boolean;
    readonly broad: boolean;
  };

export const OCTAVES: readonly Octave[] = AMPLITUDES_METRES.map(
  (amplitude, o) => {
    const wavelength = LONGEST_WAVELENGTH_METRES / 2 ** o;
    return {
      index: o,
      wavelength,
      cyclesPerMetre: 1 / wavelength,
      amplitude,
      regional: wavelength >= REGIONAL_METRES,
      hill: wavelength < REGIONAL_METRES && wavelength >= HILL_METRES,
      broad: wavelength >= BROAD_METRES,
    };
  },
);

/**
 * A bound on the ground's slope, metres of rise per metre run, whatever the
 * detail cut, for octaves each at most `octaveSteepest` times its amplitude
 * over its wavelength: every octave at its steepest, plus the plateau's, the
 * shelf's, and the lowland floor's climb, sink, rounding and squeeze. Loose: real
 * ground stays under a tenth of it.
 */
export const groundSlope = (octaveSteepest: number) =>
  Math.SQRT2 *
    (ABYSS_METRES / SHELF_REACH_METRES +
      PLATEAU_METRES / PLATEAU_REACH_METRES +
      (3 * LOWLAND_METRES + 2 * FINE_REACH_METRES + SQUEEZE_METRES) /
        LOWLAND_REACH_METRES) +
  OCTAVES.reduce(
    (sum, { amplitude, wavelength }) =>
      sum + (octaveSteepest * amplitude) / wavelength,
    0,
  );

/** The share of its full size a quantity reaches `distance` in: ~63% at `reach`. */
const approach = (distance: number, reach: number) =>
  1 - Math.exp(-distance / reach);

/** A smooth 0→1 ramp over `[0, 1]`, flat past it. */
const ramp = (t: number) => (t >= 1 ? 1 : t * t * (3 - 2 * t));

/**
 * The larger of `a` and `b`, rounded over a band `k` wide where they meet,
 * and exactly the larger outside it; never below either.
 */
function smoothMax(a: number, b: number, k: number): number {
  const gap = k - Math.abs(a - b);
  return gap > 0 ? Math.max(a, b) + (gap * gap) / (4 * k) : Math.max(a, b);
}

/**
 * Metres above sea level `d` metres from the coast (negative offshore), with
 * `noise(octave)` the octave's value noise in `[-1, 1]` at the point, over
 * `octaves`: `OCTAVES`, each carrying whatever its caller's noise reads.
 *
 * A plateau climbs with distance from the coast, and the sea floor falls
 * away offshore. Value noise rides on both, its octaves from 400 km down to
 * 6 m, the regional ones growing in amplitude inland, each faded out within
 * one of its own wavelengths of the coastline, so the drawn coast stays where
 * it is at every scale but the finest, where the shore wanders seaward by
 * metres. Inland, the ground never sinks under its `lowlandFloor`.
 *
 * Octaves shorter than `finest` metres are left out, and those up to twice
 * it faded in, so a lattice sampling at half `finest` draws no alias of them;
 * `noise` is called for no octave whose weight there is zero.
 */
export function reliefAt<O extends Octave>(
  d: number,
  finest: number,
  octaves: readonly O[],
  noise: (octave: O) => number,
): number {
  const base =
    d >= 0
      ? PLATEAU_METRES * approach(d, PLATEAU_REACH_METRES)
      : -ABYSS_METRES * approach(-d, SHELF_REACH_METRES);
  const roughness =
    d > 0
      ? COASTAL_ROUGHNESS +
        (1 - COASTAL_ROUGHNESS) * approach(d, ROUGHNESS_REACH_METRES)
      : COASTAL_ROUGHNESS;
  const away = Math.abs(d);
  let regional = 0;
  let local = 0;
  let fine = 0;
  for (const octave of octaves) {
    if (octave.wavelength <= finest) break;
    const resolved = finest === 0 ? 1 : ramp(octave.wavelength / finest - 1);
    const fade = resolved * ramp(away / octave.wavelength);
    if (fade === 0) continue;
    const n = noise(octave);
    const value = octave.amplitude * fade * (octave.hill ? humped(n) : n);
    if (octave.regional) regional += value;
    else local += value;
    if (!octave.broad) fine += value;
  }
  const height = base + roughness * regional + local;
  return d <= 0 ? height : restingGround(d, height, height - fine);
}

/**
 * Ground `d` metres inland (positive) whose noise reads `height`, `broad` of
 * it from the octaves of `BROAD_METRES` and longer: `height` where it stands
 * a band's width over its `lowlandFloor`, and under that squeezed into the
 * band — `floor + band·e^(over/band − 1)`, which meets `height` at the band's
 * top with its slope, so it is order-preserving and smooth, never below the
 * floor nor below `height`, and approaches the floor only as `height` sinks
 * far under it. The band is the lowland's least height, widened by
 * `SQUEEZE_METRES` near the coast, so it is never narrower than the
 * rounding a hard floor would take.
 */
export function restingGround(d: number, height: number, broad: number) {
  const reach = approach(d, LOWLAND_REACH_METRES);
  const floor = lowlandFloor(d, broad);
  const band =
    LOWLAND_METRES * reach + SQUEEZE_METRES * reach * (1 - reach) ** 3;
  const over = height - floor;
  return over >= band ? height : floor + band * Math.exp(over / band - 1);
}

/**
 * The least height ground `d` metres inland (positive) keeps over `broad`, its
 * height from the octaves of `BROAD_METRES` and longer: the broad relief, sunk
 * by up to the fine octaves' reach with distance from the coast and held over
 * the lowland's least height. Near the coast it is the broad relief itself, so
 * the fine troughs there bottom out on rolling ground rather than on a level;
 * a dozen kilometres in it lies below every trough, and the noise is the
 * ground.
 * Where the broad relief itself sinks under the lowland, the floor is level,
 * and the ground over it keeps the relief `restingGround` squeezes in.
 */
export function lowlandFloor(d: number, broad: number): number {
  const reach = approach(d, LOWLAND_REACH_METRES);
  const lowland = LOWLAND_METRES * reach;
  return smoothMax(broad - FINE_REACH_METRES * reach * reach, lowland, lowland);
}
