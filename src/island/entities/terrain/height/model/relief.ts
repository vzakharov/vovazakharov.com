/**
 * The ground's shape as a function of the signed distance to the coast, of
 * the uplift of a mountain belt, and of noise octaves the caller draws,
 * wherever they are drawn (`heightAtSphere` draws them in space).
 *
 * The land has three kinds of ground above its beach, told by how high the
 * broad relief stands and blended across each border: green lowland, rolling
 * hills cut by valleys; brown upland, broad shoulders with incised valleys
 * and outcrops; and alpine ground, ridged crests over carved valleys. Each is
 * a recipe over the same octaves, so a place between two kinds is between
 * their shapes.
 */
import {
  approach,
  DUNE_METRES,
  DUNE_SPACING_METRES,
  DUNE_SWAY,
  duneAt,
  DUNES_RISE_METRES,
  LOWLAND_METRES,
  LOWLAND_REACH_METRES,
  ramp,
  restingGround,
  smoothMax,
  SQUEEZE_METRES,
} from './shore';
import {
  ALPINE,
  BROWN,
  GREEN,
  type Kind,
  KINDS,
  LINE_GAIN,
  LINE_LEAST,
  LINE_MEAN,
  LINE_OWN,
  LINE_WIDTH,
  LONGEST_HILL_METRES,
  LONGEST_WAVELENGTH_METRES,
  type Octave,
  OCTAVES,
  REGIONAL_METRES,
} from './octaves';

/** The interior's base height, approached with distance from the coast. */
const PLATEAU_METRES = 250;
/** The distance inland over which the plateau climbs to ~63% of its height. */
const PLATEAU_REACH_METRES = 180_000;

/**
 * The height an inland basin's floor is held near, approached with distance
 * from the coast: where the regional octaves would sink the land to the sea
 * or under it, the broad relief levels out here instead, high enough that
 * the hills on it clear the lowland floor and the basin is rolling ground,
 * not a sheet.
 */
const BASIN_METRES = 160;
const BASIN_REACH_METRES = 15_000;
/** The band of broad relief over which a basin's floor is rounded in. */
const BASIN_ROUNDING_METRES = 240;

/** The ocean's depth far from the coast. */
const ABYSS_METRES = 3500;
/** The distance offshore over which the sea floor falls to ~63% of it. */
const SHELF_REACH_METRES = 30_000;

/** How high a mountain belt lifts the broad relief along its middle. */
export const UPLIFT_METRES = 900;
/** The distance inland over which a belt's uplift grows to its full size. */
const UPLIFT_REACH_METRES = 100_000;

/**
 * How much of the regional octaves survives at the coast and at sea. The
 * shorter octaves keep their full size everywhere, faded only near the
 * coastline, so every lowland has hills.
 */
const COASTAL_ROUGHNESS = 0.25;
/** The distance inland over which the noise grows to ~63% of its full size. */
const ROUGHNESS_REACH_METRES = 300_000;
/** Where the broad relief turns from green to brown ground, and to alpine. */
const BROWN_FROM_METRES = 300;
const BROWN_BY_METRES = 550;
const ALPINE_FROM_METRES = 600;
const ALPINE_BY_METRES = 1100;

/** The octaves whose noise bends the dunes' lines and varies their height. */
const DUNE_SWELL_INDEX = 9;
const DUNE_SWAY_INDEX = 10;


const total = (values: readonly number[]) =>
  values.reduce((sum, value) => sum + value, 0);
const most = (of: (kind: Kind) => number) => Math.max(...KINDS.map(of));

const REGIONAL_REACH_METRES = total(REGIONAL_METRES);
/**
 * How far the fine band reaches on any ground, and so how far below the
 * broad relief the lowland floor sinks with distance from the coast.
 */
const FINE_REACH_METRES = most(({ fine }) => total(fine));
/** The most a kind's hill band lifts its ground, and sinks it. */
const peakOf = ({ lift, level, roll }: Kind) =>
  Math.max(lift * level, lift * (level - 1)) + total(roll);
const troughOf = ({ lift, level, roll }: Kind) =>
  Math.max(-lift * level, lift * (1 - level)) + total(roll);

/** No ground lies higher than this, metres above sea level. */
export const HIGHEST_GROUND =
  PLATEAU_METRES +
  REGIONAL_REACH_METRES +
  UPLIFT_METRES +
  BASIN_ROUNDING_METRES / 4 +
  most(peakOf) +
  FINE_REACH_METRES +
  DUNE_METRES;
/** No ground lies lower than this, metres above sea level. */
export const LOWEST_GROUND =
  -ABYSS_METRES -
  COASTAL_ROUGHNESS * REGIONAL_REACH_METRES -
  most(troughOf) -
  FINE_REACH_METRES;

