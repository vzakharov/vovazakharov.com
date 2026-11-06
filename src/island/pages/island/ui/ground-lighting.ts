import { attribute, clamp, lights, mix, vec3 } from 'three/tsl';
import {
  DirectionalLight,
  HemisphereLight,
  type Light,
  MeshLambertNodeMaterial,
  type Node,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { LAND_STOPS, SEA_COLOUR } from '../lib/land-colour';
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

/** The tile vertex attribute the land's colour is read from. */
export const HEIGHT_ATTRIBUTE = 'height';

/** The land's colour per fragment from its interpolated height, as `landColour` gives it per vertex. */
function landColourNode() {
  const height = attribute(HEIGHT_ATTRIBUTE, 'float');
  const [first, ...rest] = LAND_STOPS;
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

export type GroundLighting = CanDispose & {
  readonly land: MeshLambertNodeMaterial;
  readonly sea: MeshLambertNodeMaterial;
  /** Every light, for the scene to hold and update. */
  readonly lights: readonly Light[];
  /** The sky's fill light, kept overhead of the eye. */
  readonly sky: HemisphereLight;
};

/**
 * The land and sea materials and the lights on them: one sun direction, laying
 * more light on the land than on the sea, and one sky. The land is coloured by
 * the `height` vertex attribute; the sea keeps a flat colour.
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
  const sky = new HemisphereLight(0xc4_dc_ff, 0x40_34_2a, 0.9);

  const land = new MeshLambertNodeMaterial();
  land.colorNode = landColourNode();
  land.lightsNode = lights([landSun, sky]);
  const sea = new MeshLambertNodeMaterial({ color: SEA_COLOUR });
  sea.lightsNode = lights([seaSun, sky]);

  return {
    land,
    sea,
    lights: [landSun, seaSun, sky],
    sky,
    dispose: () => {
      land.dispose();
      sea.dispose();
    },
  };
}
