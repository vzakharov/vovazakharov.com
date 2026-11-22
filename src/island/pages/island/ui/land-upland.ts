import { float, max, mix, smoothstep, vec3 } from 'three/tsl';
import type { Node } from 'three/webgpu';

import { BAND_HEIGHTS, LAND_PALETTE, SHORE_TOP } from '../lib/land-colour';
import {
  type Band,
  COUNTRY,
  DISTRICT,
  FIELD,
  GRAIN,
  HAND,
  HILL,
  paint,
  PATCH,
  REGION,
  SLOPE,
  STEP,
} from './land-mix';
import { noiseAt } from './land-noise';

type F = Node<'float'>;

/** Thicknesses of rock's beds, metres: the ledges, and the leaves within one. */
const BEDS = [5.3, 1.1] as const;

/**
 * The brown upland, a subalpine moor: tussock in clumps a step across with
 * heath dark between them, tracts of sward where the ground keeps its damp,
 * stony soil where it leans.
 */
export function moorOf({ ground: { steep }, mix: m }: Band) {
  const heathered = m.patches(-0.32, 0.12, [
    [REGION, 0.35],
    [DISTRICT, 0.4],
    [HILL, 0.3],
    [FIELD, 0.6],
    [SLOPE, 0.5],
    [PATCH, 0.4],
    [STEP, 0.2],
  ]);
  const sward = m.patches(-0.1, 0.45, [
    [COUNTRY, 0.45],
    [REGION, 0.4],
    [DISTRICT, 0.3],
    [HILL, 0.2],
  ]);
  // A narrow edge: a clump stands apart from the heath it grows through.
  const clump = m.edge(
    float(0),
    -0.03,
    0.07,
    m.shaped([
      [STEP, 0.5],
      [HAND, 0.55],
      [GRAIN, 0.2],
    ]),
  );
  const stony = smoothstep(
    0.04,
    0.12,
    steep.add(m.at(PATCH).value.mul(0.02)).add(m.at(STEP).value.mul(0.02)),
  );
  const growth = mix(
    mix(paint(LAND_PALETTE.tussock), paint(LAND_PALETTE.heath), heathered),
    paint(LAND_PALETTE.turf),
    sward.mul(0.55),
  );
  return {
    colour: mix(
      // Between the clumps the eye sees down to shaded heath and soil.
      mix(growth.mul(0.5), growth.mul(1.12), clump),
      paint(LAND_PALETTE.stony),
      stony,
    ).mul(
      m.mottled([
        [PATCH, 0.1],
        [STEP, 0.08],
        [HAND, 0.1],
        [GRAIN, 0.06],
      ]),
    ),
    clump,
  };
}

/**
 * The mountains' ground off the rock: the last turf on what lies level, stony
 * soil, and scree — loose stone the size of a hand — on what leans under a face.
 */
export function alpineOf({ ground: { steep }, mix: m, banded, border }: Band) {
  const turfed = smoothstep(
    BAND_HEIGHTS.mountain[1],
    BAND_HEIGHTS.mountain[1] + 250,
    banded.add(border.sum),
  )
    .oneMinus()
    .mul(smoothstep(0.03, 0.09, steep).oneMinus());
  const scree = smoothstep(0.05, 0.11, steep.add(m.at(SLOPE).value.mul(0.02)));
  // Stones a hand across, each one's edge told from the next.
  const stone = m.edge(
    float(0),
    -0.06,
    0.06,
    m.shaped([
      [HAND, 0.6],
      [GRAIN, 0.5],
    ]),
  );
  const stones = paint(LAND_PALETTE.scree)
    .mul(mix(0.62, 1.08, stone))
    .mul(
      m.mottled([
        [PATCH, 0.1],
        [STEP, 0.16],
        [HAND, 0.26],
        [GRAIN, 0.2],
      ]),
    );
  const soil = mix(
    paint(LAND_PALETTE.stony),
    paint(LAND_PALETTE.turf),
    turfed,
  ).mul(
    m.mottled([
      [PATCH, 0.08],
      [STEP, 0.1],
      [HAND, 0.1],
    ]),
  );
  return { colour: mix(soil, stones, scree), scree };
}

