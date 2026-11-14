// The sky behind everything: `skyTarget`, the target the sky's cloud shader
// drew, and the sun's disc where the clouds let it through — the one thing
// in the sky too sharp for the smaller target.
//
// Under the horizon the backdrop shows only where no surface stands in the
// way: past the far plane, or along a ray that is already in the water or
// meets the still sea short of it without crossing a surface — an eye under
// a crest or under the sea. That ray runs on through water, so the backdrop
// is the water's body, seen through the air between the eye and the still
// sea.

import package::cube::widgets::outdoors::stage::lib::outdoor_frame::frame;
import package::cube::widgets::outdoors::stage::lib::outdoor_stage::{Scene, lit, rayThrough};
import package::cube::widgets::outdoors::stage::lib::stage_numbers::SKY_METRES;
import package::cube::widgets::outdoors::stage::lib::water_body::drownedBody;
import package::cube::widgets::outdoors::stage::lib::clear_sky::airThrough;
import super::sky_shader_numbers::FAR_METRES;
import package::cube::widgets::outdoors::stage::lib::sun_glow::sunDisc;

@group(1) @binding(0) var skyTarget: texture_2d<f32>;
@group(1) @binding(1) var skySampler: sampler;

@fragment
fn fragmentMain(@builtin(position) position: vec4f) -> Scene {
  let dir = rayThrough(position.xy);
  let edge = length(fwidth(dir));
  let sky =
    textureSampleLevel(
      skyTarget,
      skySampler,
      position.xy / frame.clock.zw,
      0.0,
    );
  if (dir.y < 0.0) {
    let wets = max(frame.eye.y, 0.0) / -dir.y;
    if (wets < FAR_METRES) {
      let air = airThrough(wets);
      return
        lit(drownedBody() * air + sky.rgb * (vec3f(1.0) - air), SKY_METRES);
    }
  }
  return lit(sky.rgb + sunDisc(dir, edge) * sky.a, SKY_METRES);
}
