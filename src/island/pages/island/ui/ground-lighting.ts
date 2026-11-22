import {
  attribute,
  cameraFar,
  cameraNear,
  clamp,
  float,
  length,
  lights,
  mix,
  normalize,
  output,
  positionView,
  positionWorld,
  smoothstep,
  varying,
  vec3,
  vec4,
  viewZToLogarithmicDepth,
} from 'three/tsl';
import {
  Color,
  DirectionalLight,
  HemisphereLight,
  InterpolationSamplingMode,
  InterpolationSamplingType,
  type Light,
  type Material,
  MeshLambertNodeMaterial,
  type Node,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { dot, R, type Vec3 } from '@/island/shared/globe';
import { isFine, type Look } from '@/island/shared/play';

import { lightThrough, tintOf } from '../lib/air';
import { daylight, type Heavens, SUN_ELEVATION } from '../lib/day';
import { GROUND_STOPS, SEA_COLOUR } from '../lib/land-colour';
import { eyeKeeps, intensityFor } from '../lib/sun';
import { landSurface } from './land-surface';
import { type SeaFrame, seaSurface } from './sea-surface';
import { type Aired, type Backed, skyNodes } from './sky-nodes';
import type { Clouded } from './swift-clouds';

const SUN_COLOUR = 0xff_f2_dc;
/** Moonlight, cool against the sun's warm white. */
const MOON_COLOUR = 0xb4_c4_e8;
/**
 * The full moon's share of what the opening's sun lays on level ground, each
 * material's alike, so the waterline keeps its match by night.
 */
const MOON_SHARE = 0.1;

/** What the sun lays on level land: the land's exposure, bright and unclipped on its greens. */
const LAND_IRRADIANCE = 2.7;
/** What the sun lays on the level sea, which keeps its colour at that. */
const SEA_IRRADIANCE = 1.58;

/** The sky's fill on level ground by day, which both materials take alike. */
const SKY_INTENSITY = 0.9;
/**
 * The sky's fill by night, in a moonlit blue: with the moon, level ground at
 * midnight keeps about a quarter of its day light — dim, cool and readable,
 * never black.
 */
const NIGHT_SKY_INTENSITY = 0.35;
const SKY_COLOUR = 0xc4_dc_ff;
const NIGHT_SKY_COLOUR = 0x60_70_a0;
/**
 * How much brighter level land is lit than the level sea. The sea's colour is
 * raised by it at the waterline, where it meets the land's, so the two lit
 * colours agree there and the coastline draws with no step.
 */
const WATERLINE_LIFT =
  (LAND_IRRADIANCE + SKY_INTENSITY) / (SEA_IRRADIANCE + SKY_INTENSITY);
/** The depth over which the sea's colour rises to the land's at the waterline, metres. */
const WATERLINE_DEPTH = 6;

/** The tile vertex attribute the ground's colour is read from. */
export const HEIGHT_ATTRIBUTE = 'height';

const heightNode = () => attribute(HEIGHT_ATTRIBUTE, 'float');

/**
 * The tiles' logarithmic depth, from a view depth sampled at the centroid of
 * the covered MSAA samples. A depth the shader writes is one value for every
 * sample a fragment covers; taken at the pixel centre, a skirt's would be
 * extrapolated past its thin triangle to above the neighbour's surface it
 * hangs under, and win samples along the shared edge. `push` moves it that
 * share of the view depth farther.
 */
const depthNode = (push = 0) =>
  viewZToLogarithmicDepth(
    varying(positionView.z, 'v_tileViewZ')
      .setInterpolation(
        InterpolationSamplingType.PERSPECTIVE,
        InterpolationSamplingMode.CENTROID,
      )
      .mul(1 + push),
    cameraNear,
    cameraFar,
  );

/**
 * How much farther a stand-in's depth is drawn than it lies, as a share of the
 * view depth: enough that the finer tiles it is cut around win where the two
 * overlap, little enough that it still hides ground beyond it.
 */
const STAND_IN_PUSH = 0.03;

/** The ground's colour per fragment, `GROUND_STOPS` blended by its interpolated height. */
function groundColourNode(height: Node<'float'>) {
  const [first, ...rest] = GROUND_STOPS;
  if (first === undefined) throw new RangeError('no colour stops');
  let colour: Node<'vec3'> = vec3(...first[1]);
  let below = first[0];
  for (const [level, rgb] of rest) {
    const t = clamp(height.sub(below).div(level - below), 0, 1);
    colour = mix(colour, vec3(...rgb), t);
    below = level;
  }
  return colour;
}

/** The sea's colour over a floor at `height`: the ground's, lifted toward the land's light at the waterline. */
function seaColourNode(height: Node<'float'>) {
  const shore = smoothstep(-WATERLINE_DEPTH, 0, height);
  return groundColourNode(height).mul(mix(1, WATERLINE_LIFT, shore));
}

/**
 * A material's lit colour as it arrives through `sky`'s air. The camera sits
 * at the world's origin, so a fragment's world position is its offset from
 * the eye.
 */
const throughAir = (air: Aired) =>
  vec4(
    air.aerial(output.rgb, normalize(positionWorld), length(positionWorld)),
    output.a,
  );

/** A look's air, and what it makes of a fragment. */
const wear = (aired: Aired) => ({ aired, seen: throughAir(aired) });

/** A tile's land material, and its sea's over the floor beneath it. */
type TileMaterials<M extends Material = Material> = {
  readonly land: M;
  readonly sea: M;
};

/** Tile materials, and those a stand-in cut around finer tiles draws in, behind them where the two overlap. */
export type StandInMaterials<M extends Material = Material> =
  TileMaterials<M> & { readonly standIn: TileMaterials<M> };

export type GroundLighting = CanDispose &
  Clouded &
  StandInMaterials<MeshLambertNodeMaterial> & {
    /** The open ocean on the globe outside the tiles, one deep colour. */
    readonly ocean: MeshLambertNodeMaterial;
    /** Every light, for the scene to hold and update. */
    readonly lights: readonly Light[];
    /**
     * Turns the sun, the moon and, in the fine look, the air's light to
     * `heavens`, for an eye `height` metres up at direction `up`: the sky's
     * fill stays overhead of it and dims with the night there. Returns the
     * daylight under the eye, 1 by day and 0 by night.
     */
    readonly shine: (
      heavens: Heavens,
      up: Vec3,
      height: number,
      seconds: number,
    ) => number;
    /**
     * Dresses every material in `look`: the fine one — the air, its clouds and
     * haze, the land's surface down to its grain, and with `rippled` the sea
     * as a surface (WebGPU only) — the swift one, the same with the clouds
     * read from `clouds`' buffer and the land without what only tells
     * underfoot, or the plain one: the land's broad colours
     * and the sea's flat one under the lamps. The first dressing in a look
     * compiles its shaders. Returns the background the look draws behind
     * everything, none for plain.
     */
    readonly dress: (
      look: Look,
      rippled: boolean,
    ) => Backed['background'] | null;
    /** Hands the rippled sea its frame. */
    readonly stirSea: (frame: SeaFrame) => void;
    /** Dresses `material`, an object standing on the land, in the land's lamps and the fine look's air. */
    readonly dressObject: (material: MeshLambertNodeMaterial) => void;
  };

/** A sun laying `irradiance` on level ground under the opening's sun. */
const sun = (irradiance: number) =>
  new DirectionalLight(SUN_COLOUR, intensityFor(irradiance, SUN_ELEVATION));

/** The full moon over ground the sun lays `irradiance` on. */
const moon = (irradiance: number) =>
  new DirectionalLight(MOON_COLOUR, irradiance * MOON_SHARE);

/**
 * The land and sea materials and the lights on them: one sun direction, laying
 * more light on the land than on the sea, the full moon opposite it, and one
 * sky. Land and tile sea are coloured by the `height` vertex attribute — the ground's, and the floor's
 * under the sea; the ocean keeps the deep sea's flat colour.
 */
export function groundLighting(): GroundLighting {
  const landSun = sun(LAND_IRRADIANCE);
  const seaSun = sun(SEA_IRRADIANCE);
  const landMoon = moon(LAND_IRRADIANCE);
  const seaMoon = moon(SEA_IRRADIANCE);
  const sky = new HemisphereLight(SKY_COLOUR, 0x40_34_2a, SKY_INTENSITY);
  const dayColour = new Color(SKY_COLOUR);
  const nightColour = new Color(NIGHT_SKY_COLOUR);
  const sunColour = new Color(SUN_COLOUR);
  const air = skyNodes();
  const { radiance, clouds, fine: fineAir, swift: swiftAir, update } = air;
  const worn = { fine: wear(fineAir), swift: wear(swiftAir) } as const;
  /** The current look's air and what it makes of a fragment; none in plain. */
  let wearing: ReturnType<typeof wear> | null = null;
  /** What `dressObject` has dressed, to dress again in each look. */
  const objects: MeshLambertNodeMaterial[] = [];

  const tileMaterial = (shone: Light[], push: number) => {
    const material = new MeshLambertNodeMaterial();
    material.depthNode = depthNode(push);
    material.lightsNode = lights(shone);
    return material;
  };
  const surface = seaSurface(radiance);
  const groundColour = groundColourNode(heightNode());
  const ground = landSurface(heightNode(), groundColour);
  const seaColour = seaColourNode(heightNode());
  const land = tileMaterial([landSun, landMoon, sky], 0);
  const sea = tileMaterial([seaSun, seaMoon, sky], 0);
  const standIn = {
    land: tileMaterial([landSun, landMoon, sky], STAND_IN_PUSH),
    sea: tileMaterial([seaSun, seaMoon, sky], STAND_IN_PUSH),
  };
  const ocean = new MeshLambertNodeMaterial({ color: SEA_COLOUR });
  ocean.lightsNode = lights([seaSun, seaMoon, sky]);
  const lands = [land, standIn.land];
  const seas = [sea, standIn.sea];
  const all = [...lands, ...seas, ocean];

  const [deepest] = GROUND_STOPS;
  if (deepest === undefined) throw new RangeError('no colour stops');

  /** Draws the sea as a surface — ripples, the sky in them, the sun's glint — in place of its flat colour. */
  const ripple = (seen: Node<'vec4'>, swift: boolean) => {
    const surfaced: Array<[MeshLambertNodeMaterial, Node]> = [
      [sea, surface.colour(heightNode(), groundColour, { swift })],
      [standIn.sea, surface.colour(heightNode(), groundColour, { swift })],
      [
        ocean,
        surface.colour(float(deepest[0]), vec3(...deepest[1]), {
          wide: true,
          swift,
        }),
      ],
    ];
    for (const material of seas) {
      material.positionNode = surface.lifted(heightNode());
      material.maskNode = surface.lies(heightNode());
    }
    for (const material of lands) {
      // Damp over the air: a sheet's reach is too near for the air to tell.
      material.outputNode = surface.damp(seen, heightNode());
    }
    for (const [material, colour] of surfaced) {
      // The surface carries its own light: nothing is left for the lamps.
      material.colorNode = vec3(0);
      material.emissiveNode = colour;
    }
  };

  let fine = false;
  const dress = (look: Look, rippled: boolean) => {
    fine = isFine(look);
    wearing = look === 'plain' ? null : worn[look];
    const seen = wearing?.seen ?? null;
    for (const material of objects) {
      material.outputNode = seen;
      material.needsUpdate = true;
    }
    for (const material of all) {
      material.positionNode = null;
      material.maskNode = null;
      material.normalNode = null;
      material.emissiveNode = null;
      material.outputNode = seen;
      material.needsUpdate = true;
    }
    const dressing = ground[look];
    for (const material of lands) {
      material.colorNode = dressing.colour;
      material.normalNode = dressing.normal;
    }
    for (const material of seas) material.colorNode = seaColour;
    ocean.colorNode = null;
    if (wearing === null) return null;
    if (rippled) ripple(wearing.seen, look === 'swift');
    clouds.forget();
    return wearing.aired.background;
  };
  dress('plain', false);

  return {
    land,
    sea,
    standIn,
    ocean,
    dress,
    clouds,
    stirSea: surface.update,
    dressObject: (material) => {
      material.lightsNode = lights([landSun, landMoon, sky]);
      material.outputNode = wearing?.seen ?? null;
      objects.push(material);
    },
    lights: [landSun, seaSun, landMoon, seaMoon, sky],
    shine: (heavens, up, height, seconds) => {
      if (fine) update(heavens, up, height, seconds);
      const radius = R + height;
      ground.update([up[0] * radius, up[1] * radius, up[2] * radius]);
      // The sun's colour after the air it crossed to the eye, in either look:
      // warm when low, out once set, so no slope facing a sun below the
      // horizon is lit.
      const sine = dot(heavens.sun, up);
      const warmth = tintOf(lightThrough(sine, height));
      const kept = eyeKeeps(sine, SUN_ELEVATION);
      for (const light of [landSun, seaSun]) {
        light.position.set(...heavens.sun);
        light.color
          .setRGB(...warmth)
          .multiply(sunColour)
          .multiplyScalar(kept);
      }
      for (const light of [landMoon, seaMoon]) {
        light.position.set(...heavens.moon);
      }
      const day = daylight(heavens.sun, up);
      sky.position.set(...up);
      sky.intensity =
        NIGHT_SKY_INTENSITY + (SKY_INTENSITY - NIGHT_SKY_INTENSITY) * day;
      sky.color.lerpColors(nightColour, dayColour, day);
      return day;
    },
    dispose: () => {
      for (const material of all) material.dispose();
      clouds.dispose();
    },
  };
}
