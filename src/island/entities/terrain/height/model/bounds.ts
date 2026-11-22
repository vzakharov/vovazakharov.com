/** True bounds on the ground `reliefAt` draws: its slope, and its detail. */
import { CALM_STEEPEST, coastCutReach } from './coast-detail';
import {
  KINDS,
  LINE_WIDTH,
  LONGEST_HILL_METRES,
  type Octave,
  OCTAVES,
} from './octaves';
import {
  ABYSS_METRES,
  BASIN_METRES,
  BASIN_REACH_METRES,
  BASIN_ROUNDING_METRES,
  DUNE_GAP_INDEX,
  DUNE_SWAY_INDEX,
  DUNE_SWELL_INDEX,
  FINE_REACH_METRES,
  HIGHEST_GROUND,
  HILLS_RISE_METRES,
  HILLY_SPAN,
  KIND_STEEPEST,
  KNOB_SPAN,
  LIFT_RISE_METRES,
  LOWEST_GROUND,
  most,
  peakOf,
  PLATEAU_METRES,
  PLATEAU_REACH_METRES,
  riseOf,
  SHELF_REACH_METRES,
  total,
  troughOf,
  UPLIFT_METRES,
  UPLIFT_REACH_METRES,
  VARIED_UNDER_METRES,
  wavelengthOf,
} from './relief-numbers';
import {
  DUNE_GAP_SPAN,
  DUNE_METRES,
  DUNE_SPACING_METRES,
  DUNE_STEEPEST,
  DUNE_SWAY,
  DUNES_RISE_METRES,
  DUNES_UNDER_SPAN_METRES,
  LOWLAND_METRES,
  LOWLAND_REACH_METRES,
  resolvedAt,
  SQUEEZE_METRES,
} from './shore';

/**
 * What a metre of change in the ground under the dunes comes to once the
 * share of dunes it keeps has changed with it.
 */
const DUNES_SHARE_STEEPEST = 1 + (1.5 * DUNE_METRES) / DUNES_UNDER_SPAN_METRES;

/** The weight `reliefAt` gives an octave at detail cut `finest`. */

/**
 * A bound on the slope, metres of rise per metre run, of the ground drawn at
 * one detail cut `finest` everywhere (0, the ground whole), for noise at most
 * `noiseSteepest` steep per wavelength and a belt's uplift at most
 * `upliftSteepest` metres per metre, over a coast distance at most
 * `coastSteepest` metres per metre (a bilinear field's is √2). At one cut an
 * octave's weight is the same everywhere, so it adds that share of its slope.
 * Every term of `reliefAt` has its summand here, so a term added there is
 * added here. Loose: real ground stays far under it.
 */
