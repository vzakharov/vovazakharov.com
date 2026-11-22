import {
  dot,
  float,
  Fn,
  If,
  max,
  min,
  mix,
  normalize,
  select,
  smoothstep,
  uniform,
  vec3,
  vec4,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R } from '@/island/shared/globe';

import {
  cloudClockAt,
  HIGHEST_TOP,
  ICE_AT,
  LOWEST_BASE,
  WEATHER_AT,
} from '../lib/clouds';
import { cloudCover, mostLift, thickness } from './cloud-cover';
import { iceSeen } from './cloud-ice';
import { cloudLight } from './cloud-light';
import { cloudMarch } from './cloud-march';
import type { F, V } from './cloud-noise';
import { cloudRays, type EyeFrame } from './cloud-rays';
import { type Regime, regimeAt } from './cloud-regimes';
import { cloudSteps } from './cloud-step';

/** What the sky hands its clouds: the eye's place and the lamps, as `sky-nodes.ts` holds them. */
export type CloudFrame = EyeFrame & {
  readonly towardSun: V;
  readonly towardMoon: V;
};

export type CloudNodes = {
  /**
   * The clouds along `direction` out to `metres`: their light in `rgb`,
   * already weighed by how much of the ray they take, and what they let
   * through in `a`. `near` is the distance they begin at.
   */
  readonly along: (
    direction: V,
    metres: F,
  ) => { readonly seen: Node<'vec4'>; readonly near: F };
  /** The same from one sample, for a mirror's blurred sky. */
  readonly glanced: (direction: V) => Node<'vec4'>;
  /** The share of the sun's light the clouds leave at `position`, the eye being the origin. */
  readonly shade: (position: V) => F;
  readonly update: (seconds: number) => void;
};

/** The share of the sun a shallow cloud and a deep one keep off the ground under them. */
const GROUND_SHADE = [0.55, 0.85] as const;
/** The depths of those two, metres. */
const SHADE_DEPTHS = [1500, 6000] as const;
/** The share of the sun the thickest ice cloud keeps off the ground. */
const ICE_SHADE = 0.12;
/** The height in its layer a shadow and a mirror's glance read a cloud at. */
const MIDDLE = 0.35;
/** How much nearer than its sheet the ice cloud is called, for the air that veils it: it lies over most of that air. */
const ICE_NEARER = 0.3;

/** The thickness, `MIDDLE` of the way up `regime`'s layer, of a cloud with `signal`. */
const middling = (signal: F, regime: Regime): F =>
  Fn(() => {
    const end = {
      signal: signal.toVar(),
      over: mix(regime.base, regime.ceil, MIDDLE).toVar(),
    };
    return thickness(end, end, regime);
  })();

/**
 * The clouds: a weather map over the sphere, drifting east on the clock,
 * says what kind of cloud each place has; a ray reads it once, marches the
 * low and deep cloud between that kind's base and ceiling, and crosses the
 * ice cloud's one sheet above. The one forward pass draws the same clouds
 * overhead from the beach, round an eye flying through them, and over the
 * disc from orbit.
 */
