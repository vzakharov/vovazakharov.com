import {
  Break,
  dot,
  exp,
  float,
  Fn,
  If,
  Loop,
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
  CELL_METRES,
  cloudClockAt,
  HIGHEST_TOP,
  ICE_AT,
  LOWEST_BASE,
  WEATHER_AT,
} from '../lib/clouds';
import {
  bodyOf,
  cloudCover,
  coverOf,
  levelOf,
  mostLift,
  thickness,
  topOf,
} from './cloud-cover';
import { iceSeen } from './cloud-ice';
import { cloudLight } from './cloud-light';
import { type F, seenTo, type V } from './cloud-noise';
import { cloudRays, type EyeFrame } from './cloud-rays';
import { type Regime, regimeAt } from './cloud-regimes';

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

/** Samples of the field along a ray's stretch of the layer. */
const STEPS = 4;
/** What a metre of full cloud takes from a ray. */
const PER_METRE = 0.012;
/** How much deeper a cloud is under the heaviest billow of its cells than under none. */
const BILLOW_DEPTH = 1.4;
/** The least steeply a ray is taken to cross the layer, for how fine its waves look. */
const LEAST_STEEP = 0.07;
/** How far toward the sun a sample looks for the cloud that shades it, metres. */
const SUNWARD = 2500;
/** The most cloud a sample counts between itself and the sun, metres. */
const DEEPEST_SHADE = 12_000;
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
    const mesoAt = (far: F, regime: Regime) =>
      cover.meso(turned(rays.placeAt(direction, far)), regime).toVar();
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
            const through = float(1).toVar();
            const glow = vec3(0).toVar();
            const lamps = light.lamps(read, regime.base);
            const mesoIn = mesoAt(from, regime);
            const mesoOut = mesoAt(from.add(length), regime);
            // An eye inside the layer samples near itself first: the cloud it is in.
            const within = select(from.lessThanEqual(0), float(1), float(0));
            /** The field where the ray has come `share` of the way through its samples. */
            const readAt = (share: F) => {
              const reached = mix(share, share.mul(share), within).toVar();
              const at = from.add(length.mul(reached)).toVar();
              const place = rays.placeAt(direction, at).toVar();
              const spot = turned(place).toVar();
              // A ray grazing the layer sees its waves squeezed: as fine as from that much further off.
              const away = at
                .div(rays.steepAt(cosine, at).clamp(LEAST_STEEP, 1))
                .toVar();
              const coarse = cover.octave(spot, 0, away).toVar();
              const cells = coarse.add(cover.octave(spot, 1, away)).toVar();
              for (const [index, wave] of CELL_METRES.entries()) {
                if (index < 2) continue;
                // A scale under a pixel is not read at all.
                If(away.lessThan(seenTo(wave)), () => {
                  cells.addAssign(cover.octave(spot, index, away));
                });
              }
              const signal = cover.signal(
                spot,
                regime,
                mix(mesoIn, mesoOut, reached),
                cells,
                away,
              );
              return { at, place, coarse, cells, signal, away };
            };
            const first = readAt(float(0));
            // The near end of each step, which the far end of the last one was.
            const nearAt = first.at.toVar();
            const nearPlace = first.place.toVar();
            const nearCoarse = first.coarse.toVar();
            const nearCells = first.cells.toVar();
            const nearSignal = first.signal.toVar();
            Loop(STEPS, ({ i }) => {
              // What is left would not show through what the ray already met.
              If(through.lessThan(0.02), () => {
                Break();
              });
              const far = readAt(float(i).add(1).div(STEPS));
              const farSignal = far.signal.toVar();
              const nearOver = rays.overAt(cosine, nearAt).toVar();
              const thick = thickness(
                { signal: nearSignal, over: nearOver },
                { signal: farSignal, over: rays.overAt(cosine, far.at) },
                regime,
              ).toVar();
              If(thick.greaterThan(0.001), () => {
                const there = nearSignal.toVar();
                // From under its base a cloud is shaded by what stands over it; from over it, by what stands sunward.
                If(height.greaterThan(regime.base), () => {
                  const sunward = turned(
                    normalize(nearPlace.add(towardSun.mul(SUNWARD / R))),
                  );
                  there.addAssign(
                    regime.fine.mul(
                      cover.octave(sunward, 0, far.away).sub(nearCoarse),
                    ),
                  );
                });
                // The step shows its near end: from over the cloud that is its top, from under it its base.
                const level = min(
                  levelOf(nearOver, regime),
                  topOf(nearSignal, regime),
                ).toVar();
                const overhead = min(
                  max(topOf(there, regime).sub(level), 0)
                    .mul(regime.ceil.sub(regime.base))
                    .mul(coverOf(there))
                    // Whole cover still has its billows: thick and thin, dark and light from below.
                    .mul(nearCells.mul(BILLOW_DEPTH).add(1).clamp(0.3, 2))
                    .div(lamps.rise),
                  DEEPEST_SHADE,
                );
                const taken = exp(
                  thick.mul(far.at.sub(nearAt)).mul(-PER_METRE),
                ).oneMinus();
                glow.addAssign(
                  light
                    .lit(
                      lamps,
                      overhead,
                      level,
                      phase,
                      bodyOf(nearSignal.add(farSignal).mul(0.5), regime),
                    )
                    .mul(taken)
                    .mul(through),
                );
                through.mulAssign(taken.oneMinus());
              });
              nearAt.assign(far.at);
              nearPlace.assign(far.place);
              nearCoarse.assign(far.coarse);
              nearCells.assign(far.cells);
              nearSignal.assign(farSignal);
            });
            low.assign(vec4(glow, through));
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
