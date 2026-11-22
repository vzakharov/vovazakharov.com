import {
  abs,
  asin,
  exp,
  float,
  max,
  select,
  smoothstep,
  vec3,
  vec4,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R } from '@/island/shared/globe';

import { ICE_AT, STREAK_WAVES } from '../lib/clouds';
import type { CloudLight } from './cloud-light';
import { type F, noise, toldFrom, type V } from './cloud-noise';
import type { CloudRays, EyeFrame } from './cloud-rays';
import type { Regime } from './cloud-regimes';

/** The ice cloud's streaks: each scale's share, coarse then fine. */
const STREAK_WEIGHTS = [0.6, 0.4] as const;
/** How much further off the parallels the streaks bend than the streets. */
const STREAK_BEND = 3;
/** The least steep a ray is taken to cross the ice sheet: its longest path through it. */
const ICE_LEAST_STEEP = 0.12;
/** The metres of cloud the thickest sheet puts between the sun and an eye under it. */
const SHEET_DEPTH = 1500;

type IceParts = {
  readonly frame: EyeFrame;
  readonly rays: CloudRays;
  readonly light: CloudLight;
  /** A unit vector in the field's own turning frame. */
  readonly turned: (unit: V) => V;
};

/**
 * The ice cloud a ray crosses `at` metres down it, under `regime`: its light,
 * and what it lets through. One sheet, streaked along the wind; white from
 * above, and from below as grey as it is thick.
 */
export const iceSeen =
  ({ frame, rays, light, turned }: IceParts) =>
  (
    direction: V,
    cosine: F,
    at: F,
    { ice, bend }: Regime,
    phase: F,
  ): Node<'vec4'> => {
    const place = rays.placeAt(direction, at);
    const spot = turned(place);
    const lat = asin(spot.y.clamp(-1, 1)).add(bend.mul(STREAK_BEND));
    let streaks: F = float(0);
    for (const [index, [across, along]] of STREAK_WAVES.entries()) {
      streaks = streaks.add(
        noise(vec3(spot.x.mul(along), lat.mul(across), spot.z.mul(along)))
          .mul(toldFrom(across, at))
          .mul(STREAK_WEIGHTS[index] ?? 0),
      );
    }
    // A thick shield is one sheet; thin ice is all streaks.
    const sheet = smoothstep(
      0,
      1,
      ice
        .mul(1.3)
        .sub(0.35)
        .add(streaks.mul(ice.mul(-0.4).add(0.7))),
    ).mul(ice.mul(1.2).add(0.2));
    const steep = max(
      abs(frame.radius.mul(cosine).add(at)).div(R + ICE_AT),
      ICE_LEAST_STEEP,
    );
    const taken = exp(sheet.div(steep).negate()).oneMinus();
    const colour = light.lit(
      light.lamps(place, ICE_AT),
      select(frame.height.lessThan(ICE_AT), sheet.mul(SHEET_DEPTH), 0),
      float(1),
      phase,
      ice,
    );
    return vec4(colour.mul(taken), taken.oneMinus());
  };
