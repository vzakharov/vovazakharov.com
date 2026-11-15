import {
  abs,
  dot,
  exp,
  float,
  fwidth,
  length,
  max,
  normalize,
  positionWorldDirection,
  pow,
  select,
  smoothstep,
  sqrt,
  uniform,
  vec3,
} from 'three/tsl';
import { type Node, Vector3 } from 'three/webgpu';

import { R, type Vec3 } from '@/island/shared/globe';

import {
  adaptedTo,
  airAtEye,
  GAS,
  GAS_PER_METRE,
  HAZE,
  HAZE_PER_METRE,
  type Layer,
  LIGHT_PER_METRE,
  lightThrough,
  SHADOW,
  SPACE_COLOUR,
} from '../lib/air';
import type { Heavens } from '../lib/day';

export type Backed = {
  /** The scene's background node: `radiance` along the view ray plus the discs. */
  readonly background: Node<'vec3'>;
};

export type SkyNodes = Backed & {
  /** Radiance arriving from world direction `direction` (unit), linear RGB, in the scene's exposure: what the sea mirrors. */
  readonly radiance: (direction: Node<'vec3'>) => Node<'vec3'>;
  /** `colour` seen through `metres` of air along world direction `direction`. */
  readonly aerial: (
    colour: Node<'vec3'>,
    direction: Node<'vec3'>,
    metres: Node<'float'>,
  ) => Node<'vec3'>;
  /** Per frame: the heavens, the eye's zenith (unit) and its height in metres. */
  readonly update: (heavens: Heavens, up: Vec3, height: number) => void;
};

/** What the sun's in-scattered light is worth in the scene's exposure, where lit land stays under 1. */
const SUN_LIGHT = 0.9;
/** The full moon's, cool, and far over its real share: a night sky to see by. */
const MOON_LIGHT = [0.07, 0.09, 0.14] as const;

/** The haze's forward lean: Henyey and Greenstein's `g`. */
const HAZE_LEAN = 0.8;
/** The share of what the haze takes from a ray that it gives back as glow round the lamp. */
const HAZE_GLOW = 0.5;
/**
 * What air lit from overhead scatters again into a ray, as a share of the
 * light up there: it fills the horizon's thick air, which single scattering
 * leaves grey away from the sun.
 */
const SKYLIGHT = [0.4, 0.46, 0.56] as const;
/**
 * How much of its glow the air loses seen straight down, none along the
 * ground: from above, the planet keeps its colours under the veil.
 */
const STEEP_LOSS = 0.5;
/**
 * How many of the gas's scale heights up a ray toward the zenith meets the
 * light it scatters: a low sun reddens the horizon and leaves the zenith blue.
 */
const LIFT = 3;
/**
 * How much brighter than its single scattering the sky overhead is: what the
 * air scatters again, which a ray along the ground gathers little of.
 */
const OVERHEAD = 1;

/** The discs' radius, radians: half as wide again as the real sun's and moon's. */
const DISC_RADIUS = (0.4 * Math.PI) / 180;
/** The sun's disc over the light it sheds, so a red one on the horizon still glares. */
const SUN_DISC = 12;
const MOON_DISC = [0.82, 0.86, 0.95] as const;

type F = Node<'float'>;
type V = Node<'vec3'>;

/** A light in the sky: the unit vector toward it and what it sheds into the air. */
type Lamp = { readonly toward: V; readonly light: V };

/**
 * The island's sky and its air, one model from two metres to orbit: two
 * layers of air round a sphere, lit by the sun and the moon, scattered once.
 * A ray's sky and a surface's haze are the same sum over different lengths,
 * so a far shore fades into the horizon behind it.
 */
