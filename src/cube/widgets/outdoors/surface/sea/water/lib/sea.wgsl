// The sea's fragment: one pixel of water, lit. It writes the scene pass's
// three targets — light with metres from the eye in its alpha, the two
// mirror targets empty, since the sea reflects the sky map itself — and its
// own depth, so the swash's thin sheet lies over the sand's mesh.

import package::cube::widgets::outdoors::stage::lib::aerial::aerial;
import package::cube::widgets::outdoors::stage::lib::cube_shadow::cubeShadow;
import package::cube::entities::island::land::model::island_height::islandHeight;
import package::cube::widgets::outdoors::stage::lib::outdoor_frame::frame;
import package::cube::widgets::outdoors::stage::lib::sky::skyRadiance;
import package::cube::widgets::outdoors::stage::lib::stage_numbers::SKY_METRES;
import package::cube::shared::outside::sun::{SUN_LIGHT, SKY_FILL, HORIZON_FILL};
import package::cube::widgets::outdoors::surface::beach::lib::sand_colour::sandBed;
import package::cube::shared::shader::hash::fbm;
import super::sea_foam::{lace, foamThickness, bubbles};
import super::sea_light::{mirrored, glitter, upwelling};
import super::sea_numbers::UNSEEN_SPREAD;
import super::sea_shore::{Shore, offshore, calm, calmOver, shoreAt};
import super::sea_surface::{SeaVarying, waveSampler, slopeMap, wavesAt};
import super::sea_surface_numbers::WAVE_TILE;
import package::cube::widgets::outdoors::surface::sea::state::lib::sea_tables::{CASCADES, SIDES};
import package::cube::widgets::outdoors::stage::lib::water_body::{DROWNED, fresnel, kept, sunEntering};

/// Water deeper than this, metres, shows none of its bed.
const BED_SHOWS = 24.0;
/// The cosine of the sun's rays to the vertical once they are in the water.
const SUN_SINKS = 0.67;
/// How strongly a ripple's curve brightens the bed under it.
const CAUSTIC = 4.0;
/// The depth, metres, over which the bed's light pattern fades by 1/e.
const CAUSTIC_FADES = 3.0;
/// The width a ray is blurred over on the bed, per metre of water above.
const CAUSTIC_BLUR = 0.12;
/// What foam returns of the light on it.
const FOAM = 0.8;
/// How much of the sky's light on foam is the horizon's: foam stands in
/// lumps, whose flanks face the horizon and not the zenith.
const FOAM_FLANKS = 0.4;
/// What water full of bubbles returns, of the light a white face would show.
const AERATED = vec3f(0.1, 0.24, 0.22);
/// What a crest a metre thick lets through of the sun behind it.
const CREST_GLOW = vec3f(0.01, 0.1, 0.085);

struct SeaOut {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
  @builtin(frag_depth) depth: f32,
}

/// Where a ray entering water `column` metres deep at `start` meets the bed.
fn bedUnder(start: vec3f, ray: vec3f, column: f32) -> vec3f {
  let sinks = max(-ray.y, 0.2);
  var reach = column / sinks;
  for (var i = 0; i < 3; i++) {
    let at = start + ray * reach;
    reach = max(reach + (at.y - islandHeight(at.xz)) / sinks, 0.0);
  }
  return start + ray * reach;
}

/// How the ripples over `xz` gather the sun on a bed `over` metres under
/// them, about 1: a crest is a lens, and the deeper the bed the wider the
/// ripples whose light comes to a line on it, until they all blur together.
fn gathered(xz: vec2f, over: f32) -> f32 {
  let quiet = calm(xz);
  var bent = 0.0;
  for (var i = 2u; i < CASCADES; i++) {
    let lod = max(log2(over * (WAVE_TILE * CAUSTIC_BLUR) / SIDES[i]), 0.0);
    let curve =
      textureSampleLevel(slopeMap, waveSampler, xz / SIDES[i], i, lod).zw;
    bent -= quiet[i] * (curve.x + curve.y);
  }
  let strength =
    CAUSTIC * smoothstep(0.0, 0.3, over) * exp(-over / CAUSTIC_FADES);
  return exp(clamp(strength * bent, -1.0, 1.4));
}

