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
  ALPINE,
  BROWN,
  GREEN,
  LINE_GAIN,
  LINE_LEAST,
  LINE_MEAN,
  LINE_OWN,
  LINE_WIDTH,
  LONGEST_HILL_METRES,
  type Octave,
} from './octaves';
import {
  ABYSS_METRES,
  ALPINE_BY_METRES,
  ALPINE_FROM_METRES,
  BASIN_METRES,
  BASIN_REACH_METRES,
  BASIN_ROUNDING_METRES,
  BROWN_BY_METRES,
  BROWN_FROM_METRES,
  COASTAL_ROUGHNESS,
  DUNE_GAP_INDEX,
  DUNE_SWAY_INDEX,
  DUNE_SWELL_INDEX,
  FINE_REACH_METRES,
  HILLS_RISE_METRES,
  HILLY_FROM,
  HILLY_SPAN,
  KNOB_FROM,
  KNOB_SPAN,
  LIFT_RISE_METRES,
  PLAIN_HILLS,
  PLATEAU_METRES,
  PLATEAU_REACH_METRES,
  riseOf,
  ROUGHNESS_REACH_METRES,
  SHELF_REACH_METRES,
  UPLIFT_REACH_METRES,
  VARIED_UNDER_METRES,
} from './relief-numbers';
import {
  approach,
  DUNE_SPACING_METRES,
  duneAt,
  dunesOver,
  ramp,
  restingGround,
  smoothMax,
} from './shore';

/**
 * Metres above sea level `d` metres from the coast (negative offshore), with
 * `noise(octave)` the octave's noise in `[-1, 1]` at the point, over
 * `octaves`: `OCTAVES`, each carrying whatever its caller's noise reads; and
 * `uplift`, from 0 to `UPLIFT_METRES`, the lift of a mountain belt there;
 * and `calm`, the share of calm in the stretch of coast, which the dunes
 * stand on alone (called only where a dune would stand).
 *
 * The hill band's octaves draw one line field: each a sharp line where its
 * noise crosses zero, and each shorter one kept to the lines before it, so
 * lines branch. Where the detail cut leaves the hill band out, the field's
 * average stands in for it, so ground seen from afar is as high as the ground
 * it turns into.
 *
 * Every octave is faded out towards the coastline, within one of its own
 * wavelengths or, the land's hill band, within `HILLS_RISE_METRES`, so the
 * drawn coast stays where it is at every scale but the finest, where the
 * shore wanders seaward by metres.
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
  calm: () => number = () => 1,
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
  let gap = 0;
  // The line field, the share of the hill band present, and the share the
  // cut resolves; the weight the next octave's line takes.
  let line = 0;
  let present = 0;
  let resolvedShare = 0;
  let weight = 1;
  let greenRoll = 0;
  let hilly = PLAIN_HILLS + (1 - PLAIN_HILLS) * ramp(-HILLY_FROM / HILLY_SPAN);
  let brownRoll = 0;
  let alpineRoll = 0;
  let greenFine = 0;
  let knobs = 0;
  let alpineFine = 0;
  for (const octave of octaves) {
    if (octave.wavelength <= finest) break;
    const resolved = finest === 0 ? 1 : ramp(octave.wavelength / finest - 1);
    if (octave.hill) resolvedShare += octave.line * resolved;
    const fade =
      resolved * ramp(away / (d > 0 ? riseOf(octave) : octave.wavelength));
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
      if (octave.hillRank === 0)
        hilly =
          PLAIN_HILLS + (1 - PLAIN_HILLS) * ramp((n - HILLY_FROM) / HILLY_SPAN);
      greenRoll +=
        octave.green *
        fade *
        n *
        (octave.wavelength < VARIED_UNDER_METRES ? hilly : 1);
      brownRoll += octave.brown * fade * n;
      alpineRoll += octave.alpine * fade * n;
      if (octave.index === DUNE_SWELL_INDEX) swell = n;
      else if (octave.index === DUNE_SWAY_INDEX) sway = n;
    } else {
      if (octave.index === DUNE_GAP_INDEX) gap = n;
      greenFine += octave.green * fade * n;
      knobs += octave.brown * fade * (ramp((n - KNOB_FROM) / KNOB_SPAN) - 0.25);
      alpineFine += octave.alpine * fade * n;
    }
  }
  const raw = base + roughness * regional + lifted;
  const basin = d > 0 ? approach(d, BASIN_REACH_METRES) : 0;
  const broad =
    basin > 0
      ? smoothMax(raw, BASIN_METRES * basin, BASIN_ROUNDING_METRES * basin)
      : raw;
  const alpine = ramp(
    (broad - ALPINE_FROM_METRES) / (ALPINE_BY_METRES - ALPINE_FROM_METRES),
  );
  const brown =
    (1 - alpine) *
    ramp((broad - BROWN_FROM_METRES) / (BROWN_BY_METRES - BROWN_FROM_METRES));
  const green = 1 - alpine - brown;
  const coarse =
    (1 - resolvedShare) *
    ramp(away / (d > 0 ? HILLS_RISE_METRES : LONGEST_HILL_METRES));
  line += LINE_MEAN * coarse;
  present += coarse;

  const lift = d > 0 ? ramp(d / LIFT_RISE_METRES) : 1;
  let local = 0;
  let fine = 0;
  if (green > 0) {
    local +=
      green *
      (lift * GREEN.lift * (GREEN.shelf * present - line * line) + greenRoll);
    fine += green * greenFine;
  }
  if (brown > 0) {
    local +=
      brown *
      (lift * BROWN.lift * (BROWN.shelf * present - line ** 3) + brownRoll);
    fine += brown * knobs * (1 - line);
  }
  if (alpine > 0) {
    local +=
      alpine *
      (lift * ALPINE.lift * (ALPINE.shelf * present - line) + alpineRoll);
    fine += alpine * alpineFine * (0.25 + 0.75 * Math.min(1, 2 * line));
  }
  const height = broad + local + fine;
  if (d <= 0) return height;
  const dunes = finest === 0 ? 1 : ramp(DUNE_SPACING_METRES / (2 * finest) - 1);
  const resting = restingGround(d, height, broad + local, FINE_REACH_METRES);
  const low = dunes * dunesOver(resting);
  const dune = low === 0 ? 0 : duneAt(d, swell, sway, gap);
  return resting + (dune === 0 ? 0 : low * dune * calm());
}
