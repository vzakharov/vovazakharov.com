import { UNSEEN_SPREAD } from '../model/sea-state';
import { SEA_LIGHT } from './sea-light-wgsl';
import { SEA_SURFACE } from './sea-surface-wgsl';

/**
 * The sea's fragment: one pixel of water, lit. Written against the scene
 * pass's three targets — light with metres from the eye in its alpha, and
 * the two mirror targets left empty, since the sea reflects the sky map
 * itself.
 */
const SEA_FRAGMENT = /* wgsl */ `
struct SeaOut {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
}

@fragment
fn seaFragment(in: SeaVarying) -> SeaOut {
  let reach = in.world - frame.eye.xyz;
  let far = length(reach);
  let toEye = -reach / far;
  var waves = wavesAt(in.still, dpdx(in.still), dpdy(in.still));
  waves.spread += vec3f(${UNSEEN_SPREAD.toFixed(6)}, ${UNSEEN_SPREAD.toFixed(6)}, 0.0);
  let sunlit = cubeShadow(in.world);
  let seen = mirrored(waves, toEye);
  let body = upwelling(sunEntering() * sunlit + SKY_FILL);
  let colour = seen.sky
    + (1.0 - seen.share) * body
    + sunlit * glitter(waves, toEye, seen.shown);
  var out: SeaOut;
  out.light = vec4f(aerial(colour, far, -toEye), far);
  return out;
}
`;

/**
 * The sea's whole shader, after \`scene\`: the pieces the scene pass gives
 * every outdoor layer (\`frame\`, the sky, the island, the cube's shadow).
 */
export const seaShader = (scene: string, shore: string): string =>
  [
    'diagnostic(off, derivative_uniformity);',
    scene,
    shore,
    SEA_SURFACE,
    SEA_LIGHT,
    SEA_FRAGMENT,
  ].join('\n');
