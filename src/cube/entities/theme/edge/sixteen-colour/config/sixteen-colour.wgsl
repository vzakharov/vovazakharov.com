// `sixteen-colour.ts` adds this floor's lamps and light: `lamps()` and
// `themeLight`.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, matte, polished, glowing, embossed, Lens};
import package::cube::shared::shader::hash::fbm;
import package::cube::entities::theme::edge::pattern::lib::pattern::bonded;
import package::cube::entities::theme::edge::screen::lib::screen::bayer;
import package::cube::entities::theme::kit::lib::finish::{band, tiling};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;
import package::cube::entities::theme::kit::lib::grade::tonemap;
import package::cube::entities::theme::kit::lib::scene::{sceneAt, glowAt};

const CARD =
  array<vec3f, 16>(
    vec3f(0.0, 0.0, 0.0),
    vec3f(0.0, 0.0, 0.667),
    vec3f(0.0, 0.667, 0.0),
    vec3f(0.0, 0.667, 0.667),
    vec3f(0.667, 0.0, 0.0),
    vec3f(0.667, 0.0, 0.667),
    vec3f(0.667, 0.333, 0.0),
    vec3f(0.667, 0.667, 0.667),
    vec3f(0.333, 0.333, 0.333),
    vec3f(0.333, 0.333, 1.0),
    vec3f(0.333, 1.0, 0.333),
    vec3f(0.333, 1.0, 1.0),
    vec3f(1.0, 0.333, 0.333),
    vec3f(1.0, 0.333, 1.0),
    vec3f(1.0, 1.0, 0.333),
    vec3f(1.0, 1.0, 1.0),
  );

/// Dressed stone in courses: x the block's own number, y 1 on its face
/// and 0 in the joint.
fn ashlar(s: Surf) -> vec2f {
  let block = bonded(s.uv, vec2f(0.92, 0.46), 81u);
  return vec2f(block.x, smoothstep(0.012, 0.03, block.y));
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let block = ashlar(s);
      let rough = fbm(s.uv * 6.0, 82u, 4);
      let stone =
        vec3f(0.1, 0.22, 0.75) * (0.6 + 0.6 * block.x) * (0.7 + 0.6 * rough);
      let moss =
        smoothstep(0.55, 0.75, fbm(s.uv * 1.6, s.seed, 3)) * (1.0 - smoothstep(
          0.2,
          1.3,
          s.p.y,
        ));
      let face = mix(stone, vec3f(0.03, 0.2, 0.05), moss);
      return
        embossed(
          s,
          matte(mix(vec3f(0.01, 0.012, 0.03), face, block.y)),
          block.y + 0.4 * rough,
          0.02,
        );
    }
    case FLOOR, OWNED: {
      let tile = tiling(s.uv, 0.625, 0.02, 83u);
      let at = vec2i(floor(s.uv / 0.625));
      let red = vec3f(0.36, 0.05, 0.03);
      let buff = vec3f(0.42, 0.26, 0.09);
      let worn = 0.7 + 0.5 * fbm(s.uv * 3.0, 84u, 3);
      let colour = mix(red, buff, f32((at.x + at.y) & 1)) * worn;
      return
        embossed(
          s,
          polished(colour * mix(0.2, 1.0, tile.x), 0.3),
          tile.x,
          0.006,
        );
    }
    case CEILING: {
      let beam = band(fract(s.uv.x / 1.25) * 1.25, 0.625, 0.22);
      let wood =
        vec3f(0.1, 0.05, 0.02) * (0.6 + 0.7 * fbm(
          vec2f(s.uv.x * 30.0, s.uv.y),
          85u,
          3,
        ));
      let m =
        glowing(
          mix(vec3f(0.14, 0.14, 0.16), wood * 3.0, beam),
          lampGlow(s, lamps()),
        );
      return embossed(s, m, beam, 0.05);
    }
    case TRIM: {
      return
        matte(vec3f(0.25, 0.25, 0.27) * (0.7 + 0.5 * fbm(s.uv * 8.0, 86u, 3)));
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLens(l: Lens) -> vec3f {
  // Three hundred and twenty dots across, whatever the screen.
  let side = l.size.x / 320.0;
  let cell = floor(l.pixel / side);
  let at = (cell + 0.5) * side / l.size;
  let wanted =
    tonemap(sceneAt(at).rgb * 0.8 + glowAt(at) * 0.2) + (bayer(
      cell,
    ) - 0.5) * 0.3;
  var best = CARD[0];
  var miss = 1e9;
  for (var index = 0; index < 16; index++) {
    let off = CARD[index] - wanted;
    let d = dot(off * vec3f(0.55, 1.0, 0.45), off);
    if (d < miss) {
      miss = d;
      best = CARD[index];
    }
  }
  return best;
}
