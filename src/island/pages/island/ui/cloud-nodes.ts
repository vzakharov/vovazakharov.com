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
  CLOUD_AMOUNT,
  CLOUD_BASE,
  CLOUD_TOP,
  cloudClockAt,
  FRONT_WAVES,
  WEATHER_WAVES,
} from '../lib/clouds';

type F = Node<'float'>;
type V = Node<'vec3'>;

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
/** How far the cells' noise moves the field off its weather. */
const CELL_WEIGHT = 0.9;
/** How far under its weather the field must rise to cloud: the clear sky between cells. */
const CELL_GAPS = 0.3;
/** The most weather the cells are laid over: past it the sky would close into one sheet. */
const THICKEST = 0.4;
/** A pixel's width as a share of its distance, on a screen a thousand pixels across. */
const PIXEL = 1.2e-3;
/** Each cell octave's share of the cells' noise, coarsest first. */
const CELL_WEIGHTS = [0.55, 0.3, 0.15] as const;
/** Weather at or under this is clear sky: no cell lifts it into cloud. */
const CLEAR = CELL_GAPS - CELL_WEIGHT * 0.7;
/** The finest cell octave, and the distance past which it is under a pixel. */
const FINEST = CELL_WAVES.length - 1;
const FINEST_SEEN_TO = R / (CELL_WAVES[FINEST] ?? 1) / (2 * PIXEL);
/** The white of a cloud top in the sun, in the scene's exposure. */
const WHITE = 0.94;
/** A cloud's base as a share of its top's light. */
const BASE_LIGHT = 0.55;
/** The sun's colour on a cloud at the terminator, and the sky's in a cloud's own shade. */
const LOW_SUN = [1, 0.42, 0.18] as const;
const SHADE_SKY = [0.1, 0.13, 0.19] as const;
/** A cloud by night, and what the full moon adds. */
const NIGHT = [0.01, 0.013, 0.022] as const;
const MOONLIT = [0.035, 0.045, 0.07] as const;
/** The share of the sun a full cloud keeps off the ground under it. */
const GROUND_SHADE = 0.6;
/** The height in the layer a shadow and a mirror's glance read the field at. */
const MIDDLE = 0.35;

/** How much of a wave, `waves` of them round the sphere, an eye `metres` away tells apart: none once it nears a pixel's width. */
const toldFrom = (waves: number, metres: F): F => {
  const wave = R / waves;
  return smoothstep(wave / (6 * PIXEL), wave / (2 * PIXEL), metres).oneMinus();
};

/**
 * The field's cover, 0 to 1, from its weather and cells, for an eye `metres`
 * away: near enough to tell the cells, the thickest weather still breaks
 * into them; too far, it is the weather's own shape.
 */
const coverOf = (weathered: F, celled: F, metres: F): F => {
  const told = toldFrom(CELL_WAVES[0] ?? 1, metres);
  const broken = mix(weathered, min(weathered, THICKEST), told);
  return smoothstep(
    0,
    0.45,
    broken.add(celled.mul(CELL_WEIGHT)).sub(CELL_GAPS),
  );
};

/** A cloud's thickness `level` of the way up the layer, under `cover`: flat below, heaped where the cover is whole. */
const thickness = (cover: F, level: F): F => {
  const top = cover.mul(0.65).add(0.35);
  return cover
    .mul(smoothstep(0, 0.12, level))
    .mul(smoothstep(top.sub(0.3), top, level).oneMinus());
};

/**
 * The clouds: one field over the sphere, drifting east on the clock, thick
 * between `CLOUD_BASE` and `CLOUD_TOP`. A ray is sampled along its stretch of
 * that layer in the one forward pass, so the same clouds stand overhead from
 * the beach, round an eye flying through them, and over the disc from orbit.
 */
