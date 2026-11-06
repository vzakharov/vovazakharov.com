import {
  attribute,
  cameraFar,
  cameraNear,
  clamp,
  color,
  fwidth,
  lights,
  logarithmicDepthToViewZ,
  materialColor,
  max,
  mix,
  positionView,
  smoothstep,
  vec3,
  viewportDepthTexture,
} from 'three/tsl';
import {
  DirectionalLight,
  HemisphereLight,
  type Light,
  MeshLambertNodeMaterial,
  type Node,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import {
  LAND_STOPS,
  SEA_COLOUR,
  SHALLOW_COLOUR,
  SHALLOW_THICKEST,
  SHALLOW_THINNEST,
} from '../lib/land-colour';
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

/** The land's colour per fragment, `LAND_STOPS` blended by its interpolated height. */
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

/** Pixels of water thickness over which the sea fades in at the shore. */
const EDGE_PIXELS = 1.5;
/** Pixels of water thickness the shallow band spans, before its clamp. */
const SHALLOW_PIXELS = 3;

/**
 * The sea's surface by the water under it. Its fragments read the opaque
 * scene's depth behind them, so the sea must draw after the land — it is
 * `transparent` for that — and a sea mesh must stay out of that depth.
 * Water thickness along the ray fades the sea in over a pixel and a half,
 * an edge antialiased at any height, and lightens it to the shallows'
 * colour over a few pixels more. Where nothing opaque lies behind, the
 * thickness reads as the far plane's: open water, the sea's own colour.
 */
function seaSurface(sea: MeshLambertNodeMaterial): void {
  const behind = logarithmicDepthToViewZ(
    viewportDepthTexture().x,
    cameraNear,
    cameraFar,
  );
  const ray = positionView.length().div(positionView.z.negate());
  const thickness = max(0, positionView.z.sub(behind).mul(ray));
  const pixel = fwidth(thickness);
  const band = clamp(
    pixel.mul(SHALLOW_PIXELS),
    SHALLOW_THINNEST,
    SHALLOW_THICKEST,
  );
  sea.transparent = true;
  sea.opacityNode = smoothstep(0, pixel.mul(EDGE_PIXELS), thickness);
  sea.colorNode = mix(
    color(SHALLOW_COLOUR),
    materialColor,
    smoothstep(0, band, thickness),
  );
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
 * the `height` vertex attribute; the sea by the water under it (`seaSurface`).
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
  seaSurface(sea);

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
