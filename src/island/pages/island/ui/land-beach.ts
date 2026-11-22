import { mix, smoothstep } from 'three/tsl';
import type { Node } from 'three/webgpu';

import { LAND_PALETTE, SHORE_TOP } from '../lib/land-colour';
import {
  type Band,
  FIELD,
  GRAIN,
  HAND,
  HILL,
  paint,
  PATCH,
  SLOPE,
  STEP,
} from './land-mix';

/** Where the last storm left its wrack, metres above the sea, and half the line's width. */
const WRACK_AT = 2.6;
const WRACK_WIDTH = 0.3;

/** The height under which sand is beach, wet from the sea, and over which it stands as dune, metres. */
const BEACH_TOP = 8;

/**
 * How sandy ground is by its height alone, 0…1: all sand to the shore's top,
 * none a little over it.
 */
export const sandinessOf = (level: Node<'float'>): Node<'float'> =>
  smoothstep(SHORE_TOP - 6, SHORE_TOP + 16, level).oneMinus();

/**
 * The sand, an ocean beach with a dune belt behind it, drawn wherever
 * `sandiness` — 0…1 — says sand lies, whatever the height and however steep:
 * `sand`, how much of the ground is sand's and no band's; `bare`, how much of
 * that the wind keeps bare; and `colour`: the waterline's own colour drying
 * paler up the beach, a line of wrack, marram in tufts where the sand thins.
 */
export function beachOf(
  { ground: { level, stops }, mix: m }: Band,
  sandiness: Node<'float'>,
) {
  const dry = smoothstep(1.5, 5, level.add(m.at(PATCH).value.mul(0.6)));
  const wrack = smoothstep(
    0,
    WRACK_WIDTH,
    level
      .add(m.at(PATCH).value.mul(0.5))
      .add(m.at(STEP).value.mul(0.2))
      .sub(WRACK_AT)
      .abs(),
  )
    .oneMinus()
    .mul(
      m.patches(-0.05, 0.3, [
        [STEP, 0.5],
        [HAND, 0.6],
      ]),
    );
  const thinning = m.ragged([
    [HILL, 0.12],
    [FIELD, 0.14],
    [SLOPE, 0.12],
    [PATCH, 0.1],
  ]);
  const sand = m.edge(sandiness, 0.12, 0.4, thinning);
  // Marram: none on the open beach, tufts a step across thickening to a
  // sward as the sand gives out.
  const grown = m
    .edge(sandiness, 0.45, 0.95, thinning)
    .oneMinus()
    .mul(smoothstep(BEACH_TOP - 3, BEACH_TOP + 3, level));
  const tufts = m.edge(
    grown.mul(1.1).sub(0.55),
    -0.1,
    0.1,
    m.ragged([
      [PATCH, 0.25],
      [STEP, 0.4],
      [HAND, 0.25],
    ]),
  );
  const grains = mix(
    mix(stops, paint(LAND_PALETTE.sandDry), dry.mul(0.7)),
    paint(LAND_PALETTE.sandDry),
    smoothstep(BEACH_TOP, SHORE_TOP, level)
      .mul(0.3)
      .add(0.7)
      .mul(smoothstep(BEACH_TOP - 4, BEACH_TOP + 4, level)),
  ).mul(
    m.mottled([
      [HILL, 0.04],
      [FIELD, 0.06],
      [SLOPE, 0.05],
      [PATCH, 0.03],
      [STEP, 0.03],
      [HAND, 0.04],
      [GRAIN, 0.05],
    ]),
  );
  const marram = paint(LAND_PALETTE.marram).mul(
    m.mottled([
      [PATCH, 0.1],
      [STEP, 0.14],
      [HAND, 0.18],
      [GRAIN, 0.1],
    ]),
  );
  return {
    sand,
    bare: tufts.oneMinus(),
    colour: mix(
      mix(grains, paint(LAND_PALETTE.wrack), wrack.mul(0.75)),
      marram,
      tufts.mul(0.85),
    ),
  };
}