export function cloudNodes(frame: CloudFrame): CloudNodes {
  const { up, height, radius, shell, towardSun, towardMoon } = frame;
  const cosDrift = uniform(1);
  const sinDrift = uniform(0);
  const growth = uniform(0);

  /** `unit` in the field's own turning frame. */
  const turned = (unit: V): V =>
    vec3(
      unit.x.mul(cosDrift).sub(unit.z.mul(sinDrift)),
      unit.y,
      unit.x.mul(sinDrift).add(unit.z.mul(cosDrift)),
    );

  /** A lattice point's value, 0 to 1. */
  const latticeValue = Fn(([point]: [V]) => {
    const folded = point.mul(0.1031).fract().toVar();
    folded.addAssign(dot(folded, folded.zyx.add(31.32)));
    return folded.x.add(folded.y).mul(folded.z).fract();
  });

  /** Value noise over `at`, -1 to 1, a wave a unit. */
  const valueNoise = Fn(([at]: [V]) => {
    const cell = at.floor().toVar();
    const within = at.sub(cell).toVar();
    const eased = within.mul(within).mul(within.mul(-2).add(3)).toVar();
    const corner = (x: number, y: number, z: number) =>
      latticeValue(cell.add(vec3(x, y, z)));
    const edge = (y: number, z: number) =>
      mix(corner(0, y, z), corner(1, y, z), eased.x);
    const face = (z: number) => mix(edge(0, z), edge(1, z), eased.y);
    return mix(face(0), face(1), eased.z).mul(2).sub(1);
  });

  const noise = (at: V): F => valueNoise(at);

  /** The weather over `place`: under 0 clear whatever the cells do, over 0 cloud. */
  const weather = (place: V): F => {
    const [wide, narrow] = WEATHER_WAVES;
    const [front, fine] = FRONT_WAVES;
    const systems = noise(place.mul(wide).add(11.3))
      .mul(0.6)
      .add(noise(place.mul(narrow).add(3.7)).mul(0.4));
    const fronts = noise(place.mul(front))
      .mul(0.45)
      .add(noise(place.mul(fine)).mul(0.25));
    return systems.add(fronts).add((CLOUD_AMOUNT - 0.5) * 2);
  };

  /**
   * The cells over `place`, octaves `first` up to `octaves`, as an eye
   * `metres` away tells them apart: each fades out as its wave nears a
   * pixel's width.
   */
  const cells = (place: V, octaves: number, metres: F, first = 0): F => {
    const grown = vec3(0, growth, 0);
    let sum: F = float(0);
    for (const [index, waves] of CELL_WAVES.entries()) {
      if (index < first || index >= octaves) continue;
      const told = toldFrom(waves, metres);
      // Each octave on its own axes, so the lattices never line up.
      const turnedOnce = index % 2 === 0 ? place : place.zxy;
      sum = sum.add(
        noise(turnedOnce.mul(waves).add(grown))
          .mul(told)
          .mul(CELL_WEIGHTS[index] ?? 0),
      );
    }
    return sum;
  };

  /** The light on a cloud over `place`: the sun's by its height there, the night's under it. */
  const lightOver = (place: V) => {
    const sunHeight = dot(place, towardSun);
    const day = smoothstep(-0.08, 0.12, sunHeight);
    const sun = mix(
      vec3(...LOW_SUN),
      vec3(1, 0.985, 0.96),
      smoothstep(0, 0.3, sunHeight),
    ).mul(day);
    const moon = smoothstep(-0.05, 0.2, dot(place, towardMoon));
    const night = vec3(...NIGHT).add(vec3(...MOONLIT).mul(moon));
    return { sun, day, night };
  };

  /** The distances at which a ray `cosine` off the zenith meets the sphere `over` metres above the sea. */
  const meets = (cosine: F, over: number) => {
    const half = radius.mul(cosine);
    const inside = half
      .mul(half)
      .sub(height.sub(over).mul(height.add(2 * R + over)));
    const root = sqrt(max(inside, 0));
    return {
      hit: inside.greaterThan(0),
      near: half.negate().sub(root),
      far: half.negate().add(root),
    };
  };

  /** The stretch of a ray inside the layer, cut at `metres`. */
  const stretch = (cosine: F, metres: F) => {
    const base = meets(cosine, CLOUD_BASE);
    const top = meets(cosine, CLOUD_TOP);
    const under = height.lessThan(CLOUD_BASE);
    const above = height.greaterThan(CLOUD_TOP);
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

  const along = (direction: V, metres: F) => {
    const cosine = dot(direction, up);
    const { from, length } = stretch(cosine, metres);
    const seen = Fn(() => {
      const through = float(1).toVar();
      const light = vec3(0).toVar();
      If(length.greaterThan(0), () => {
        const middle = pointAt(direction, cosine, from.add(length.mul(0.5)));
        const weathered = weather(turned(middle.place)).toVar();
        If(weathered.greaterThan(CLEAR), () => {
          const { sun, day, night } = lightOver(middle.place);
          const pace = length.div(STEPS).toVar();
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
            const at = from.add(pace.mul(float(i).add(start)));
            const { place, over } = pointAt(direction, cosine, at);
            const level = over
              .sub(CLOUD_BASE)
              .div(CLOUD_TOP - CLOUD_BASE)
              .clamp(0, 1);
            const spot = turned(place);
            const celled = cells(spot, FINEST, at).toVar();
            // The finest cells are under a pixel past here.
            If(at.lessThan(FINEST_SEEN_TO), () => {
              celled.addAssign(cells(spot, CELL_WAVES.length, at, FINEST));
            });
            const cover = coverOf(weathered, celled, at);
            const thick = thickness(cover, level);
            const taken = exp(thick.mul(pace).mul(-PER_METRE)).oneMinus();
            // Lighter toward its top, darker deep under a whole cover.
            const lit = mix(BASE_LIGHT, 1, level).mul(
              cover.mul(level.oneMinus()).mul(-0.3).add(1),
            );
            const colour = sun
              .mul(lit)
              .mul(WHITE)
              .add(
                vec3(...SHADE_SKY)
                  .mul(day)
                  .mul(lit.oneMinus()),
              )
              .add(night);
            light.addAssign(colour.mul(taken).mul(through));
            through.mulAssign(taken.oneMinus());
          });
        });
      });
      return vec4(light, through);
    })();
    return { seen, near: from };
  };

  /**
   * The cover over the place a ray from `place` toward `toward` crosses the
   * layer's middle, from the weather and the `octaves` coarsest cells.
   */
  const coverToward = (place: V, toward: V, metres: F, octaves: number): F =>
    Fn(() => {
      const rise = max(dot(place, toward), 0.2);
      const over = normalize(
        place.mul(R).add(toward.mul(float(CLOUD_BASE + 800).div(rise))),
      );
      const spot = turned(over);
      const cover = float(0).toVar();
      const weathered = weather(spot).toVar();
      If(weathered.greaterThan(CLEAR), () => {
        cover.assign(
          thickness(
            coverOf(weathered, cells(spot, octaves, metres), metres),
            float(MIDDLE),
          ),
        );
      });
      return cover;
    })();

  const glanced = (direction: V): Node<'vec4'> => {
    const cosine = dot(direction, up);
    const { from, length } = stretch(cosine, float(1e12));
    const { place } = pointAt(direction, cosine, from.add(length.mul(0.5)));
    const cover = coverToward(place, place, from, 1).mul(
      select(length.greaterThan(0), 1, 0),
    );
    const taken = smoothstep(0, 0.5, cover);
    const { sun, night } = lightOver(place);
    const colour = sun.mul(WHITE * 0.8).add(night);
    return vec4(colour.mul(taken), taken.oneMinus());
  };

  const shade = (position: V): F => {
    const offset = up.mul(radius).add(position);
    const place = normalize(offset);
    const cover = coverToward(place, towardSun, position.length(), 2);
    const day = smoothstep(0, 0.15, dot(place, towardSun));
    return smoothstep(0, 0.5, cover).mul(day).mul(GROUND_SHADE).oneMinus();
  };

  return {
    along,
    glanced,
    shade,
    update: (seconds) => {
      const clock = cloudClockAt(seconds);
      cosDrift.value = Math.cos(clock.drift);
      sinDrift.value = Math.sin(clock.drift);
      growth.value = clock.growth;
    },
  };
}
