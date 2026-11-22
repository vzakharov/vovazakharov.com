import { float, mix, smoothstep, vec3 } from 'three/tsl';
import type { Node } from 'three/webgpu';

import {
  BAND_HEIGHTS,
  LAND_PALETTE,
  type Rgb,
  SHORE_TOP,
} from '../lib/land-colour';
import { noiseAt, type OctaveNoise, QUIET } from './land-noise';

type F = Node<'float'>;
type V = Node<'vec3'>;

/** Octaves by what the eye reads them as, as indices into `LAND_OCTAVES`. */
export const COUNTRY = 0;
export const REGION = 1;
export const DISTRICT = 2;
export const HILL = 3;
export const FIELD = 4;
export const SLOPE = 5;
export const PATCH = 6;
export const STEP = 7;
export const HAND = 8;
export const GRAIN = 9;

/** Octaves and the weight each is summed with. */
export type Parts = ReadonlyArray<readonly [octave: number, weight: number]>;

/** A sum of octaves, and how much of it an eye this far no longer tells: what an edge drawn through it widens by. */
type Ragged = { readonly sum: F; readonly lost: F };

/** The ground a fragment is on, as the bands read it. */
export type Ground = {
  /** Metres above the sea. */
  readonly height: F;
  /** Its colour by height alone, kept at the waterline, where the sea's meets it. */
  readonly stops: V;
  /** How far it leans off level, 0 flat and 1 a wall. */
  readonly steep: F;
  /** The width of ground a pixel covers, metres. */
  readonly footprint: F;
};

export type Banded = {
  /** The ground's own colour, before the lamps. */
  readonly colour: V;
  /** How rough its small relief stands, 0 smooth. */
  readonly roughness: F;
};

/** Thicknesses of rock's beds, metres: the ledges, and the leaves within one. */
const BEDS = [5.3, 1.1] as const;

const paint = (rgb: Rgb): V => vec3(...rgb);

/**
 * What each of the four bands the height tells apart — beach, green lowland,
 * brown upland, mountain — is made of, their borders broken by slope and by
 * `octaves` at every scale given. `detailed` adds what only the fine look
 * pays for: rock's beds.
 */
