/**
 * The paper's spring-back kept alive between phases, so a model can be folded
 * along its sequence: each phase moves every hinge's goal from where the hinge
 * is now to a new target over `ramp` iterations, then lets it settle.
 * Positions, tracked angles and contact (with its friction anchors) carry over.
 *
 * Stiff bars hold every edge at its paper length, creases pull toward their
 * goal, plain paper toward flat, and layers keep a sheet's thickness apart.
 * Explicit damped dynamics as in Origami Simulator (Ghassaei et al. 2018),
 * damped by FIRE (Bitzek et al. 2006), on the CPU and deterministic.
 */
import { contact } from './contact.ts';
import { crossings } from './crossings.ts';
import { dihedral } from './hinge.ts';
import type { FlatStack, Mesh } from './mesh.ts';
import type { Paper } from './paper.ts';
import { longestEdge } from './proximity.ts';

/** Stiffnesses relative to one another; only their ratios shape the result. */
const AXIAL = 20;
const CREASE = 0.7;
const FACET = 0.7;
/** Contact, per unit of overlap into the gap, scaled by the mesh edge. */
const CONTACT = 4 * AXIAL;
/** Contacts a vertex can carry at once: its own, and those of the vertices
 * over every triangle around it. */
const CONTACT_LOAD = 12;
/** Steps between rebuilding the contact pairs. */
const REFRESH = 10;
const MAX_DT = 1.8;

/** `angle` moved by whole turns to lie nearest `near`. */
const unwrap = (angle: number, near: number): number =>
  angle + 2 * Math.PI * Math.round((near - angle) / (2 * Math.PI));

export type Iterated = { readonly iterations: number };

export type Phase = Iterated & {
  /** Whether it settled before its cap; a phase hitting the cap returns. */
  readonly settled: boolean;
  /** The most any vertex felt at the last iteration run. */
  readonly force: number;
};

/** Holds for the first `until` iterations of every phase. */
type Lasting = { readonly until: number };

/** The hand's spring on each vertex it holds, and how long it holds. */
export type Spring = Lasting & { readonly k: number };

/** A force from outside on the vertices `mask` marks, each sprung with `k` to
 * `target(i, share, out)` at the ramp's `share` — the hand turning a flap, so
 * no crease takes the reaction. A phase does not settle while it pulls. */
export type Guide = Spring & {
  readonly mask: Uint8Array;
  readonly target: (i: number, share: number, out: number[]) => void;
};

/** Contact pairs `skip` names left out; a phase does not settle while they
 * are. */
type Suspension = Lasting & {
  readonly skip: (v: number, t: number) => boolean;
};

type PhaseOptions = {
  readonly suspended?: Suspension;
  /** Friction for the phase; `contact.friction` when left out. */
  readonly friction?: number;
};

export type SimulatorOptions = {
  /** Where every vertex starts, packed xyz; the mesh's start by default. */
  readonly positions?: Float64Array;
  /** Per hinge, the angle its starting dihedral unwraps nearest, so a crease
   * folded flat starts on its side of ±π; the raw dihedral when left out. */
  readonly near?: readonly number[];
  /** Contact's options; `friction` is also each phase's default. */
  readonly contact?: Parameters<typeof contact>[3];
  /** Scales the contact share of each vertex's mass: rubbing stiffens
   * contact, so a sequence with friction takes 2 to stay stable. */
  readonly contactMass?: number;
};

