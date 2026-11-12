import { f32, wgsl } from '../lib/wgsl';
import { AERIAL, CUBE_SHADOW } from '../outside';
import { SEA_FOAM } from './sea-foam-wgsl';
import { SEA_LIGHT } from './sea-light-wgsl';
import { UNSEEN_SPREAD } from './sea-state';
import { SEA_SURFACE } from './sea-surface-wgsl';

/** Water deeper than this, metres, shows none of its bed. */
const BED_SHOWS = 24;
/** The cosine of the sun's rays to the vertical once they are in the water. */
const SUN_SINKS = 0.67;

/**
 * The sea's fragment: one pixel of water, lit. It writes the scene pass's
 * three targets — light with metres from the eye in its alpha, the two
 * mirror targets empty, since the sea reflects the sky map itself — and its
 * own depth, so the swash's thin sheet lies over the sand's mesh.
 */
export const SEA = wgsl(
  'sea',
  /* wgsl */ `
struct SeaOut {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
  @builtin(frag_depth) depth: f32,
}

/// What foam returns of the light on it.
const FOAM = 0.8;
/// What water full of bubbles returns, of the light a white face would show.
const AERATED = vec3f(0.1, 0.24, 0.22);
/// What a crest a metre thick lets through of the sun behind it.
const CREST_GLOW = vec3f(0.01, 0.1, 0.085);

/// Wet sand under water, until the sand's own colour is read here.
const SEA_BED = vec3f(0.36, 0.29, 0.2);

/// Where a ray entering water \`column\` metres deep at \`start\` meets the bed.
fn bedUnder(start: vec3f, ray: vec3f, column: f32) -> vec3f {
  let sinks = max(-ray.y, 0.2);
  var reach = column / sinks;
  for (var i = 0; i < 3; i++) {
    let at = start + ray * reach;
    reach = max(reach + (at.y - islandHeight(at.xz)) / sinks, 0.0);
  }
  return start + ray * reach;
}

@fragment
fn seaFragment(in: SeaVarying) -> SeaOut {
  let across = dpdx(in.still);
  let down = dpdy(in.still);
  let reach = in.world - frame.eye.xyz;
  let far = length(reach);
  let toEye = -reach / far;

  var shore: Shore;
  shore.bed = -${f32(BED_SHOWS)};
  if (offshore(in.still) < 1.0) {
    shore = shoreAt(in.still);
  }
  let column = shore.level - shore.bed;
  if (column < 0.002) {
    discard;
  }

  var waves = wavesAt(in.still, across, down);
  waves.slope += in.swell;
  waves.spread += vec3f(${f32(UNSEEN_SPREAD)}, ${f32(UNSEEN_SPREAD)}, 0.0);
  let normal = normalize(vec3f(-waves.slope.x, 1.0, -waves.slope.y));
  let sunlit = cubeShadow(in.world);
  let seen = mirrored(waves, toEye);

  let falling = sunEntering() * sunlit + SKY_FILL;
  var under = upwelling(falling);
  if (column < ${f32(BED_SHOWS)}) {
    let bed = bedUnder(in.world, refract(-toEye, normal, 0.75), column);
    let through = length(bed - in.world);
    let over = max(shore.level - bed.y, 0.0);
    let lit = SEA_BED * (
      sunEntering() * cubeShadow(bed) * kept(over / ${f32(SUN_SINKS)})
        + SKY_FILL * kept(over)
    );
    let shows = smoothstep(${f32(BED_SHOWS)}, ${f32(0.5 * BED_SHOWS)}, column);
    under = mix(
      under,
      lit * kept(through) + under * (vec3f(1.0) - kept(1.5 * through)),
      shows,
    );
  }

  under = mix(under, AERATED * falling, 0.7 * bubbles(shore));
  // Light through a crest that stands between the eye and the sun.
  let against = max(dot(toEye, -frame.sun.xyz), 0.0);
  under += sunlit * SUN_LIGHT * CREST_GLOW
    * smoothstep(0.05, 0.5, in.world.y) * against * against * against;

  let water = seen.sky
    + (1.0 - seen.share) * under
    + sunlit * glitter(waves, toEye, seen.shown);
  let white = FOAM * (
    SUN_LIGHT * sunlit * (0.3 + 0.7 * max(dot(normal, frame.sun.xyz), 0.0))
      + SKY_FILL
  );
  let foam = lace(in.still, foamThickness(shore, waves.squeeze));
  let colour = mix(water, white, foam);

  var out: SeaOut;
  out.light = vec4f(aerial(colour, -toEye, far), far);
  let ashore = smoothstep(-0.6, -0.2, shore.bed);
  out.depth = mix(in.clip.z, in.lifted.x / in.lifted.y, ashore);
  return out;
}
`,
  SEA_SURFACE,
  SEA_LIGHT,
  SEA_FOAM,
  AERIAL,
  CUBE_SHADOW,
);
