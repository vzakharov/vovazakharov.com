import { exp, float, If, max, min, mix, normalize, vec3 } from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R } from '@/island/shared/globe';

import { CELL_METRES } from '../lib/clouds';
import {
  bodyOf,
  type CloudCover,
  coverOf,
  levelOf,
  thickness,
  topOf,
} from './cloud-cover';
import type { iceSeen } from './cloud-ice';
import { type F, seenTo, type V } from './cloud-noise';
import type { CloudFrame, Stretch } from './cloud-rays';
import type { Regime } from './cloud-regimes';

/** What a cloud march over one ray's stretch of `regime`'s layer works with; the stretch is the ray's in the layer. */
export type MarchRay = Stretch & {
  readonly direction: V;
  readonly cosine: F;
  readonly regime: Regime;
  /** Where the ray's weather was read, for the lamps. */
  readonly read: V;
  readonly phase: F;
};

/** What a march's steps share: what the ice cloud is drawn with, the eye and its lamps, and the field. */
export type StepKit = Parameters<typeof iceSeen>[0] & {
  readonly frame: CloudFrame;
  readonly cover: CloudCover;
};

/** What a metre of full cloud takes from a ray. */
const PER_METRE = 0.012;
/** How much deeper a cloud is under the heaviest billow of its cells than under none. */
const BILLOW_DEPTH = 1.4;
/** Metres of cloud between the sun and the deepest crease between a cloud's billows. */
const CREASE_DEPTH = 1800;
/** How far toward the sun a sample looks for the cloud that shades it, metres. */
const SUNWARD = 2500;
/** The most cloud a sample counts between itself and the sun, metres. */
const DEEPEST_SHADE = 12_000;

type Meso = Node<'vec2'>;

/** The two ends of a ray's stretch's meso field, for a sample to take the mean of by where it lies. */
export type MesoEnds = { readonly near: Meso; readonly far: Meso };

/** The meso field at `at`, between the ends of `ray`'s stretch. */
export const mesoAt = (
  { from, length }: MarchRay,
  meso: MesoEnds,
  at: F,
): Meso =>
  mix(meso.near, meso.far, at.sub(from).div(max(length, 1)).clamp(0, 1));

/**
 * The steps of a cloud march: the field read at a point of a ray, and the
 * light one step between two such reads sends to the eye.
 */
export function cloudSteps({
  frame: { height, towardSun },
  rays,
  cover,
  light,
  turned,
}: StepKit) {
  const mesoEnds = ({
    direction,
    regime,
    from,
    length,
  }: MarchRay): MesoEnds => {
    const at = (far: F) =>
      cover.meso(turned(rays.placeAt(direction, far)), regime).toVar();
    return { near: at(from), far: at(from.add(length)) };
  };

  /**
   * The field at `at`, as an eye `away` metres off tells it: the two coarsest
   * scales always, each finer one while it spans more than a few pixels.
   */
  const readAt = (ray: MarchRay, meso: MesoEnds, at: F, away: F) => {
    const place = rays.placeAt(ray.direction, at).toVar();
    const spot = turned(place).toVar();
    const coarse = cover.octave(spot, 0, away).toVar();
    const cells = coarse.add(cover.octave(spot, 1, away)).toVar();
    for (const [index, wave] of CELL_METRES.entries()) {
      if (index < 2) continue;
      If(away.lessThan(seenTo(wave)), () => {
        cells.addAssign(cover.octave(spot, index, away));
      });
    }
    const signal = cover
      .signal(spot, ray.regime, mesoAt(ray, meso, at), cells, away)
      .toVar();
    return {
      at,
      place,
      /** The coarsest cumulus scale there, which the sunward read is weighed against. */
      coarse,
      /** The cumulus scales summed. */
      cells,
      signal,
      away,
    };
  };

  /**
   * One step from `near` to `far`: the light it sends the eye, already
   * weighed by how much of the ray it takes, and the share of the ray it
   * lets through.
   */
  const step = (
    ray: MarchRay,
    near: ReturnType<typeof readAt>,
    far: ReturnType<typeof readAt>,
  ) => {
    const { cosine, regime, read, phase } = ray;
    const nearOver = rays.overAt(cosine, near.at).toVar();
    const thick = thickness(
      { ...near, over: nearOver },
      { ...far, over: rays.overAt(cosine, far.at) },
      regime,
    ).toVar();
    const glow = vec3(0).toVar();
    const taken = float(0).toVar();
    If(thick.greaterThan(0.001), () => {
      const there = near.signal.toVar();
      // From under its base a cloud is shaded by what stands over it; from over it, by what stands sunward.
      If(height.greaterThan(regime.base), () => {
        const sunward = turned(
          normalize(near.place.add(towardSun.mul(SUNWARD / R))),
        );
        there.addAssign(
          regime.fine.mul(cover.octave(sunward, 0, far.away).sub(near.coarse)),
        );
      });
      // The step shows its near end: from over the cloud that is its top, from under it its base.
      const level = min(
        levelOf(nearOver, regime),
        topOf(near.signal, regime),
      ).toVar();
      const lamps = light.lamps(read, regime.base);
      const overhead = min(
        max(topOf(there, regime).sub(level), 0)
          .mul(regime.ceil.sub(regime.base))
          .mul(coverOf(there))
          // Whole cover still has its billows: thick and thin, dark and light from below.
          .mul(near.cells.mul(BILLOW_DEPTH).add(1).clamp(0.3, 2))
          // A crease between billows lies in its neighbours' shade.
          .add(max(near.cells.negate(), 0).mul(CREASE_DEPTH))
          .div(lamps.rise),
        DEEPEST_SHADE,
      );
      taken.assign(
        exp(thick.mul(far.at.sub(near.at)).mul(-PER_METRE)).oneMinus(),
      );
      glow.assign(
        light
          .lit(
            lamps,
            overhead,
            level,
            phase,
            bodyOf(near.signal.add(far.signal).mul(0.5), regime),
          )
          .mul(taken),
      );
    });
    return { glow, taken };
  };

  return { mesoEnds, readAt, step };
}

export type CloudSteps = ReturnType<typeof cloudSteps>;

/** The field at one point of a ray. */
export type Sample = ReturnType<CloudSteps['readAt']>;
