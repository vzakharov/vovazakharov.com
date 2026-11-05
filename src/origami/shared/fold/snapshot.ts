/**
 * The folded state as a renderer reads it: every piece's corners in 3D, its
 * face, and its layer, each layer lifted by the paper's real thickness.
 */
import { type Crease,creasePattern } from './crease-pattern.ts';
import { apply, determinant, type Polygon } from './geometry.ts';
import type { Paper } from './paper.ts';
import { transform, type Vec3 } from './space.ts';
import { type FoldState, layers } from './state.ts';

export type PieceSnapshot = {
  readonly id: number;
  readonly paper: Polygon;
  readonly world: readonly Vec3[];
  /** Whether the paper's front faces up. */
  readonly front: boolean;
  readonly layer: number;
};

export type Snapshot = {
  readonly pieces: readonly PieceSnapshot[];
  readonly creases: readonly Crease[];
};

export function snapshot(state: FoldState, paper: Paper): Snapshot {
  const layerOf = layers(state);
  // The sheet is the unit square, so a layer is thickness over side.
  const lift = paper.thickness / paper.side;
  return {
    pieces: state.pieces.map(({ id, paper: polygon, placement, shaping }) => {
      const layer = layerOf.get(id) ?? 0;
      return {
        id,
        paper: polygon,
        world: polygon.map((pt) =>
          transform(shaping, [...apply(placement, pt), layer * lift]),
        ),
        front: determinant(placement) > 0,
        layer,
      };
    }),
    creases: creasePattern(state),
  };
}