export function landBands(
  { height, stops, steep, footprint }: Ground,
  octaves: readonly OctaveNoise[],
  detailed: boolean,
): Banded {
  const at = (i: number) => octaves[i] ?? QUIET;
  const ragged = (parts: Parts): Ragged => {
    let sum: F = float(0);
    let lost: F = float(0);
    for (const [i, weight] of parts) {
      sum = sum.add(at(i).value.mul(weight));
      lost = lost.add(
        at(i)
          .told.oneMinus()
          .mul(Math.abs(weight) * 0.5),
      );
    }
    return { sum, lost };
  };
  /** `x` plus `by`'s noise, 0 under `from` and 1 over `to`, the edge as wide again as what of `by` is lost. */
  const edge = (x: F, from: number, to: number, by: Ragged) =>
    smoothstep(float(from).sub(by.lost), float(to).add(by.lost), x.add(by.sum));
  /** A surface's brightness mottled by `parts`, about 1. */
  const mottled = (parts: Parts) => ragged(parts).sum.add(1);

  const inland = smoothstep(SHORE_TOP, 150, height);
  const borders = ragged([
    [REGION, 170],
    [DISTRICT, 110],
    [HILL, 60],
    [FIELD, 26],
    [SLOPE, 11],
    [PATCH, 4],
  ]);
  /** The height a band is told by: the ground's, its contours broken, steep ground reading higher. */
  const banded = height.add(steep.mul(600));
  const border: Ragged = {
    sum: borders.sum.mul(inland),
    lost: borders.lost.mul(inland),
  };
  const upland = edge(banded, ...BAND_HEIGHTS.upland, border);
  const mountain = edge(banded, ...BAND_HEIGHTS.mountain, border);

  const dryness = edge(float(0), -0.5, 0.6, {
    ...ragged([
      [COUNTRY, 0.4],
      [REGION, 0.5],
      [HILL, 0.5],
      [FIELD, 0.45],
      [SLOPE, 0.3],
    ]),
    lost: float(0),
  });
  const meadow = mix(
    paint(LAND_PALETTE.meadow),
    paint(LAND_PALETTE.hay),
    dryness.mul(0.55),
  ).mul(
    mottled([
      [PATCH, 0.08],
      [STEP, 0.07],
      [HAND, 0.06],
    ]),
  );
  /** Forest's cover: closed on gentle lowland in patches of every size, thinning through the upland. */
  const cover = edge(
    steep.mul(-2.5).add(0.1),
    -0.05,
    0.3,
    ragged([
      [REGION, 0.35],
      [DISTRICT, 0.55],
      [HILL, 0.5],
      [FIELD, 0.3],
    ]),
  ).mul(
    smoothstep(
      BAND_HEIGHTS.upland[0],
      BAND_HEIGHTS.upland[1] + 200,
      banded.add(border.sum),
    ).oneMinus(),
  );
  const canopy = mix(
    paint(LAND_PALETTE.broadleaf),
    paint(LAND_PALETTE.conifer),
    smoothstep(250, BAND_HEIGHTS.upland[1], banded.add(border.sum)),
  ).mul(
    mottled([
      [SLOPE, 0.15],
      [PATCH, 0.28],
      [STEP, 0.1],
    ]),
  );
  const bare = smoothstep(0.07, 0.16, steep.add(at(PATCH).value.mul(0.02))).mul(
    cover.mul(0.6).oneMinus(),
  );
  const lowland = mix(
    mix(meadow, canopy, cover),
    paint(LAND_PALETTE.earth),
    bare,
  );

  const heathered = edge(
    float(0),
    -0.25,
    0.35,
    ragged([
      [HILL, 0.3],
      [FIELD, 0.6],
      [SLOPE, 0.5],
      [PATCH, 0.3],
    ]),
  );
  const stony = smoothstep(
    0.04,
    0.12,
    steep.add(at(PATCH).value.mul(0.02)).add(at(STEP).value.mul(0.02)),
  );
  const moor = mix(
    mix(paint(LAND_PALETTE.tussock), paint(LAND_PALETTE.heath), heathered),
    paint(LAND_PALETTE.stony),
    stony,
  ).mul(
    mottled([
      [PATCH, 0.1],
      [STEP, 0.12],
      [HAND, 0.1],
    ]),
  );

  const turfed = smoothstep(
    BAND_HEIGHTS.mountain[1],
    BAND_HEIGHTS.mountain[1] + 250,
    banded.add(border.sum),
  )
    .oneMinus()
    .mul(smoothstep(0.03, 0.09, steep).oneMinus());
  const alpine = mix(
    mix(paint(LAND_PALETTE.stony), paint(LAND_PALETTE.scree), 0.6),
    paint(LAND_PALETTE.turf),
    turfed,
  ).mul(
    mottled([
      [PATCH, 0.08],
      [STEP, 0.1],
      [HAND, 0.1],
    ]),
  );

  /** Bare rock: steep ground, and in the mountains ground hardly steep at all. */
  const rock = smoothstep(
    mix(0.11, 0.035, mountain),
    mix(0.24, 0.12, mountain),
    steep.add(at(PATCH).value.mul(0.025)).add(at(STEP).value.mul(0.015)),
  ).mul(smoothstep(2, SHORE_TOP, height));
  const bedded = (thickness: number) =>
    noiseAt(
      vec3(
        height
          .add(at(SLOPE).value.mul(6))
          .add(at(FIELD).value.mul(20))
          .div(thickness),
        at(FIELD).value.mul(1.3).add(7),
        at(HILL).value.mul(1.3).add(3),
      ),
    ).w.mul(smoothstep(thickness / 5, thickness / 1.6, footprint).oneMinus());
  const beds = detailed
    ? smoothstep(-0.25, 0.25, bedded(BEDS[0]).add(bedded(BEDS[1]).mul(0.5)))
    : float(0.5);
  const stone = mix(
    paint(LAND_PALETTE.rockDark),
    paint(LAND_PALETTE.rockLight),
    beds,
  ).mul(
    mottled([
      [STEP, 0.1],
      [HAND, 0.1],
      [GRAIN, 0.06],
    ]),
  );

  /** Snow: over its line on gentle ground, its edge ragged at every scale, slid off the steep. */
  const snow = edge(
    banded
      .sub(BAND_HEIGHTS.snowLine)
      .div(260)
      .sub(smoothstep(0.1, 0.3, steep).mul(1.5)),
    -0.12,
    0.12,
    ragged([
      [REGION, 0.5],
      [HILL, 0.5],
      [FIELD, 0.4],
      [SLOPE, 0.25],
      [PATCH, 0.12],
    ]),
  );

  const tint = mottled([
    [COUNTRY, 0.08],
    [REGION, 0.05],
  ]);
  const grown = mix(
    mix(mix(lowland, moor, upland), alpine, mountain),
    stone,
    rock,
  ).mul(tint);

  const marram = smoothstep(
    0.15,
    0.5,
    height
      .div(SHORE_TOP)
      .sub(0.5)
      .add(
        ragged([
          [PATCH, 0.5],
          [STEP, 0.6],
          [HAND, 0.3],
        ]).sum,
      ),
  ).mul(smoothstep(6, 14, height));
  const beach = mix(
    stops.mul(
      mottled([
        [PATCH, 0.03],
        [STEP, 0.04],
        [HAND, 0.05],
      ]),
    ),
    mix(paint(LAND_PALETTE.hay), paint(LAND_PALETTE.meadow), 0.3),
    marram.mul(0.6),
  );
  const sand = smoothstep(
    SHORE_TOP - 6,
    SHORE_TOP + 16,
    height.add(
      ragged([
        [SLOPE, 6],
        [PATCH, 4],
        [STEP, 2],
      ]).sum,
    ),
  ).oneMinus();

  const colour = mix(
    stops,
    mix(mix(grown, paint(LAND_PALETTE.snow), snow), beach, sand),
    smoothstep(0.5, 4, height),
  );
  /** The relief's slope: sand lies smooth, turf rolls, a canopy heaps, rock stands rough. */
  const roughness = mix(
    mix(
      mix(
        mix(mix(mix(0.12, 0.3, cover), 0.2, upland), 0.28, mountain),
        0.6,
        rock,
      ),
      0.06,
      snow,
    ),
    0.04,
    sand,
  );
  return { colour, roughness };
}
