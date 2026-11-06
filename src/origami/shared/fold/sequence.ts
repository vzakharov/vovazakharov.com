/**
 * Folds a step list the way a hand does, then lets it go. From the flat sheet,
 * each step ramps every hinge from where it is to its angle in the flat state
 * after that step, contact siding new pairs from that state's stack, and the
 * hand turning a flat step's flap; then the model, restacked to its final
 * mesh, springs back to the angles its creases hold.
 */
import { run, type Step } from './fold.ts';
import { handGuide } from './hand.ts';
import { type FlatStack, type Mesh, mesh as meshOf } from './mesh.ts';
import type { Paper } from './paper.ts';
import { poseOf } from './pose.ts';
import { type Iterated, type Phase, simulator } from './simulator.ts';
import { type Vec3, vertexAt } from './space.ts';
import { isReverse, type Piece } from './state.ts';

/** Friction between layers once the steps are folded; each step and tuck
 * folds frictionless, as paper slides while a hand works it. */
const FRICTION = 0.5;
/** Contact points along each outline edge besides its ends. */
const EDGE_POINTS = 3;
/** Rubbing stiffens contact, so a sequence with friction takes twice the
 * contact mass to stay stable. */
const CONTACT_MASS = 2;
/** Iterations over which each step's goals move, the hand pulling all along. */
const RAMP = 6000;
const STEP_CAP = 12_000;
const STEP_TOLERANCE = 1e-4;
/** The hand's spring on each flap vertex. */
const HAND = 50;
/** A reverse fold cannot turn rigidly while the creases it crosses stay
 * pressed: the model opens to this share of its angles, reverses there, and
 * is pressed again. */
const OPEN = 0.5;
/** A tuck's lid lowered onto the flap at once, then pressed. */
const SEAT_RAMP = 1;
const SEAT_CAP = 8000;
const LET_GO_RAMP = 2000;
const LET_GO_CAP = 40_000;
const LET_GO_TOLERANCE = 1e-5;
/** An edge grazing paper within this many gaps of the crease line it shares
 * is nested in the fold, not crossing it. */
const NESTED = 4;

/** One phase of the sequence, named for what it folds: `step 3`, `step 3
 * open`, `step 3 seat`, `let go`. */
type NamedPhase = Phase & { readonly stage: string };

export type SequenceRelaxation = Iterated & {
  /** Every mesh vertex in space, settled. */
  readonly positions: readonly Vec3[];
  /** The most any edge stretched or shrank, as a share of its paper length. */
  readonly strain: number;
  /** Mesh edges left passing through paper they are not joined to, by more
   * than half its thickness. */
  readonly crossings: number;
  /** The finished model's mesh, whose vertices `positions` places. */
  readonly mesh: Mesh;
  readonly phases: readonly NamedPhase[];
};

export type SequenceOptions = {
  /** The longest mesh edge, in sheet widths; `mesh`'s default when left out. */
  readonly edge?: number;
};

/** Pairs between a tuck's flap and the lid above it, which a hand holds apart
 * while the flap slides under: vertices wholly on stationary pieces above the
 * flap's top, against flap triangles, and back. */
function lidPairs(
  ofTriangle: readonly Piece[],
  around: ReadonlyArray<readonly Piece[]>,
  moved: ReadonlySet<number>,
): (v: number, t: number) => boolean {
  const top = Math.max(
    ...ofTriangle.filter((p) => moved.has(p.id)).map((p) => p.order),
  );
  const FLAP = 1;
  const LID = 2;
  const kind = (p: Piece) => (moved.has(p.id) ? FLAP : p.order > top ? LID : 0);
  const triangle = Int8Array.from(ofTriangle, kind);
  const vertex = Int8Array.from(around, (pieces) => {
    const kinds = new Set(pieces.map((p) => kind(p)));
    const [only] = kinds;
    return kinds.size === 1 && only !== undefined ? only : 0;
  });
  return (v, t) =>
    (vertex[v] === FLAP && triangle[t] === LID) ||
    (vertex[v] === LID && triangle[t] === FLAP);
}

export function relaxSequence(
  steps: readonly Step[],
  paper: Paper,
  { edge }: SequenceOptions = {},
): SequenceRelaxation {
  const mesh = meshOf(run(steps), paper, edge);
  const sim = simulator(mesh, paper, {
    positions: Float64Array.from(mesh.paper.flatMap(([u, v]) => [u, v, 0])),
    contact: { edgePoints: EDGE_POINTS, friction: FRICTION, release: true },
    contactMass: CONTACT_MASS,
  });
  const phases: NamedPhase[] = [];
  const crease = (h: number) => mesh.hinges[h]?.crease ?? false;
  const folding = { friction: 0 };
  let before = new Float64Array(mesh.hinges.length);
  let previous: FlatStack = mesh;
  for (const [index, step] of steps.entries()) {
    const stage = `step ${index + 1}`;
    const pose = run(steps, index + 1);
    const posed = poseOf(mesh, pose);
    const { stack, angles, ofTriangle, around } = posed;
    const full = Float64Array.from(angles);
    const record = pose.log[index];
    if (!record) throw new Error(`sequence: ${stage} left no record`);
    const { moved } = record;
    const reverse = isReverse(record);
    if (reverse) {
      // The model as it was, opened on the sides it had.
      const opened = before.map((a, h) => (crease(h) ? a * OPEN : 0));
      sim.restack(previous);
      phases.push({
        stage: `${stage} open`,
        ...sim.phase(opened, RAMP, STEP_CAP, STEP_TOLERANCE, folding),
      });
      for (const h of angles.keys()) {
        if (crease(h)) angles[h] = (angles[h] ?? 0) * OPEN;
      }
    }
    sim.restack(stack);
    const direction = step.direction ?? 'valley';
    const tuck = direction === 'tuck';
    if (tuck || direction === 'valley' || direction === 'mountain') {
      sim.guide(
        handGuide(mesh, sim.x, posed, {
          moved,
          sense: direction === 'mountain' ? -1 : 1,
          degrees: step.angle ?? 180,
          k: HAND,
          until: RAMP,
        }),
      );
    }
    const suspended = tuck
      ? { skip: lidPairs(ofTriangle, around, moved), until: Infinity }
      : undefined;
    phases.push({
      stage,
      ...sim.phase(angles, RAMP, STEP_CAP, STEP_TOLERANCE, {
        ...folding,
        suspended,
      }),
    });
    sim.guide(undefined);
    if (tuck) {
      phases.push({
        stage: `${stage} seat`,
        ...sim.phase(full, SEAT_RAMP, SEAT_CAP, STEP_TOLERANCE, folding),
      });
    }
    if (reverse) {
      phases.push({
        stage: `${stage} press`,
        ...sim.phase(full, RAMP, STEP_CAP, STEP_TOLERANCE, folding),
      });
    }
    before = full;
    previous = stack;
  }
  sim.restack(mesh);
  phases.push({
    stage: 'let go',
    ...sim.phase(
      mesh.hinges.map((h) => h.angle),
      LET_GO_RAMP,
      LET_GO_CAP,
      LET_GO_TOLERANCE,
    ),
  });
  const { x } = sim;
  return {
    mesh,
    positions: mesh.paper.map((_, i) => vertexAt(x, i)),
    iterations: phases.reduce((sum, p) => sum + p.iterations, 0),
    strain: sim.strain(),
    crossings: sim.crossings(NESTED),
    phases,
  };
}