/**
 * Bare rock: `rock`, where it shows — steep ground, in the mountains ground
 * hardly steep at all, and outcrops through the upland's turf — and `colour`,
 * its beds lying level, darker and lighter.
 */
export function rockOf(
  { ground: { level, steep, footprint }, mix: m, detailed }: Band,
  upland: F,
  mountain: F,
) {
  const faces = smoothstep(
    mix(0.11, 0.035, mountain),
    mix(0.24, 0.12, mountain),
    steep.add(m.at(PATCH).value.mul(0.025)).add(m.at(STEP).value.mul(0.015)),
  );
  const outcrops = m
    .patches(0.5, 0.68, [
      [FIELD, 0.35],
      [SLOPE, 0.55],
      [PATCH, 0.4],
    ])
    .mul(upland)
    .mul(smoothstep(0.015, 0.05, steep));
  const bedded = (thickness: number) =>
    noiseAt(
      vec3(
        level
          .add(m.at(PATCH).value.mul(1.5))
          .add(m.at(SLOPE).value.mul(6))
          .add(m.at(FIELD).value.mul(24))
          .add(m.at(HILL).value.mul(70))
          .div(thickness),
        m.at(FIELD).value.mul(1.3).add(7),
        m.at(HILL).value.mul(1.3).add(3),
      ),
    ).w.mul(smoothstep(thickness / 5, thickness / 1.6, footprint).oneMinus());
  // Rock is bedded in places and massive in others, a face's length across.
  const layered = m.patches(-0.2, 0.5, [
    [HILL, 0.4],
    [FIELD, 0.6],
    [SLOPE, 0.3],
  ]);
  const beds = detailed
    ? mix(
        0.5,
        smoothstep(-0.25, 0.25, bedded(BEDS[0]).add(bedded(BEDS[1]).mul(0.5))),
        layered,
      )
    : float(0.5);
  return {
    rock: max(faces, outcrops).mul(smoothstep(2, SHORE_TOP, level)),
    colour: mix(
      paint(LAND_PALETTE.rockDark),
      paint(LAND_PALETTE.rockLight),
      beds.mul(0.5).add(0.25),
    ).mul(
      m.mottled([
        [PATCH, 0.06],
        [STEP, 0.1],
        [HAND, 0.1],
        [GRAIN, 0.06],
      ]),
    ),
  };
}

/** How far from the eye snow slides off what is steep, and from where it lies by height alone, metres. */
const SLIDES_TO = 60_000;
const LIES_FROM = 400_000;

/**
 * Snow: over its line, the line ragged at every scale, slid off faces steeper
 * than some forty degrees — deeper snow holding on a little more. From afar a
 * face is narrower than a pixel and the snow lies by height alone, so a range
 * keeps its white spine from orbit.
 */
export function snowOf({ ground: { level, steep, away }, mix: m }: Band) {
  const over = level.sub(BAND_HEIGHTS.snowLine);
  const lying = m.edge(
    over.div(300),
    -0.07,
    0.07,
    m.ragged([
      [REGION, 0.35],
      [DISTRICT, 0.25],
      [HILL, 0.25],
      [FIELD, 0.15],
      [SLOPE, 0.06],
      [PATCH, 0.03],
    ]),
  );
  const sliding = m.edge(
    steep.sub(smoothstep(0, 1400, over).mul(0.07)),
    0.14,
    0.25,
    m.ragged([
      [FIELD, 0.03],
      [SLOPE, 0.03],
      [PATCH, 0.02],
      [STEP, 0.012],
    ]),
  );
  return lying.mul(
    sliding.mul(smoothstep(SLIDES_TO, LIES_FROM, away).oneMinus()).oneMinus(),
  );
}
