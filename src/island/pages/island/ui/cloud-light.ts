import {
  dot,
  exp,
  max,
  min,
  mix,
  pow,
  smoothstep,
  sqrt,
  vec3,
} from 'three/tsl';

import { R } from '@/island/shared/globe';

import type { F, V } from './cloud-noise';

/** The white of a cloud top in the sun, in the scene's exposure. */
const WHITE = 0.94;
/** The sun's colour on a cloud at the terminator, and the sky's in a cloud's own shade. */
const LOW_SUN = [1, 0.42, 0.18] as const;
const SHADE_SKY = [0.1, 0.13, 0.19] as const;
/** What the ground under a cloud throws back up at its base, as a share of the sun. */
const GROUND_GLOW = [0.05, 0.055, 0.05] as const;
/** A cloud by night, and what the full moon adds. */
const NIGHT = [0.01, 0.013, 0.022] as const;
const MOONLIT = [0.035, 0.045, 0.07] as const;
/** What a metre of cloud between a place and the sun takes of its light, light scattering forward as it does. */
const SHADOW_PER_METRE = 0.003;
/** The share of the sun a cloud keeps however deep: the light that has scattered many times. */
const DIFFUSE = 0.4;
/** How much slower the scattered light dies with depth than the direct. */
const DIFFUSE_REACH = 0.2;
/** The least of the sun's light inside a shallow cloud, and the metres of cloud overhead that wear it out. */
const GLOW_WITHIN = 0.5;
const GLOW_DEPTH = 3500;
/** A wisp's white as a share of a deep cloud's. */
const THIN_WHITE = 0.65;
/** The forward lean of a droplet's scattering, Henyey and Greenstein's `g`, and its share of the phase. */
const LEAN = 0.72;
const FORWARD = 0.3;
/** The most the forward lobe brightens a cloud's edge before the sun. */
const GLARE = 6;

export type Lamps = {
  /** The sun's colour on the cloud, nothing by night. */
  readonly sun: V;
  /** 1 by day, 0 by night, at the cloud's own height. */
  readonly day: F;
  readonly night: V;
  /** The sine of the sun's elevation there, never under a grazing one. */
  readonly rise: F;
};

export type CloudLight = {
  /** The lamps on a cloud over `place`, `over` metres above the sea: a high cloud keeps the sun after the ground has lost it. */
  readonly lamps: (place: V, over: F | number) => Lamps;
  /** How much brighter a cloud is seen along `direction` than from the side: toward the sun, its edges glare. */
  readonly phase: (direction: V) => F;
  /**
   * A cloud's colour under `lamps`, with `overhead` metres of cloud between
   * it and the sun, `level` of the way up its layer, seen with `phase`.
   * `body` is how much cloud it is part of, 0 a wisp to 1 a deep mass: the
   * light a thin cloud lets through it does not send back.
   */
  readonly lit: (lamps: Lamps, overhead: F, level: F, phase: F, body: F) => V;
};

export function cloudLight(towardSun: V, towardMoon: V): CloudLight {
  const lamps = (place: V, over: F | number): Lamps => {
    // The horizon dips with height: the sun sets later on a high cloud.
    const dip = sqrt(max(over, 0)).mul(Math.sqrt(2 / R));
    const sunHeight = dot(place, towardSun).add(dip);
    const day = smoothstep(-0.08, 0.12, sunHeight);
    const sun = mix(
      vec3(...LOW_SUN),
      vec3(1, 0.985, 0.96),
      smoothstep(0, 0.3, sunHeight),
    ).mul(day);
    const moon = smoothstep(-0.05, 0.2, dot(place, towardMoon));
    const night = vec3(...NIGHT).add(vec3(...MOONLIT).mul(moon));
    return { sun, day, night, rise: max(sunHeight, 0.15) };
  };

  const phase = (direction: V): F => {
    const cosine = dot(direction, towardSun);
    const lobe = pow(cosine.mul(-2 * LEAN).add(1 + LEAN * LEAN), -1.5).mul(
      1 - LEAN * LEAN,
    );
    return min(lobe, GLARE)
      .mul(FORWARD)
      .add(1 - FORWARD * 0.5);
  };

  const lit = (
    { sun, day, night }: Lamps,
    overhead: F,
    level: F,
    seen: F,
    body: F,
  ): V => {
    const depth = overhead.mul(SHADOW_PER_METRE);
    const direct = max(
      exp(depth.negate()),
      exp(depth.mul(-DIFFUSE_REACH)).mul(DIFFUSE),
    );
    const within = exp(overhead.div(-GLOW_DEPTH)).mul(GLOW_WITHIN);
    const share = mix(within, 1, direct)
      .mul(mix(1, seen, direct))
      .mul(mix(THIN_WHITE, 1, body));
    const shaded = direct.oneMinus();
    return sun
      .mul(share)
      .mul(WHITE)
      .add(
        vec3(...SHADE_SKY)
          .mul(shaded.mul(mix(0.5, 1, level)))
          .add(vec3(...GROUND_GLOW).mul(level.oneMinus()))
          .mul(day),
      )
      .add(night.mul(mix(0.6, 1, direct)));
  };

  return { lamps, phase, lit };
}
