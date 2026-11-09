import {
  attribute,
  cameraFar,
  cameraNear,
  clamp,
  lights,
  mix,
  positionView,
  smoothstep,
  varying,
  vec3,
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

import type { Vec3 } from '@/island/shared/globe';

import { daylight, type Heavens, SUN_ELEVATION } from '../lib/day';
import { GROUND_STOPS, SEA_COLOUR } from '../lib/land-colour';
import { intensityFor } from '../lib/sun';

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

/** A tile's land material, and its sea's over the floor beneath it. */
export type TileMaterials<M extends Material = Material> = {
  readonly land: M;
  readonly sea: M;
};

/** Tile materials, and those a stand-in cut around finer tiles draws in, behind them where the two overlap. */
export type StandInMaterials<M extends Material = Material> =
  TileMaterials<M> & { readonly standIn: TileMaterials<M> };

export type GroundLighting = CanDispose &
  StandInMaterials<MeshLambertNodeMaterial> & {
    /** The open ocean on the globe outside the tiles, one deep colour. */
    readonly ocean: MeshLambertNodeMaterial;
    /** Every light, for the scene to hold and update. */
    readonly lights: readonly Light[];
    /**
     * Turns the sun and moon to `heavens`, keeps the sky's fill overhead of the
     * eye at direction `up` and dims it with the night there; returns the
     * daylight under the eye, 1 by day and 0 by night.
     */
    readonly shine: (heavens: Heavens, up: Vec3) => number;
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
 * sky. Land and tile sea are
 * coloured by the `height` vertex attribute — the ground's, and the floor's
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

  const tileMaterial = (colour: Node<'vec3'>, shone: Light[], push: number) => {
    const material = new MeshLambertNodeMaterial();
    material.colorNode = colour;
    material.depthNode = depthNode(push);
    material.lightsNode = lights(shone);
    return material;
  };
  const landColour = groundColourNode(heightNode());
  const seaColour = seaColourNode(heightNode());
  const land = tileMaterial(landColour, [landSun, landMoon, sky], 0);
  const sea = tileMaterial(seaColour, [seaSun, seaMoon, sky], 0);
  const standIn = {
    land: tileMaterial(landColour, [landSun, landMoon, sky], STAND_IN_PUSH),
    sea: tileMaterial(seaColour, [seaSun, seaMoon, sky], STAND_IN_PUSH),
  };
  const ocean = new MeshLambertNodeMaterial({ color: SEA_COLOUR });
  ocean.lightsNode = lights([seaSun, seaMoon, sky]);

  return {
    land,
    sea,
    standIn,
    ocean,
    lights: [landSun, seaSun, landMoon, seaMoon, sky],
    shine: (heavens, up) => {
      for (const light of [landSun, seaSun]) light.position.set(...heavens.sun);
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
      for (const material of [land, sea, standIn.land, standIn.sea, ocean]) {
        material.dispose();
      }
    },
  };
}