const wavelengthOf = (index: number) => LONGEST_WAVELENGTH_METRES / 2 ** index;

/** The steepest the weight of a kind of ground is, per metre of broad relief. */
const KIND_STEEPEST =
  1.5 / (BROWN_BY_METRES - BROWN_FROM_METRES) +
  1.5 / (ALPINE_BY_METRES - ALPINE_FROM_METRES);

/**
 * A bound on the ground's slope, metres of rise per metre run, whatever the
 * detail cut, for noise at most `noiseSteepest` steep per wavelength and a
 * belt's uplift at most `upliftSteepest` metres per metre. It adds up: the
 * broad relief's own slope — the plateau's, the shelf's and the uplift's
 * climb over a distance changing up to √2 per metre, and the regional
 * octaves; the kinds of ground trading places as steeply as the broad relief
 * lets them; the hill band on the kind that makes most of it — its shape
 * along the line field, the vary field under it, its roll; the fine band
 * likewise, with the detail weight the shape hands it; each octave's coastal
 * fade (a smoothstep, 1.5) and detail fade (under 1); the lowland floor's
 * climb, sink, rounding and squeeze; and the dunes. Loose: real ground stays
 * far under it.
 */
export function groundSlope(noiseSteepest: number, upliftSteepest: number) {
  const fades = 1.5 * Math.SQRT2 + 1;
  const per = (share: (octave: Octave) => number) =>
    total(
      OCTAVES.map(
        (octave) =>
          (Math.abs(share(octave)) * (noiseSteepest + fades)) /
          octave.wavelength,
      ),
    );
  const broad =
    Math.SQRT2 *
      (ABYSS_METRES / SHELF_REACH_METRES +
        PLATEAU_METRES / PLATEAU_REACH_METRES +
        (BASIN_METRES + BASIN_ROUNDING_METRES) / BASIN_REACH_METRES +
        (1.5 * UPLIFT_METRES) / UPLIFT_REACH_METRES) +
    upliftSteepest +
    per(({ amplitude }) => amplitude);
  // An octave's line is `2 / LINE_WIDTH` steep per unit of noise, and the
  // weight it takes from the octaves before it as steep again for each.
  const line =
    per((octave) => (2 / LINE_WIDTH) * octave.line * (1 + octave.depth)) +
    (1.5 * Math.SQRT2) / LONGEST_HILL_METRES;
  const hills = most(
    (kind) =>
      (Math.abs(kind.lift) * (kind.steepest + 1) + total(kind.fine)) * line,
  );
  const own =
    per(({ green }) => green) +
    per(({ brown }) => brown) +
    per(({ alpine }) => alpine);
  const shore =
    Math.SQRT2 *
    ((3 * LOWLAND_METRES + 2 * FINE_REACH_METRES + SQUEEZE_METRES) /
      LOWLAND_REACH_METRES +
      DUNE_METRES *
        (1.5 / DUNES_RISE_METRES + (2 * Math.PI) / DUNE_SPACING_METRES));
  const dunes =
    DUNE_METRES *
    noiseSteepest *
    ((2 * Math.PI * DUNE_SWAY) / wavelengthOf(DUNE_SWAY_INDEX) +
      0.4 / wavelengthOf(DUNE_SWELL_INDEX));
  const reach = most((kind) => Math.max(peakOf(kind), troughOf(kind)));
  return (
    broad * (1 + KIND_STEEPEST * (reach + FINE_REACH_METRES)) +
    hills +
    own +
    shore +
    dunes
  );
}

/**
 * Metres above sea level `d` metres from the coast (negative offshore), with
 * `noise(octave)` the octave's noise in `[-1, 1]` at the point, over
 * `octaves`: `OCTAVES`, each carrying whatever its caller's noise reads; and
 * `uplift`, from 0 to `UPLIFT_METRES`, the lift of a mountain belt there.
 *
 * A plateau climbs with distance from the coast, and the sea floor falls
 * away offshore; the regional octaves and a belt's uplift ride on both, and
 * together they are the broad relief, which tells the kind of ground: green
 * under 300 m, brown from 550 m, alpine from 1100 m, blended between. The
 * hill band's octaves draw one line field: each a sharp line where its noise
 * crosses zero, dying out to either side, and each shorter one kept to the
 * lines before it, so lines branch. On green ground the lines are valleys,
 * gullies feeding them, and rounded hills stand between; on brown the same
 * valleys are cut narrow into broad shoulders, with knobs of rock on them; on
 * alpine ground the lines are crests with spurs, over smooth valley floors.
 * Where the detail cut leaves the hill band out, the field's average stands
 * in for it, so ground seen from afar is as high as the ground it turns into.
 *
 * Every octave is faded out within one of its own wavelengths of the
 * coastline, so the drawn coast stays where it is at every scale but the
 * finest, where the shore wanders seaward by metres. Inland, the ground never
 * sinks under its `lowlandFloor`, and dunes stand on it behind the beach.
 *
 * Octaves shorter than `finest` metres are left out, and those up to twice
 * it faded in, the dunes with them, so a lattice sampling at half `finest`
 * draws no alias of them; `noise` is called for no octave whose weight there
 * is zero, and for each one it is called for, for every longer one first.
 */