/// One pixel of the sea, lit, from above or from under it.
@fragment
fn seaFragment(in: SeaVarying, @builtin(front_facing) above: bool) -> SeaOut {
  let across = dpdx(in.still);
  let down = dpdy(in.still);
  let reach = in.world - frame.eye.xyz;
  let far = length(reach);
  let toEye = -reach / far;

  var shore: Shore;
  shore.bed = -BED_SHOWS;
  let off = offshore(in.still);
  if (off < 1.0) {
    shore = shoreAt(in.still);
  }
  let column = shore.level - shore.bed;
  if (column < 0.002) {
    discard;
  }

  // The ripples a pixel shows ride the water that is there at this moment,
  // a swash sheet included; the mesh keeps to the still depth.
  var quiet = vec4f(1.0);
  if (off < 1.0) {
    quiet = calmOver(off, column);
  }
  var waves = wavesAt(in.still, across, down, quiet);
  waves.slope += in.swell;
  waves.spread += vec3f(UNSEEN_SPREAD, UNSEEN_SPREAD, 0.0);
  let normal = normalize(vec3f(-waves.slope.x, 1.0, -waves.slope.y));
  let sunlit = cubeShadow(in.world);
  let seen = mirrored(waves, toEye);

  let falling = sunEntering() * sunlit + SKY_FILL;
  var under = upwelling(falling);
  if (column < BED_SHOWS) {
    let bed = bedUnder(in.world, refract(-toEye, normal, 0.75), column);
    let through = length(bed - in.world);
    let over = max(shore.level - bed.y, 0.0);
    // The sky is too wide a lamp to come to a line, but its brighter half
    // still gathers a little.
    let gather = gathered(bed.xz, over);
    let lit =
      sandBed(bed.xz, over) * (sunEntering()
        * cubeShadow(bed)
        * kept(over / SUN_SINKS)
        * gather + SKY_FILL * kept(over) * mix(1.0, gather, 0.3));
    let shows = smoothstep(BED_SHOWS, 0.5 * BED_SHOWS, column);
    under =
      mix(
        under,
        lit * kept(through) + under * (vec3f(1.0) - kept(1.5 * through)),
        shows,
      );
  }

  under = mix(under, AERATED * falling, 0.7 * bubbles(shore));
  // Light through a crest that stands between the eye and the sun.
  let against = max(dot(toEye, -frame.sun.xyz), 0.0);
  under +=
    sunlit
      * SUN_LIGHT
      * CREST_GLOW
      * smoothstep(0.05, 0.5, in.world.y)
      * against
      * against
      * against;

  if (!above && frame.eye.y < in.world.y) {
    // The surface from under it: the sky through the window overhead, and
    // round that the water's own body mirrored back down.
    var body = DROWNED * falling;
    let out = refract(-toEye, -normal, 1.333);
    if (dot(out, out) > 0.0) {
      body =
        mix(body, skyRadiance(out, 2.0), 1.0 - fresnel(dot(toEye, -normal)));
    }
    var drowned: SeaOut;
    drowned.light = vec4f(body, min(far, SKY_METRES));
    drowned.depth = in.clip.z;
    return drowned;
  }

  let water =
    seen.sky
      + (1.0 - seen.share) * under
      + sunlit * glitter(waves, toEye, seen.shown);
  // A roller is filtered by the pixel's longer side; the lace by the mean
  // of its two, since a glancing pixel is long one way only.
  let pixel = max(length(across), length(down));
  let thick = foamThickness(in.still, shore, waves.squeeze, pixel);
  // Churning foam stands in lumps, each shading the next from a low sun.
  let lumps = smoothstep(0.3, 0.7, fbm(in.still * 2.3, 43u, 4));
  let heaped = mix(1.0, mix(0.5, 1.08, lumps), smoothstep(0.9, 1.3, thick));
  let white =
    FOAM * (SUN_LIGHT
      * sunlit
      * heaped
      * (0.3 + 0.7 * max(dot(normal, frame.sun.xyz), 0.0)) + mix(
      SKY_FILL,
      HORIZON_FILL,
      FOAM_FLANKS,
    ));
  let foam = lace(in.still, thick, shore, sqrt(length(across) * length(down)));
  // Thin foam is a film the water shows through; churning foam is white.
  let froth = 0.78 + 0.3 * fbm(in.still * 6.0, 41u, 3);
  let colour = mix(water, white * froth * mix(0.8, 1.0, min(thick, 1.0)), foam);

  var out: SeaOut;
  out.light = vec4f(aerial(colour, -toEye, far), min(far, SKY_METRES));
  let ashore = smoothstep(-0.6, -0.2, shore.bed);
  out.depth = mix(in.clip.z, in.lifted.x / in.lifted.y, ashore);
  return out;
}
