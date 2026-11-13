// `one-bit.ts` adds this floor's lamps and light: `lamps()` and
// `themeLight`.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, polished, glowing, embossed, repeated, Lens};
import package::cube::shared::shader::hash::{unitOf, cellHash, fbm};
import package::cube::entities::theme::edge::pattern::lib::pattern::{luma, ruled};
import package::cube::entities::theme::edge::screen::lib::screen::{bayer, creaseAt};
import package::cube::entities::theme::kit::lib::finish::{band, plaster, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;
import package::cube::entities::theme::kit::lib::grade::tonemap;

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      // Frame-and-panel to shoulder height, plaster above.
      let low = 1.0 - smoothstep(1.2, 1.21, s.p.y);
      let f = abs(repeated(vec2f(s.uv.x, s.p.y), vec2f(0.8, 1.2)));
      let panel = smoothstep(0.0, 0.03, min(0.31 - f.x, 0.5 - f.y));
      let rail = band(s.p.y, 1.24, 0.07);
      let colour = mix(plaster(s, vec3f(0.5, 0.5, 0.5)), vec3f(0.13), low);
      return
        embossed(
          s,
          polished(mix(colour, vec3f(0.3), rail), 0.2 * low),
          low * panel + 1.5 * rail,
          0.02,
        );
    }
    case FLOOR, OWNED: {
      let board = fract(s.uv.x / 0.14);
      let gap = smoothstep(0.0, 0.04, min(board, 1.0 - board));
      let plank = unitOf(cellHash(vec2i(i32(floor(s.uv.x / 0.14)), 0), 87u));
      let grain = fbm(vec2f(s.uv.x * 60.0, s.uv.y * 2.0), 88u, 3);
      let colour =
        vec3f(0.16)
          * (0.55 + 0.5 * plank)
          * (0.7 + 0.5 * grain)
          * mix(0.3, 1.0, gap);
      return embossed(s, polished(colour, 0.45), gap + 0.2 * grain, 0.004);
    }
    case CEILING: {
      let m =
        glowing(
          plaster(s, vec3f(0.16)) * (1.0 - 0.6 * damp(s)),
          lampGlow(s, lamps()),
        );
      return embossed(s, m, ruled(s.uv, 1.25, 0.08), 0.03);
    }
    case TRIM: {
      return polished(vec3f(0.09), 0.3);
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLens(l: Lens) -> vec3f {
  let side = max(floor(l.size.y / 400.0), 1.0);
  let cell = floor(l.pixel / side);
  var snapped = l;
  snapped.uv = (cell + 0.5) * side / l.size;
  let seen =
    luma(tonemap(sceneAt(snapped.uv).rgb * 1.5 + glowAt(snapped.uv) * 0.25));
  let paper = step(bayer(cell), smoothstep(0.1, 0.8, seen));
  // An edge is ruled in whichever of the two shows against where it runs.
  let edge = creaseAt(snapped, side);
  let dotted = mix(paper, step(seen, 0.3), edge);
  return mix(vec3f(0.055, 0.06, 0.12), vec3f(0.9, 0.88, 0.78), dotted);
}