export function simulator(
  mesh: Mesh,
  paper: Paper,
  {
    positions,
    near,
    contact: touching = {},
    contactMass = 1,
  }: SimulatorOptions = {},
) {
  const n = mesh.paper.length;
  const gap = paper.thickness / paper.side;
  const edge = longestEdge(mesh);
  const x = positions
    ? Float64Array.from(positions)
    : Float64Array.from(mesh.start.flat());
  const v = new Float64Array(3 * n);
  const f = new Float64Array(3 * n);
  const a = new Float64Array(3 * n);
  const gradient = new Float64Array(12);
  const hinges = mesh.hinges;
  const corners = Int32Array.from(hinges.flatMap((h) => [h.a, h.b, h.c, h.d]));
  const stiffness = Float64Array.from(
    hinges.map((h) => (h.crease ? CREASE : FACET) * h.rest),
  );
  // The angle is tracked across steps, so a crease folded flat keeps its side
  // past ±π.
  const tracked = Float64Array.from(
    hinges.map((h, i) => {
      const angle = dihedral(x, h);
      return near ? unwrap(angle, near[i] ?? angle) : angle;
    }),
  );
  const from = new Float64Array(hinges.length);
  const target = new Float64Array(hinges.length);
  let ramp = 1;
  let iteration = 0;
  const wings = { a: 0, b: 0, c: 0, d: 0 };
  const touch = contact(mesh, gap, CONTACT / edge, touching);
  let guided: Guide | undefined;
  const aim = [0, 0, 0];

  // The stiffest any vertex is held bounds the step: Gershgorin over the bars,
  // the hinges and a contact on each side. Each vertex weighs what holds it, so
  // every one rings at the same top frequency and the step no longer waits on
  // the stiffest corner.
  const mass = new Float64Array(n).fill(
    (CONTACT_LOAD * CONTACT * contactMass) / edge,
  );
  for (const [p, q, length] of mesh.bars) {
    for (const i of [p, q]) mass[i] = (mass[i] ?? 0) + (2 * AXIAL) / length;
  }
  for (const [h, hinge] of hinges.entries()) {
    dihedral(x, hinge, gradient);
    for (const [k, i] of [hinge.a, hinge.b, hinge.c, hinge.d].entries()) {
      const g2 =
        (gradient[3 * k] ?? 0) ** 2 +
        (gradient[3 * k + 1] ?? 0) ** 2 +
        (gradient[3 * k + 2] ?? 0) ** 2;
      mass[i] = (mass[i] ?? 0) + 4 * (stiffness[h] ?? 0) * g2;
    }
  }
  /** No vertex moves farther in one step than half the gap, so no layer
   * steps through another unseen. */
  const maxStep = gap / 2;

  const pull = (at: number, by: number) => {
    f[at] = (f[at] ?? 0) + by;
  };

  const forces = (): number => {
    f.fill(0);
    for (const [from3, to3, length] of mesh.bars) {
      const p = 3 * from3;
      const q = 3 * to3;
      const dx = (x[q] ?? 0) - (x[p] ?? 0);
      const dy = (x[q + 1] ?? 0) - (x[p + 1] ?? 0);
      const dz = (x[q + 2] ?? 0) - (x[p + 2] ?? 0);
      // Not `Math.hypot`, which rounds differently: relaxed positions are
      // kept reproducible to the bit.
      const lenSquared = dx * dx + dy * dy + dz * dz;
      const len = Math.sqrt(lenSquared);
      const tension = (AXIAL * (len - length)) / length / len;
      pull(p, tension * dx);
      pull(p + 1, tension * dy);
      pull(p + 2, tension * dz);
      pull(q, -tension * dx);
      pull(q + 1, -tension * dy);
      pull(q + 2, -tension * dz);
    }
    for (const h of target.keys()) {
      wings.a = corners[4 * h] ?? 0;
      wings.b = corners[4 * h + 1] ?? 0;
      wings.c = corners[4 * h + 2] ?? 0;
      wings.d = corners[4 * h + 3] ?? 0;
      const angle = unwrap(dihedral(x, wings, gradient), tracked[h] ?? 0);
      tracked[h] = angle;
      const goal = (from[h] ?? 0) + ((target[h] ?? 0) - (from[h] ?? 0)) * ramp;
      const torque = -(stiffness[h] ?? 0) * (angle - goal);
      for (let k = 0; k < 4; k++) {
        const i = 3 * (corners[4 * h + k] ?? 0);
        for (let c = 0; c < 3; c++)
          pull(i + c, torque * (gradient[3 * k + c] ?? 0));
      }
    }
    if (guided && iteration < guided.until) {
      for (let i = 0; i < n; i++) {
        if ((guided.mask[i] ?? 0) === 0) continue;
        guided.target(i, ramp, aim);
        for (let c = 0; c < 3; c++) {
          pull(3 * i + c, -guided.k * ((x[3 * i + c] ?? 0) - (aim[c] ?? 0)));
        }
      }
    }
    touch.push(x, f);
    let worst = 0;
    for (let i = 0; i < 3 * n; i += 3) {
      const fx = f[i] ?? 0;
      const fy = f[i + 1] ?? 0;
      const fz = f[i + 2] ?? 0;
      worst = Math.max(worst, fx * fx + fy * fy + fz * fz);
    }
    return Math.sqrt(worst);
  };

  /** One FIRE step from the forces `forces` left in `f`. */
  const fire = { dt: MAX_DT / 10, alpha: 0.1, calm: 0 };
  const step = () => {
    for (let i = 0; i < 3 * n; i++) {
      a[i] = (f[i] ?? 0) / (mass[Math.floor(i / 3)] ?? 1);
    }
    let power = 0;
    let vv = 0;
    let aa = 0;
    for (let i = 0; i < 3 * n; i++) {
      const ai = a[i] ?? 0;
      const vi = v[i] ?? 0;
      power += ai * vi;
      vv += vi * vi;
      aa += ai * ai;
    }
    if (power > 0) {
      const mix = (fire.alpha * Math.sqrt(vv)) / Math.sqrt(aa);
      for (let i = 0; i < 3 * n; i++) {
        v[i] = (1 - fire.alpha) * (v[i] ?? 0) + mix * (a[i] ?? 0);
      }
      if (++fire.calm > 5) {
        fire.dt = Math.min(fire.dt * 1.1, MAX_DT);
        fire.alpha *= 0.99;
      }
    } else {
      v.fill(0);
      fire.dt *= 0.5;
      fire.alpha = 0.1;
      fire.calm = 0;
    }
    const { dt } = fire;
    for (let i = 0; i < 3 * n; i += 3) {
      const vx = (v[i] ?? 0) + (a[i] ?? 0) * dt;
      const vy = (v[i + 1] ?? 0) + (a[i + 1] ?? 0) * dt;
      const vz = (v[i + 2] ?? 0) + (a[i + 2] ?? 0) * dt;
      const speedSquared = vx * vx + vy * vy + vz * vz;
      const travel = Math.sqrt(speedSquared) * dt;
      const cap = travel > maxStep ? maxStep / travel : 1;
      v[i] = vx * cap;
      v[i + 1] = vy * cap;
      v[i + 2] = vz * cap;
      x[i] = (x[i] ?? 0) + vx * cap * dt;
      x[i + 1] = (x[i + 1] ?? 0) + vy * cap * dt;
      x[i + 2] = (x[i + 2] ?? 0) + vz * cap * dt;
    }
  };

  /** Ramps every hinge's goal from its angle now to `goals` over `rampFor`
   * iterations, then settles once no vertex feels more than `tolerance`, or
   * stops at `cap` iterations. */
  const phase = (
    goals: ArrayLike<number>,
    rampFor: number,
    cap: number,
    tolerance: number,
    { suspended, friction = touching.friction ?? 0 }: PhaseOptions = {},
  ): Phase => {
    touch.rubAt(friction);
    from.set(tracked);
    target.set(goals);
    v.fill(0);
    fire.dt = MAX_DT / 10;
    fire.alpha = 0.1;
    fire.calm = 0;
    let force = Infinity;
    for (iteration = 0; iteration < cap; iteration++) {
      ramp = rampFor > 0 ? Math.min(1, iteration / rampFor) : 1;
      const held = suspended !== undefined && iteration < suspended.until;
      if (iteration % REFRESH === 0) {
        touch.suspend(held ? suspended.skip : undefined);
        touch.refresh(x, 2 * REFRESH * maxStep);
      }
      force = forces();
      const guiding = guided !== undefined && iteration < guided.until;
      if (force < tolerance && ramp === 1 && !held && !guiding) {
        return { iterations: iteration, settled: true, force };
      }
      step();
    }
    return { iterations: cap, settled: false, force };
  };

  /** The most any edge stretched or shrank, as a share of its paper length. */
  const strain = (): number => {
    let worst = 0;
    for (const [p, q, length] of mesh.bars) {
      const len = Math.hypot(
        (x[3 * q] ?? 0) - (x[3 * p] ?? 0),
        (x[3 * q + 1] ?? 0) - (x[3 * p + 1] ?? 0),
        (x[3 * q + 2] ?? 0) - (x[3 * p + 2] ?? 0),
      );
      worst = Math.max(worst, Math.abs(len - length) / length);
    }
    return worst;
  };

  return {
    /** Every vertex, packed xyz, as the last phase left it. */
    x,
    /** Every hinge's angle, unwrapped across phases. */
    tracked,
    phase,
    restack: (stack: FlatStack) => {
      touch.restack(stack);
    },
    /** Sets the hand's springs for the phases that follow; nothing lifts it. */
    guide: (next: Guide | undefined) => {
      guided = next;
    },
    strain,
    /** Mesh edges passing through paper they are not joined to by more than
     * half its thickness; `nested` as `crossings` takes it. */
    crossings: (nested = 0) => crossings(mesh, x, { within: gap / 2, nested }),
  };
}
