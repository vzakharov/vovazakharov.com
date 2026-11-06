/**
 * A state partway through a sequence, read onto the mesh of the finished
 * model: which piece of it each triangle and vertex lies on, and the angle
 * each hinge is folded to there.
 */
import { contains, type Vec } from './geometry.ts';
import {
  type FlatStack,
  flatStack,
  foldAngle,
  type PaperMesh,
  piecesAround,
} from './mesh.ts';
import type { FoldState, Piece } from './state.ts';

export type Pose = {
  /** The pose's flat stack, for contact to take its sides from. */
  readonly stack: FlatStack;
  /** Every hinge's fold angle in the pose: 0 within one of its pieces. */
  readonly angles: Float64Array;
  /** The pose's piece under each triangle. */
  readonly ofTriangle: readonly Piece[];
  /** The pose's pieces each vertex lies on. */
  readonly around: ReadonlyArray<readonly Piece[]>;
};

/** The final mesh's pieces are the pose's cut finer, so each triangle lies
 * within one pose piece. */
export function poseOf(mesh: PaperMesh, pose: FoldState): Pose {
  const point = (i: number): Vec => {
    const pt = mesh.paper[i];
    if (!pt) throw new Error(`pose: no vertex ${i}`);
    return pt;
  };
  const pieceAt = (ids: readonly number[]): Piece => {
    const pt: Vec = [
      ids.reduce((sum, i) => sum + point(i)[0], 0) / ids.length,
      ids.reduce((sum, i) => sum + point(i)[1], 0) / ids.length,
    ];
    const found = pose.pieces.find((piece) => contains(piece.paper, pt));
    if (!found) throw new Error(`pose: no piece at ${pt.join(',')}`);
    return found;
  };
  const ofTriangle = mesh.triangles.map((triangle) => pieceAt(triangle));
  const around = piecesAround(mesh.paper.length, mesh.triangles, ofTriangle);
  const angles = Float64Array.from(mesh.hinges, (h) => {
    const left = pieceAt([h.a, h.b, h.c]);
    const right = pieceAt([h.b, h.a, h.d]);
    return left === right ? 0 : foldAngle(left, right, point(h.a), point(h.b));
  });
  return {
    stack: flatStack(ofTriangle, around),
    angles,
    ofTriangle,
    around,
  };
}
