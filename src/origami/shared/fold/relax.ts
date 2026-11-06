/**
 * Lets a folded mesh spring back and settle, as real paper does once let go:
 * one phase of `simulator`, from the mesh's start to the angles its hinges
 * keep — creases toward theirs, plain paper toward flat, more softly, which is
 * what lets it bend rather than crease.
 */
import type { Mesh } from './mesh.ts';
import type { Paper } from './paper.ts';
import { type Iterated, simulator } from './simulator.ts';
import { type Vec3, vertexAt } from './space.ts';

/** Settled once no vertex feels more than this: it moves a bar by ~1e-8 of
 * the sheet, and contact switching on and off keeps the last digits from
 * calming further. */
const TOLERANCE = 1e-5;
const MAX_ITERATIONS = 200_000;
/** Steps over which the hinges' goals move to where they rest, so the paper
 * opens near balance rather than flung open. */
const RAMP = 2000;

export type Relaxation = Iterated & {
  /** Every mesh vertex in space, settled. */
  readonly positions: readonly Vec3[];
  /** The most any edge stretched or shrank, as a share of its paper length. */
  readonly strain: number;
  /** Mesh edges left passing through paper they are not joined to, by more
   * than half its thickness. */
  readonly crossings: number;
};

export function relax(mesh: Mesh, paper: Paper): Relaxation {
  // Unwrapped toward each hinge's pressed angle, so a crease folded flat
  // begins on its own side of ±π.
  const sim = simulator(mesh, paper, {
    near: mesh.hinges.map((h) => h.pressed),
  });
  const { iterations, settled } = sim.phase(
    mesh.hinges.map((h) => h.angle),
    RAMP,
    MAX_ITERATIONS,
    TOLERANCE,
  );
  if (!settled) {
    throw new Error(
      `relax: the paper did not settle in ${MAX_ITERATIONS} steps`,
    );
  }
  const { x } = sim;
  return {
    positions: mesh.paper.map((_, i) => vertexAt(x, i)),
    iterations,
    strain: sim.strain(),
    crossings: sim.crossings(),
  };
}