export function reliefAt<O extends Octave>(
  d: number,
  finest: number,
  octaves: readonly O[],
  noise: (octave: O) => number,
  uplift = 0,
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
  const lifted = d > 0 ? uplift * ramp(d / UPLIFT_REACH_METRES) : 0;

  let regional = 0;
  /** The noise of the octave before. */
  let last = 0;
  let swell = 0;
  let sway = 0;
  // The line field, the share of the hill band present, and the share the
  // cut resolves; the weight the next octave's line takes.
  let line = 0;
  let present = 0;
  let resolvedShare = 0;
  let weight = 1;
  let greenRoll = 0;
  let brownRoll = 0;
  let alpineRoll = 0;
  let greenFine = 0;
  let knobs = 0;
  let alpineFine = 0;
  for (const octave of octaves) {
    if (octave.wavelength <= finest) break;
    const resolved = finest === 0 ? 1 : ramp(octave.wavelength / finest - 1);
    if (octave.hill) resolvedShare += octave.line * resolved;
    const fade = resolved * ramp(away / octave.wavelength);
    if (fade === 0) continue;
    const previous = last;
    const n = noise(octave);
    last = n;
    if (octave.regional) regional += octave.amplitude * fade * n;
    else if (octave.hill) {
      const crossing = LINE_OWN * n + (1 - LINE_OWN) * previous;
      const near = Math.max(0, 1 - Math.abs(crossing) / LINE_WIDTH);
      const drawn = weight * near * near;
      line += octave.line * fade * drawn;
      present += octave.line * fade;
      weight = LINE_LEAST + (1 - LINE_LEAST) * Math.min(1, LINE_GAIN * drawn);
      greenRoll += octave.green * fade * n;
      brownRoll += octave.brown * fade * n;
      alpineRoll += octave.alpine * fade * n;
      if (octave.index === DUNE_SWELL_INDEX) swell = n;
      else if (octave.index === DUNE_SWAY_INDEX) sway = n;
    } else {
      greenFine += octave.green * fade * n;
      knobs += octave.brown * fade * (ramp((n - 0.15) / 0.45) - 0.25);
      alpineFine += octave.alpine * fade * n;
    }
  }
  const raw = base + roughness * regional + lifted;
  const broad =
    d > 0
      ? smoothMax(
          raw,
          BASIN_METRES * approach(d, BASIN_REACH_METRES),
          BASIN_ROUNDING_METRES * approach(d, BASIN_REACH_METRES),
        )
      : raw;
  const alpine = ramp(
    (broad - ALPINE_FROM_METRES) / (ALPINE_BY_METRES - ALPINE_FROM_METRES),
  );
  const brown =
    (1 - alpine) *
    ramp((broad - BROWN_FROM_METRES) / (BROWN_BY_METRES - BROWN_FROM_METRES));
  const green = 1 - alpine - brown;
  const coarse = (1 - resolvedShare) * ramp(away / LONGEST_HILL_METRES);
  line += LINE_MEAN * coarse;
  present += coarse;

  let local = 0;
  let fine = 0;
  if (green > 0) {
    local +=
      green * (GREEN.lift * (GREEN.level * present - line * line) + greenRoll);
    fine += green * greenFine;
  }
  if (brown > 0) {
    local +=
      brown * (BROWN.lift * (BROWN.level * present - line ** 3) + brownRoll);
    fine += brown * knobs * (1 - line);
  }
  if (alpine > 0) {
    local +=
      alpine * (ALPINE.lift * (ALPINE.level * present - line) + alpineRoll);
    fine += alpine * alpineFine * (0.25 + 0.75 * Math.min(1, 2 * line));
  }
  const height = broad + local + fine;
  if (d <= 0) return height;
  const dunes = finest === 0 ? 1 : ramp(DUNE_SPACING_METRES / (2 * finest) - 1);
  return (
    restingGround(d, height, broad + local, FINE_REACH_METRES) +
    (dunes === 0 ? 0 : dunes * duneAt(d, swell, sway))
  );
}