export function cloudNodes(frame: CloudFrame): CloudNodes {
  const { up, height, radius, towardSun, towardMoon } = frame;
  const cosDrift = uniform(1);
  const sinDrift = uniform(0);
  const growth = uniform(0);
  const storms = uniform(0);
  const cover = cloudCover(growth);
  const light = cloudLight(towardSun, towardMoon);

  /** `unit` in the field's own turning frame. */
  const turned = (unit: V): V =>
    vec3(
      unit.x.mul(cosDrift).sub(unit.z.mul(sinDrift)),
      unit.y,
      unit.x.mul(sinDrift).add(unit.z.mul(cosDrift)),
    );

  const rays = cloudRays(frame);
  const ice = iceSeen({ frame, rays, light, turned });
  const kit = { frame, rays, cover, light, turned };
  const march = cloudMarch(kit, cloudSteps(kit, towardSun));

  /** The signal over `spot` under `regime` from the meso cells and the `octaves` coarsest cumulus scales, for an eye `away` metres off. */
  const signalOver = (spot: V, regime: Regime, away: F, octaves: number): F => {
    let cells: F = float(0);
    for (let index = 0; index < octaves; index++)
      cells = cells.add(cover.octave(spot, index, away));
    return cover.signal(spot, regime, cover.meso(spot, regime), cells, away);
  };

  const along = (direction: V, metres: F) => {
    const cosine = dot(direction, up);
    const outer = rays.stretch(cosine, metres, LOWEST_BASE, HIGHEST_TOP);
    const crossing = rays.iceCrossing(cosine);
    const iceInSight = crossing.hit.and(crossing.at.lessThan(metres));
    const seen = Fn(() => {
      const low = vec4(0, 0, 0, 1).toVar();
      const high = vec4(0, 0, 0, 1).toVar();
      If(outer.length.greaterThan(0).or(iceInSight), () => {
        const read = rays
          .placeAt(
            direction,
            min(rays.weatherAlong(cosine, crossing.at), metres),
          )
          .toVar();
        const regime = regimeAt(turned(read), storms);
        const phase = light.phase(direction).toVar();
        If(iceInSight.and(regime.ice.greaterThan(0.02)), () => {
          high.assign(ice(direction, cosine, crossing.at, regime, phase));
        });
        If(regime.amount.add(mostLift(regime)).greaterThan(0), () => {
          const inLayer = rays.stretch(
            cosine,
            metres,
            regime.base,
            regime.ceil,
          );
          const from = inLayer.from.toVar();
          const length = inLayer.length.toVar();
          If(length.greaterThan(0), () => {
            low.assign(
              march({ direction, cosine, regime, read, phase, from, length }),
            );
          });
        });
      });
      // The nearer of the two layers lies over the other.
      const under = height.lessThan(ICE_AT);
      const front = select(under, low, high);
      const back = select(under, high, low);
      return vec4(front.rgb.add(back.rgb.mul(front.a)), front.a.mul(back.a));
    })();
    return {
      seen,
      near: select(
        outer.length.greaterThan(0),
        outer.from,
        max(crossing.at, 0).mul(ICE_NEARER),
      ),
    };
  };

  const glanced = (direction: V): Node<'vec4'> =>
    Fn(() => {
      const cosine = dot(direction, up);
      const outer = rays.stretch(cosine, float(1e12), LOWEST_BASE, HIGHEST_TOP);
      const crossing = rays.iceCrossing(cosine);
      const place = rays
        .placeAt(direction, rays.weatherAlong(cosine, crossing.at))
        .toVar();
      const spot = turned(place).toVar();
      const regime = regimeAt(spot, storms);
      const taken = float(0).toVar();
      If(
        outer.length
          .greaterThan(0)
          .and(regime.amount.add(mostLift(regime)).greaterThan(0)),
        () => {
          taken.assign(
            smoothstep(
              0,
              0.5,
              middling(signalOver(spot, regime, outer.from, 1), regime),
            ),
          );
        },
      );
      const veiled = select(crossing.hit, regime.ice.mul(0.5), 0);
      const all = taken.add(veiled.mul(taken.oneMinus()));
      const colour = light.lit(
        light.lamps(place, regime.base),
        float(250),
        float(MIDDLE),
        float(1),
        float(0.7),
      );
      return vec4(colour.mul(all), all.oneMinus());
    })();

  const shade = (position: V): F =>
    Fn(() => {
      const place = normalize(up.mul(radius).add(position));
      // Where the sun's ray to the place crosses the cumulus.
      const rise = max(dot(place, towardSun), 0.2);
      const spot = turned(
        normalize(place.mul(R).add(towardSun.mul(float(WEATHER_AT).div(rise)))),
      ).toVar();
      const regime = regimeAt(spot, storms);
      const kept = regime.ice.mul(ICE_SHADE).toVar();
      If(regime.amount.add(mostLift(regime)).greaterThan(0), () => {
        const thick = middling(
          signalOver(spot, regime, position.length(), 2),
          regime,
        );
        const [shallow, deep] = GROUND_SHADE;
        const [thin, tall] = SHADE_DEPTHS;
        const most = mix(
          shallow,
          deep,
          smoothstep(thin, tall, regime.ceil.sub(regime.base)),
        );
        const low = smoothstep(0, 0.5, thick).mul(most);
        kept.assign(low.add(kept.mul(low.oneMinus())));
      });
      const day = smoothstep(0, 0.15, dot(place, towardSun));
      return kept.mul(day).oneMinus();
    })();

  return {
    along,
    glanced,
    shade,
    update: (seconds) => {
      const clock = cloudClockAt(seconds);
      cosDrift.value = Math.cos(clock.drift);
      sinDrift.value = Math.sin(clock.drift);
      growth.value = clock.growth;
      storms.value = clock.storms;
    },
  };
}
