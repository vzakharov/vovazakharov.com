import { attribute, clamp, lights, mix, smoothstep, vec3 } from 'three/tsl';
import {
  DirectionalLight,
  HemisphereLight,
  type Light,
  MeshLambertNodeMaterial,
  type Node,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { GROUND_STOPS, SEA_COLOUR } from '../lib/land-colour';
import { intensityFor, sunToward } from '../lib/sun';

/**
 * The sun stands low, so a gentle slope turned toward it is lit several times
 * brighter than one turned away; and it comes from the north-west — the top
 * left of a screen looking north — where light reads as raised relief rather
 * than sunken.
 */
const SUN_ELEVATION = 20;
const SUN_AZIMUTH = 315;
const SUN_COLOUR = 0xff_f2_dc;

/** What the sun lays on level land: the land's exposure, bright and unclipped on its greens. */
const LAND_IRRADIANCE = 2.7;
/** What the sun lays on the level sea, which keeps its colour at that. */
const SEA_IRRADIANCE = 1.58;

/** The sky's fill on level ground, which both materials take alike. */
const SKY_INTENSITY = 0.9;
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

export type GroundLighting = CanDispose & {
  readonly land: MeshLambertNodeMaterial;
  /** The sea over the tiles, coloured by the floor beneath it. */
  readonly sea: MeshLambertNodeMaterial;
  /** The open ocean on the globe outside the tiles, one deep colour. */
  readonly ocean: MeshLambertNodeMaterial;
  /** Every light, for the scene to hold and update. */
  readonly lights: readonly Light[];
  /** The sky's fill light, kept overhead of the eye. */
  readonly sky: HemisphereLight;
};

/**
 * The land and sea materials and the lights on them: one sun direction, laying
 * more light on the land than on the sea, and one sky. Land and tile sea are
 * coloured by the `height` vertex attribute — the ground's, and the floor's
 * under the sea; the ocean keeps the deep sea's flat colour.
 */
export function groundLighting(): GroundLighting {
  const sunward = sunToward(SUN_ELEVATION, SUN_AZIMUTH);
  const sun = (irradiance: number) => {
    const light = new DirectionalLight(
      SUN_COLOUR,
      intensityFor(irradiance, SUN_ELEVATION),
    );
    light.position.set(...sunward);
    return light;
  };
  const landSun = sun(LAND_IRRADIANCE);
  const seaSun = sun(SEA_IRRADIANCE);
  const sky = new HemisphereLight(0xc4_dc_ff, 0x40_34_2a, SKY_INTENSITY);

  const land = new MeshLambertNodeMaterial();
  land.colorNode = groundColourNode(heightNode());
  land.lightsNode = lights([landSun, sky]);
  const sea = new MeshLambertNodeMaterial();
  sea.colorNode = seaColourNode(heightNode());
  sea.lightsNode = lights([seaSun, sky]);
  const ocean = new MeshLambertNodeMaterial({ color: SEA_COLOUR });
  ocean.lightsNode = lights([seaSun, sky]);

  return {
    land,
    sea,
    ocean,
    lights: [landSun, seaSun, sky],
    sky,
    dispose: () => {
      land.dispose();
      sea.dispose();
      ocean.dispose();
    },
  };
}