export function groundSlope(
  noiseSteepest: number,
  upliftSteepest: number,
  coastSteepest = Math.SQRT2,
  finest = 0,
) {
  const per = (share: (octave: Octave) => number) =>
    total(
      OCTAVES.map(
        (octave) =>
          resolvedAt(finest, octave.wavelength) *
          Math.abs(share(octave)) *
          ((noiseSteepest + 1) / octave.wavelength +
            (1.5 * coastSteepest) / riseOf(octave)),
      ),
    );
  const broad =
    coastSteepest *
      (ABYSS_METRES / SHELF_REACH_METRES +
        PLATEAU_METRES / PLATEAU_REACH_METRES +
        (BASIN_METRES + BASIN_ROUNDING_METRES) / BASIN_REACH_METRES +
        (1.5 * UPLIFT_METRES) / UPLIFT_REACH_METRES) +
    upliftSteepest +
    per(({ amplitude }) => amplitude);
  // An octave's line is `2 / LINE_WIDTH` steep per unit of noise, and the
  // weight it takes from the octaves before it as steep again for each.
  const line =
    per((octave) => (2 / LINE_WIDTH) * octave.line * (1 + octave.hillRank)) +
    (1.5 * coastSteepest) / HILLS_RISE_METRES +
    (1.5 * coastSteepest) / LIFT_RISE_METRES;
  const hills = most(
    (kind) =>
      (Math.abs(kind.lift) * (kind.steepest + 1) + 1.5 * total(kind.fine)) *
      line,
  );
  const own =
    per(({ green }) => green) +
    ((1.5 / HILLY_SPAN) *
      noiseSteepest *
      total(
        OCTAVES.map((octave) =>
          octave.hill && octave.wavelength < VARIED_UNDER_METRES
            ? resolvedAt(finest, octave.wavelength) * octave.green
            : 0,
        ),
      )) /
      LONGEST_HILL_METRES +
    per(({ brown, hill }) => (hill ? brown : (1.5 / KNOB_SPAN) * brown)) +
    per(({ alpine }) => alpine);
  const shore =
    coastSteepest *
    ((3 * LOWLAND_METRES + 2 * FINE_REACH_METRES + SQUEEZE_METRES) /
      LOWLAND_REACH_METRES +
      DUNE_METRES *
        (1.5 / DUNES_RISE_METRES + DUNE_STEEPEST / DUNE_SPACING_METRES));
  const dunes =
    (DUNE_SPACING_METRES <= 2 * finest ? 0 : DUNE_METRES) *
    (noiseSteepest *
      ((DUNE_STEEPEST * DUNE_SWAY) / wavelengthOf(DUNE_SWAY_INDEX) +
        0.4 / wavelengthOf(DUNE_SWELL_INDEX) +
        1.5 / (DUNE_GAP_SPAN * wavelengthOf(DUNE_GAP_INDEX))) +
      CALM_STEEPEST);
  const reach = most((kind) => Math.max(peakOf(kind), troughOf(kind)));
  const ground =
    broad * (1 + KIND_STEEPEST * (reach + FINE_REACH_METRES)) +
    hills +
    own +
    shore;
  return ground * DUNES_SHARE_STEEPEST + dunes;
}

/**
 * A bound on how much the ground moves per metre the coast's distance moves:
 * the part of `groundSlope` that scales with the distance's slope, which is
 * affine in it.
 */
const ALONG_COAST_STEEPEST = groundSlope(0, 0, 1) - groundSlope(0, 0, 0);

/**
 * A bound on how far the ground drawn with detail cut `finest` (metres)
 * stands from the ground drawn whole, anywhere: what the octaves the cut
 * leaves out or fades, the dunes with them, can add or take, and what the
 * coast's bends the cut leaves out move it by.
 */
export const detailReach = (finest: number): number =>
  reliefReach(finest) + ALONG_COAST_STEEPEST * coastCutReach(finest);

/**
 * `detailReach` over one coast, read whole at either cut: what the relief's
 * octaves alone take or add. The whole range where the cut reaches the
 * regional octaves, which tell the kind of ground.
 */
export function reliefReach(finest: number): number {
  if (finest <= 0) return 0;
  const cut = OCTAVES.filter(({ wavelength }) => wavelength < 2 * finest);
  if (cut.some(({ regional }) => regional)) {
    return HIGHEST_GROUND - LOWEST_GROUND;
  }
  const line = total(cut.map((octave) => octave.line));
  const own = (of: (octave: Octave) => number) =>
    total(cut.map((octave) => Math.abs(of(octave))));
  const rolls = [
    own(({ green }) => green),
    own(({ brown }) => brown),
    own(({ alpine }) => alpine),
  ];
  const ground = Math.max(
    ...KINDS.map(
      (kind, k) =>
        (Math.abs(kind.lift) * kind.steepest + 1.5 * total(kind.fine)) * line +
        (rolls[k] ?? 0),
    ),
  );
  const dunes = DUNE_SPACING_METRES < 4 * finest ? DUNE_METRES : 0;
  return ground * DUNES_SHARE_STEEPEST + dunes;
}
