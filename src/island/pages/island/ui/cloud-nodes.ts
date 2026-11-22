import {
  abs,
  asin,
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
  screenCoordinate,
  select,
  smoothstep,
  sqrt,
  uniform,
  vec2,
  vec3,
  vec4,
} from 'three/tsl';
import type { Node } from 'three/webgpu';

import { R } from '@/island/shared/globe';

import {
  CELL_WAVES,
  cloudClockAt,
  HIGHEST_TOP,
  ICE_AT,
  LOWEST_BASE,
  STREAK_WAVES,
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
import { cloudLight } from './cloud-light';
import { type F, noise, toldFrom, type V } from './cloud-noise';
import { type Regime, regimeAt } from './cloud-regimes';

/** What the sky hands its clouds: the eye's place and the lamps, as `sky-nodes.ts` holds them. */
export type CloudFrame = {
  readonly up: V;
  readonly height: F;
  /** The eye's distance from the planet's centre. */
  readonly radius: F;
  /** The eye's radius squared less the planet's. */
  readonly shell: F;
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
const STEPS = 5;
/** What a metre of full cloud takes from a ray. */
const PER_METRE = 0.012;
/** The finest cumulus scale, and the distance past which it is under a pixel. */
const FINEST = CELL_WAVES.length - 1;
const FINEST_SEEN_TO = (R / (CELL_WAVES[FINEST] ?? 1)) * 170;
/** The distance at which a wave looks as coarse as a step of the march a metre long samples it. */
const AWAY_PER_STEP = 110;
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
/** The ice cloud's streaks: each scale's share, coarse then fine. */
const STREAK_WEIGHTS = [0.6, 0.4] as const;
/** How much further off the parallels the streaks bend than the streets. */
const STREAK_BEND = 3;
/** The least steep a ray is taken to cross the ice sheet: its longest path through it. */
const ICE_LEAST_STEEP = 0.12;
/** How much nearer than its sheet the ice cloud is called, for the air that veils it: it lies over most of that air. */
const ICE_NEARER = 0.3;

/**
 * The clouds: a weather map over the sphere, drifting east on the clock,
 * says what kind of cloud each place has; a ray reads it once, marches the
 * low and deep cloud between that kind's base and ceiling, and crosses the
 * ice cloud's one sheet above. The one forward pass draws the same clouds
 * overhead from the beach, round an eye flying through them, and over the
 * disc from orbit.
 */
export function cloudNodes(frame: CloudFrame): CloudNodes {
  const { up, height, radius, shell, towardSun, towardMoon } = frame;
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

  /** The distances at which a ray `cosine` off the zenith meets the sphere `over` metres above the sea. */
  const meets = (cosine: F, over: F | number) => {
    const half = radius.mul(cosine);
    const inside = half
      .mul(half)
      .sub(height.sub(over).mul(height.add(2 * R).add(over)));
    const root = sqrt(max(inside, 0));
    return {
      hit: inside.greaterThan(0),
      near: half.negate().sub(root),
      far: half.negate().add(root),
    };
  };

  /** The stretch of a ray between the spheres `low` and `high` metres above the sea, cut at `metres`. */
  const stretch = (
    cosine: F,
    metres: F,
    low: F | number,
    high: F | number,
  ) => {
    const base = meets(cosine, low);
    const top = meets(cosine, high);
    const under = height.lessThan(low);
    const above = height.greaterThan(high);
    const falling = cosine.lessThan(0);
    const enter = select(under, base.far, select(above, top.near, 0));
    const leave = select(
      under,
      top.far,
      select(base.hit.and(falling), base.near, top.far),
    );
    // From over the layer, only a ray falling into it meets it.
    const missed = above.and(top.hit.and(falling).not());
    const from = max(enter, 0);
    const length = max(min(leave, metres).sub(from), 0);
    return { from, length: select(missed, 0, length) };
  };

  /** Where a ray crosses the ice cloud's sheet, and whether it does. */
  const iceCrossing = (cosine: F) => {
    const sheet = meets(cosine, ICE_AT);
    const under = height.lessThan(ICE_AT);
    return {
      at: select(under, sheet.far, sheet.near),
      hit: under.or(sheet.hit.and(cosine.lessThan(0))),
    };
  };

  /** The distance down a ray at which its weather is read: where it crosses the cumulus, or half-way to the ice above it. */
  const weatherAlong = (cosine: F, iceAt: F): F => {
    const crossed = meets(cosine, WEATHER_AT);
    return select(
      height.lessThan(WEATHER_AT),
      crossed.far,
      select(
        crossed.hit.and(cosine.lessThan(0)),
        crossed.near,
        max(iceAt, 0).mul(select(height.lessThan(ICE_AT), 0.5, 1)),
      ),
    );
  };

  /** The unit vector and the height over the sea of the point `along` metres down a ray. */
  const pointAt = (direction: V, cosine: F, along: F) => {
    const offset = up.mul(radius).add(direction.mul(along));
    const gained = along.mul(radius.mul(cosine).mul(2).add(along));
    const far = sqrt(radius.mul(radius).add(gained));
    return {
      place: normalize(offset),
      over: shell.add(gained).div(far.add(R)),
    };
  };

  /** The ice cloud a ray crosses `at` metres down it, under `regime`: its light, and what it lets through. */
  const iceSeen = (
    direction: V,
    cosine: F,
    at: F,
    { ice, bend }: Regime,
    phase: F,
  ): Node<'vec4'> => {
    const { place } = pointAt(direction, cosine, at);
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
      abs(radius.mul(cosine).add(at)).div(R + ICE_AT),
      ICE_LEAST_STEEP,
    );
    const taken = exp(sheet.div(steep).negate()).oneMinus();
    const colour = light.lit(
      light.lamps(place, ICE_AT),
      float(0),
      float(1),
      phase,
      ice,
    );
    return vec4(colour.mul(taken), taken.oneMinus());
  };

  /** The cover over `spot` under `regime` from the meso cells and the `octaves` coarsest cumulus scales, for an eye `away` metres off. */
  const coverOver = (spot: V, regime: Regime, away: F, octaves: number): F => {
    let cells: F = float(0);
    for (let index = 0; index < octaves; index++)
      cells = cells.add(cover.octave(spot, index, away));
    return coverOf(cover.signal(spot, regime, cover.meso(spot), cells, away));
  };

  /** A cloud's thickness `MIDDLE` of the way up `regime`'s layer, under `covered`. */
  const middling = (covered: F, regime: Regime): F =>
    thickness(covered, mix(regime.base, regime.ceil, MIDDLE), regime);

  const along = (direction: V, metres: F) => {
    const cosine = dot(direction, up);
    const outer = stretch(cosine, metres, LOWEST_BASE, HIGHEST_TOP);
    const crossing = iceCrossing(cosine);
    const iceInSight = crossing.hit.and(crossing.at.lessThan(metres));
    const seen = Fn(() => {
      const low = vec4(0, 0, 0, 1).toVar();
      const high = vec4(0, 0, 0, 1).toVar();
      If(outer.length.greaterThan(0).or(iceInSight), () => {
        const read = pointAt(
          direction,
          cosine,
          min(weatherAlong(cosine, crossing.at), metres),
        );
        const regime = regimeAt(turned(read.place), storms);
        const phase = light.phase(direction).toVar();
        If(iceInSight.and(regime.ice.greaterThan(0.02)), () => {
          high.assign(iceSeen(direction, cosine, crossing.at, regime, phase));
        });
        If(regime.amount.add(mostLift(regime)).greaterThan(0), () => {
          const inLayer = stretch(cosine, metres, regime.base, regime.ceil);
          const from = inLayer.from.toVar();
          const length = inLayer.length.toVar();
          If(length.greaterThan(0), () => {
            const through = float(1).toVar();
            const glow = vec3(0).toVar();
            const lamps = light.lamps(read.place, regime.base);
            const mesoAt = (far: F) =>
              cover
                .meso(turned(pointAt(direction, cosine, far).place))
                .toVar();
            const mesoIn = mesoAt(from);
            const mesoOut = mesoAt(from.add(length));
            // An eye inside the layer samples near itself first: the cloud it is in.
            const within = select(from.lessThanEqual(0), float(1), float(0));
            // Each pixel starts its samples elsewhere in the first step: grain for bands.
            const start = screenCoordinate.xy
              .dot(vec2(0.067_110_56, 0.005_837_15))
              .fract()
              .mul(52.982_918_9)
              .fract()
              .toVar();
            Loop(STEPS, ({ i }) => {
              // What is left would not show through what the ray already met.
              If(through.lessThan(0.02), () => {
                Break();
              });
              const share = float(i).add(start).div(STEPS).toVar();
              const reached = mix(share, share.mul(share), within).toVar();
              const pace = length
                .div(STEPS)
                .mul(mix(1, share.mul(2), within))
                .toVar();
              const at = from.add(length.mul(reached)).toVar();
              const { place, over } = pointAt(direction, cosine, at);
              const spot = turned(place).toVar();
              // A step longer than a wave tells it no better than a pixel wider than it.
              const away = max(at, pace.mul(AWAY_PER_STEP)).toVar();
              const coarse = cover.octave(spot, 0, away).toVar();
              const cells = coarse.toVar();
              for (let index = 1; index < FINEST; index++)
                cells.addAssign(cover.octave(spot, index, away));
              If(away.lessThan(FINEST_SEEN_TO), () => {
                cells.addAssign(cover.octave(spot, FINEST, away));
              });
              const signal = cover
                .signal(spot, regime, mix(mesoIn, mesoOut, reached), cells, away)
                .toVar();
              const thick = thickness(coverOf(signal), over, regime).toVar();
              If(thick.greaterThan(0.001), () => {
                const sunward = turned(
                  normalize(place.add(towardSun.mul(SUNWARD / R))),
                );
                const there = coverOf(
                  signal.add(
                    regime.fine.mul(
                      cover.octave(sunward, 0, away).sub(coarse),
                    ),
                  ),
                ).toVar();
                const level = levelOf(over, regime);
                const overhead = min(
                  max(topOf(there, regime).sub(level), 0)
                    .mul(regime.ceil.sub(regime.base))
                    .mul(there)
                    .div(lamps.rise),
                  DEEPEST_SHADE,
                );
                const taken = exp(
                  thick.mul(pace).mul(-PER_METRE),
                ).oneMinus();
                glow.addAssign(
                  light
                    .lit(lamps, overhead, level, phase, bodyOf(signal, regime))
                    .mul(taken)
                    .mul(through),
                );
                through.mulAssign(taken.oneMinus());
              });
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
      const outer = stretch(cosine, float(1e12), LOWEST_BASE, HIGHEST_TOP);
      const crossing = iceCrossing(cosine);
      const { place } = pointAt(
        direction,
        cosine,
        weatherAlong(cosine, crossing.at),
      );
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
              middling(coverOver(spot, regime, outer.from, 1), regime),
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
          coverOver(spot, regime, position.length(), 2),
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
