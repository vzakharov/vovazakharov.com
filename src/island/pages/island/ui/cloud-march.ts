import {
  Break,
  float,
  If,
  int,
  Loop,
  max,
  min,
  pow,
  select,
  vec3,
  vec4,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { HIGHEST_TOP } from '../lib/clouds';
import { levelOf, topOf } from './cloud-cover';
import type { F } from './cloud-noise';
import {
  type CloudSteps,
  type MarchRay,
  mesoAt,
  type MesoEnds,
  type Sample,
  type StepKit,
} from './cloud-step';

/** Steps along a ray's stretch of the layer for an eye over every cloud. */
const OVER_STEPS = 4;
/** The distance, in a step's level lengths, that hides the same waves the step does: those under a step long. */
const STEP_HIDES = 60;
/** The least steeply a ray is taken to cross the layer, for how fine its waves look. */
const LEAST_STEEP = 0.07;

/** Coarse reads a ray under the highest tops spends finding where its first cloud begins. */
const SEARCHES = 4;
/** The nearest of them to the eye, metres: nearer, the eye is in the cloud it finds. */
const NEAREST = 40;
/**
 * What the coarse read adds to its signal for the finer scales it leaves out,
 * as a share of `fine`, and to a cloud's top, as a share of its layer: the
 * search errs early, and the full steps find the edge.
 */
const SEARCH_PAD = 0.25;
const TOP_PAD = 0.08;
/** Full steps from where the cloud begins to the stretch's end. */
const INNER_STEPS = 6;
/** The scale of the first of them: at least this many metres, and at least this share of its distance. */
const FIRST_STEP = 60;
const FIRST_SHARE = 0.012;
/** How much a grazing ray squeezes the waves a full read tells, as a power of its steepness. */
const SQUEEZE = 0.5;

/**
 * The low and deep cloud along a ray. From over every cloud the ray's few
 * steps cover its stretch of the layer evenly. Under the highest tops, coarse
 * reads find where its first cloud begins, and the full steps start there and
 * lengthen into it, so they lie where the cloud is: its flat base, its heaped
 * side, the wisps an eye inside it is among.
 */
export function cloudMarch(kit: StepKit, steps: CloudSteps) {
  const {
    rays,
    cover,
    turned,
    frame: { height },
  } = kit;

  /** How far off an eye seems to the waves at `at`, the ray grazing the layer squeezing them. */
  const awayAt = (ray: MarchRay, at: F, squeeze: number): F =>
    at.div(pow(rays.steepAt(ray.cosine, at).clamp(LEAST_STEEP, 1), squeeze));

  /** The light and the share let through of `count` steps between the points `point(0)` to `point(count)`. */
  const walk = (
    ray: MarchRay,
    readAt: (at: F) => Sample,
    point: (i: F) => F,
    count: number,
  ): Node<'vec4'> => {
    const through = float(1).toVar();
    const glow = vec3(0).toVar();
    const first = readAt(point(float(0)));
    const near = {
      at: first.at.toVar(),
      place: first.place.toVar(),
      coarse: first.coarse.toVar(),
      cells: first.cells.toVar(),
      signal: first.signal.toVar(),
      away: first.away.toVar(),
    };
    Loop({ start: int(0), end: int(count) }, ({ i }) => {
      // What is left would not show through what the ray already met.
      If(through.lessThan(0.02), () => {
        Break();
      });
      const far = readAt(point(float(i).add(1)));
      const { glow: lit, taken } = steps.step(ray, near, far);
      glow.addAssign(lit.mul(through));
      through.mulAssign(taken.oneMinus());
      near.at.assign(far.at);
      near.place.assign(far.place);
      near.coarse.assign(far.coarse);
      near.cells.assign(far.cells);
      near.signal.assign(far.signal);
      near.away.assign(far.away);
    });
    return vec4(glow, through);
  };

  /** Steps that share the stretch evenly; `hidden` fades the waves shorter than one. */
  const even = (ray: MarchRay, meso: MesoEnds): Node<'vec4'> => {
    const { cosine, from, length } = ray;
    const steep = rays.steepAt(cosine, from.add(length.mul(0.5))).toVar();
    const hidden = length
      .div(OVER_STEPS)
      .mul(steep.mul(steep).oneMinus().max(0).sqrt())
      .mul(STEP_HIDES)
      .toVar();
    const readAt = (at: F) =>
      steps.readAt(ray, meso, at, max(awayAt(ray, at, 1), hidden));
    return walk(
      ray,
      readAt,
      (i) => from.add(length.mul(i).div(OVER_STEPS)),
      OVER_STEPS,
    );
  };

  /** Where a ray's first cloud begins on the coarse field, and whether it has one. */
  const entry = (ray: MarchRay, meso: MesoEnds) => {
    const { cosine, direction, regime, from, length } = ray;
    const end = from.add(length).toVar();
    const nearest = max(from, NEAREST).toVar();
    const ratio = end.div(nearest).max(1).toVar();
    /** How far inside a cloud of the coarse field `at` is: over zero, in it. */
    const inside = (at: F): F => {
      const away = awayAt(ray, at, SQUEEZE);
      const spot = turned(rays.placeAt(direction, at));
      const signal = cover
        .signal(
          spot,
          regime,
          mesoAt(ray, meso, at),
          cover.octave(spot, 0, away).add(cover.octave(spot, 1, away)),
          away,
        )
        .add(regime.fine.mul(SEARCH_PAD))
        .toVar();
      const top = topOf(signal, regime).add(TOP_PAD);
      return min(signal, top.sub(levelOf(rays.overAt(cosine, at), regime)));
    };
    const found = float(0).toVar();
    const at = from.toVar();
    const was = inside(from).toVar();
    If(was.greaterThan(0), () => {
      found.assign(1);
    });
    If(found.equal(0), () => {
      Loop({ start: int(1), end: int(SEARCHES + 1) }, ({ i }) => {
        const next = nearest.mul(pow(ratio, float(i).div(SEARCHES))).toVar();
        const now = inside(next).toVar();
        If(now.greaterThan(0), () => {
          // Where the coarse field crosses into the cloud, on the line between the two reads.
          const crossed = at.add(next.sub(at).mul(was.div(was.sub(now))));
          const middle = inside(crossed).toVar();
          const [low, high, lowIs, highIs] = [
            select(middle.greaterThan(0), at, crossed),
            select(middle.greaterThan(0), crossed, next),
            select(middle.greaterThan(0), was, middle),
            select(middle.greaterThan(0), middle, now),
          ];
          at.assign(low.add(high.sub(low).mul(lowIs.div(lowIs.sub(highIs)))));
          found.assign(1);
          Break();
        });
        at.assign(next);
        was.assign(now);
      });
    });
    return { found, at };
  };

  /** Full steps from where the ray's first cloud begins, lengthening into it. */
  const into = (ray: MarchRay, meso: MesoEnds): Node<'vec4'> => {
    const seen = vec4(0, 0, 0, 1).toVar();
    const begun = entry(ray, meso);
    If(begun.found.greaterThan(0), () => {
      const end = ray.from.add(ray.length);
      const first = max(begun.at.mul(FIRST_SHARE), FIRST_STEP).toVar();
      const start = max(begun.at.sub(first), ray.from).toVar();
      // Each step longer than the one before by the same share, the last ending where the stretch does.
      const grows = end.sub(start).div(first).add(1).toVar();
      const readAt = (at: F) =>
        steps.readAt(ray, meso, at, awayAt(ray, at, SQUEEZE));
      seen.assign(
        walk(
          ray,
          readAt,
          (i) => start.add(first.mul(pow(grows, i.div(INNER_STEPS)).sub(1))),
          INNER_STEPS,
        ),
      );
    });
    return seen;
  };

  return (ray: MarchRay): Node<'vec4'> => {
    const seen = vec4(0, 0, 0, 1).toVar();
    const meso = steps.mesoEnds(ray);
    If(height.lessThan(HIGHEST_TOP), () => {
      seen.assign(into(ray, meso));
    }).Else(() => {
      seen.assign(even(ray, meso));
    });
    return seen;
  };
}