export function skyNodes(): SkyNodes {
  const up = uniform(new Vector3(0, 1, 0));
  const height = uniform(0);
  /** The eye's distance from the planet's centre. */
  const radius = uniform(R);
  /** `height · (2R + height)`: the eye's radius squared less the planet's, kept exact. */
  const shell = uniform(0);
  const excess = uniform(0);
  const towardSun = uniform(new Vector3(0, 1, 0));
  const towardMoon = uniform(new Vector3(0, -1, 0));
  const sunLight = uniform(new Vector3());
  const sun: Lamp = { toward: towardSun, light: sunLight };
  const moon: Lamp = { toward: towardMoon, light: vec3(...MOON_LIGHT) };
  const gasPerMetre = vec3(...GAS_PER_METRE);
  const lightPerMetre = vec3(...LIGHT_PER_METRE);
  const skylight = vec3(...SKYLIGHT);
  const space = vec3(...SPACE_COLOUR);

  /** The lowest height a ray from `h` reaches leaving `cosine` off the zenith, downward. */
  const lowestAlong = (cosine: F, h: F): F =>
    h.sub(
      h
        .add(R)
        .mul(cosine.mul(cosine))
        .div(sqrt(max(0, float(1).sub(cosine.mul(cosine)))).add(1)),
    );

  /** `lib/air.ts`'s `airColumn` per fragment; only the gas takes the eye's excess. */
  const column = (cosine: F, h: F, of: Layer): F => {
    const more = of === GAS ? excess : float(0);
    const steep = abs(cosine);
    const grazing = float(2).div(
      steep.add(sqrt(steep.mul(steep).add(of.rounding))),
    );
    const upward = exp(h.div(-of.scale)).add(more).mul(grazing).mul(of.scale);
    const lowest = max(0, lowestAlong(cosine, h));
    const through = exp(lowest.div(-of.scale))
      .add(more)
      .mul((4 * of.scale) / Math.sqrt(of.rounding))
      .sub(upward);
    return select(cosine.greaterThanEqual(0), upward, through);
  };

  /**
   * What `gas` and `haze` metres of sea-level air along `direction` let
   * through, and the light they scatter into the ray; `zenith` and `h` are
   * where that air lies, and `lift` raises where it meets the light.
   */
  const scattered = (
    direction: V,
    zenith: V,
    h: F,
    gas: F,
    haze: F,
    lift: F,
  ) => {
    const gasOut = gasPerMetre.mul(gas);
    const hazeOut = haze.mul(HAZE_PER_METRE);
    const out = gasOut.add(hazeOut);
    const through = exp(out.negate());
    const kept = through.oneMinus().div(max(out, 1e-9));
    const lit = h.add(lift.mul(LIFT * GAS.scale));
    const lean = HAZE_LEAN;
    const from = ({ toward, light }: Lamp): V => {
      const lampCosine = dot(zenith, toward);
      /** Metres the lamp's ray runs under the ground: the planet's shadow. */
      const buried = max(0, lowestAlong(lampCosine, lit).negate());
      const shaded = select(lampCosine.lessThan(0), buried, 0).mul(SHADOW);
      const reaching = exp(
        lightPerMetre.mul(column(lampCosine, lit, GAS).add(shaded)).negate(),
      );
      /** The light on the air high overhead, which lights the air below it in turn. */
      const overhead = sqrt(sqrt(reaching));
      const apart = direction.sub(toward);
      /** The angle between ray and lamp as a chord squared: exact close to the lamp. */
      const chord = dot(apart, apart);
      const cosine = chord.mul(-0.5).add(1);
      const gasPhase = cosine.mul(cosine).add(1).mul(0.75);
      const hazePhase = float(1 - lean * lean).div(
        pow(chord.mul(lean).add((1 - lean) ** 2), 1.5),
      );
      const once = reaching
        .mul(gasOut.mul(gasPhase).add(hazeOut.mul(hazePhase).mul(HAZE_GLOW)))
        .mul(kept);
      const again = overhead.mul(skylight).mul(through.oneMinus());
      return light.mul(once.add(again));
    };
    return { through, glow: from(sun).add(from(moon)) };
  };

  /** The whole air along `direction` from the eye, lit where the ray runs lowest. */
  const along = (direction: V) => {
    const cosine = dot(direction, up);
    const lowest = max(0, lowestAlong(cosine, height));
    const rising = cosine.greaterThanEqual(0);
    const reach = max(0, radius.mul(cosine).negate());
    return scattered(
      direction,
      normalize(up.mul(radius).add(direction.mul(reach))),
      select(rising, height, lowest),
      column(cosine, height, GAS),
      column(cosine, height, HAZE),
      max(cosine, 0),
    );
  };

  /** `along`, its glow raised toward the zenith by `OVERHEAD`. */
  const dome = (direction: V) => {
    const { through, glow } = along(direction);
    const rise = max(dot(direction, up), 0);
    return {
      through,
      glow: glow.mul(rise.mul(rise).mul(OVERHEAD).add(1)),
    };
  };

  const radiance = (direction: V): V => {
    const { through, glow } = dome(direction);
    return space.mul(through).add(glow);
  };

  const aerial = (colour: V, direction: V, metres: F): V => {
    const cosine = dot(direction, up);
    /** The far end's radius squared less the eye's. */
    const gained = metres.mul(radius.mul(cosine).mul(2).add(metres));
    const far = sqrt(radius.mul(radius).add(gained));
    const farHeight = shell.add(gained).div(far.add(R));
    const farCosine = radius.mul(cosine).add(metres).div(far);
    const between = (of: Layer) =>
      max(0, column(cosine, height, of).sub(column(farCosine, farHeight, of)));
    const { through, glow } = scattered(
      direction,
      normalize(up.mul(radius).add(direction.mul(metres))),
      max(farHeight, 0),
      between(GAS),
      between(HAZE),
      float(0),
    );
    const steep = farCosine.mul(farCosine).mul(-STEEP_LOSS).add(1);
    return colour.mul(through).add(glow.mul(steep));
  };

  const view = positionWorldDirection;
  const disc = ({ toward }: Lamp): F => {
    const away = length(view.sub(toward));
    const edge = fwidth(away);
    return smoothstep(
      edge.negate().add(DISC_RADIUS),
      edge.add(DISC_RADIUS),
      away,
    ).oneMinus();
  };
  const sky = dome(view);
  const discs = sunLight
    .mul(SUN_DISC)
    .mul(disc(sun))
    .add(vec3(...MOON_DISC).mul(disc(moon)));
  const background = space.add(discs).mul(sky.through).add(sky.glow);

  return {
    radiance,
    aerial,
    background,
    update: (heavens, zenith, eyeHeight) => {
      up.value.set(...zenith);
      height.value = eyeHeight;
      radius.value = R + eyeHeight;
      shell.value = eyeHeight * (2 * R + eyeHeight);
      excess.value = airAtEye(eyeHeight).excess;
      towardSun.value.set(...heavens.sun);
      towardMoon.value.set(...heavens.moon);
      const adapted = adaptedTo(
        lightThrough(towardSun.value.dot(up.value), eyeHeight),
      );
      sunLight.value.setScalar(SUN_LIGHT * adapted);
    },
  };
}
