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

/** Where the dunes' marram starts, metres above the sea, and where the dunes stand free of the beach. */
const DUNES_FROM = 6;
const DUNES_FREE = 12;

/**
 * The sand, an ocean beach with a dune belt behind it: `sand`, where it lies
 * — up to the shore's top, its edge ragged, never under trees — `dunes`, how
 * much of it is dune and no longer beach, and `colour`: the waterline's own
 * colour drying paler up the beach, a line of wrack, marram on the dunes.
 */
export function beachOf(
  { ground: { level, stops }, mix: m }: Band,
  cover: Node<'float'>,
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
  const marram = smoothstep(
    0.15,
    0.5,
    level
      .div(SHORE_TOP)
      .sub(0.5)
      .add(
        m.ragged([
          [FIELD, 0.4],
          [SLOPE, 0.4],
          [PATCH, 0.5],
          [STEP, 0.6],
          [HAND, 0.3],
        ]).sum,
      ),
  ).mul(smoothstep(DUNES_FROM, DUNES_FREE + 2, level));
  const bare = mix(stops, paint(LAND_PALETTE.sandDry), dry.mul(0.7)).mul(
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
  const sand = smoothstep(
    SHORE_TOP - 6,
    SHORE_TOP + 16,
    level.add(
      m.ragged([
        [HILL, 7],
        [FIELD, 7],
        [SLOPE, 6],
        [PATCH, 4],
        [STEP, 2],
      ]).sum,
    ),
  )
    .oneMinus()
    .mul(cover.mul(0.85).oneMinus());
  return {
    sand,
    dunes: smoothstep(DUNES_FROM - 2, DUNES_FREE, level),
    colour: mix(
      mix(bare, paint(LAND_PALETTE.wrack), wrack.mul(0.75)),
      mix(paint(LAND_PALETTE.hay), paint(LAND_PALETTE.meadow), 0.3),
      marram.mul(0.6),
    ),
  };
}
