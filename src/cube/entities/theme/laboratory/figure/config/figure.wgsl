import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, valueNoise, fbm, worley};
import package::cube::entities::theme::laboratory::small_world::lib::small_world::shards;
import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, matte, glowing, repeated, Lens};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, lampGlow, roomLight};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, vignette};
import package::cube::entities::theme::kit::lib::luma::luma;

/// Organelles as a diagram has them: beans with a zigzag inside, a nucleus
/// with its nucleolus, stacks of flattened sacs, dots.
fn organelles(s: Surf) -> Material {
  let site = shards(s.uv * 0.55, 491u);
  let cytoplasm = vec3f(0.62, 0.72, 0.5);
  var albedo = cytoplasm;
  let kind = site.y;
  let turn = site.z * 6.2832;
  let lay = vec2f(cos(turn), sin(turn));
  let along = dot(s.uv, lay);
  let squash =
    site.w * (1.0 + 0.8 * abs(sin(atan2(lay.y, lay.x) * 2.0 + site.z)));
  if (kind < 0.4) {
    // A mitochondrion: orange, its inner folds drawn as a zigzag.
    let bean = 1.0 - smoothstep(0.26, 0.262, squash);
    let fold =
      step(abs(fract(along * 6.0) - 0.5), 0.12) * (1.0 - smoothstep(
        0.17,
        0.172,
        squash,
      ));
    albedo =
      mix(
        albedo,
        mix(vec3f(0.78, 0.42, 0.14), vec3f(0.45, 0.16, 0.06), fold),
        bean,
      );
  } else if (kind < 0.6) {
    // A nucleus: violet, with one dark spot.
    let ball = 1.0 - smoothstep(0.36, 0.362, site.w);
    let spot = 1.0 - smoothstep(0.1, 0.102, site.w);
    albedo =
      mix(
        albedo,
        mix(vec3f(0.5, 0.4, 0.72), vec3f(0.22, 0.14, 0.4), spot),
        ball,
      );
  } else if (kind < 0.82) {
    // Stacked sacs: blue bars, shorter toward the edges of the stack.
    let stack =
      (1.0 - smoothstep(0.3, 0.302, site.w)) * step(
        abs(fract(along * 9.0) - 0.5),
        0.2,
      );
    albedo = mix(albedo, vec3f(0.3, 0.48, 0.72), stack);
  }
  let dotted = worley(s.uv * 9.0, 492u);
  let ribosome =
    step(0.75, dotted.y)
      * (1.0 - smoothstep(0.1, 0.11, dotted.x))
      * step(0.4, site.w);
  albedo = mix(albedo, vec3f(0.3, 0.2, 0.15), ribosome);
  return matte(albedo);
}

/// The membrane as two rows of lollipops, heads out and tails in, and above
/// it the callouts: a rule, and a box with lines for words.
fn bilayer(s: Surf) -> Material {
  let h = s.p.y;
  let across = fract(s.uv.x / 0.14) - 0.5;
  let mid = 0.85;
  let side = sign(h - mid);
  let off = abs(h - mid);
  let head =
    1.0 - smoothstep(0.052, 0.054, length(vec2f(across * 0.14, off - 0.42)));
  let tail =
    step(abs(abs(across) - 0.14), 0.035) * step(0.04, off) * step(off, 0.37);
  let ground =
    mix(vec3f(0.74, 0.8, 0.86), vec3f(0.62, 0.72, 0.5), step(side, 0.0));
  var albedo = mix(ground, vec3f(0.9, 0.84, 0.6), step(off, 0.47));
  albedo = mix(albedo, vec3f(0.35, 0.3, 0.25), tail);
  albedo =
    mix(
      albedo,
      mix(vec3f(0.82, 0.3, 0.26), vec3f(0.3, 0.42, 0.75), step(side, 0.0)),
      head,
    );
  // One callout a bay: a leader from the membrane up to a box of blank lines.
  let bay = fract(s.uv.x / 1.25) * 1.25;
  let word = hashOf(bitcast<u32>(i32(floor(s.uv.x / 1.25))), s.seed ^ 0x49u);
  let called = step(0.35, unitOf(word));
  let leader =
    called
      * step(abs(bay - 0.3), 0.004)
      * step(1.32, h)
      * step(h, 1.7)
      * step(0.5, fract(h * 25.0));
  let box = vec2f(abs(bay - 0.62) - 0.34, abs(h - 1.85) - 0.14);
  let card = called * (1.0 - smoothstep(0.0, 0.003, max(box.x, box.y)));
  let written =
    card
      * step(box.x, -0.04)
      * step(abs(fract((h - 1.71) / 0.07) - 0.5), 0.12)
      * step(fract(bay * 3.1 + unitOf(mix32(word))), 0.8 - 0.3 * step(1.85, h));
  albedo = mix(albedo, vec3f(0.88, 0.86, 0.8), card);
  albedo = mix(albedo, vec3f(0.2, 0.18, 0.2), max(leader, written));
  return matte(albedo);
}

fn pageCeiling(s: Surf) -> Material {
  // Registration crosses, as on a printer's sheet.
  let at = repeated(s.uv, vec2f(1.25));
  let mark =
    step(min(abs(at.x), abs(at.y)), 0.006) * step(
      max(abs(at.x), abs(at.y)),
      0.09,
    );
  return
    glowing(mix(vec3f(0.8, 0.78, 0.7), vec3f(0.2), mark), lampGlow(s, lamps()));
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return bilayer(s);
    }
    case FLOOR, OWNED: {
      return organelles(s);
    }
    case CEILING: {
      return pageCeiling(s);
    }
    case TRIM: {
      return matte(vec3f(0.5, 0.4, 0.72));
    }
    default: {
      let m = stuff(s);
      return Material(m.albedo, m.emission, 0.0, vec3f(0.0));
    }
  }
}

fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(0.8, 0.8, 0.76),
      vec3f(0.3, 0.3, 0.29),
      2,
      vec2f(0.5, 0.5),
      0.0,
    );
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return haze(roomLight(s, m, lamps()), s, AIR, 90.0);
}

/// The ink where the picture at `uv` has an edge: where what is seen
/// steps away in depth, or changes colour.
fn inkAt(l: Lens, uv: vec2f) -> f32 {
  let px = 1.2 / l.size;
  let here = sceneAt(uv);
  let east = sceneAt(uv + vec2f(px.x, 0.0));
  let west = sceneAt(uv - vec2f(px.x, 0.0));
  let south = sceneAt(uv + vec2f(0.0, px.y));
  let north = sceneAt(uv - vec2f(0.0, px.y));
  let step_ =
    abs(east.a + west.a - 2.0 * here.a) + abs(south.a + north.a - 2.0 * here.a);
  let hue = length(east.rgb - west.rgb) + length(south.rgb - north.rgb);
  return
    max(
      smoothstep(0.01, 0.04, step_ / max(here.a, 0.3)),
      smoothstep(0.1, 0.3, hue),
    );
}

/// The frame as a printed figure: each colour flattened to a few tints,
/// shade as hatching, an ink line round everything, on paper.
fn themeLens(l: Lens) -> vec3f {
  let seen = tonemap(sceneAt(l.uv).rgb * 1.1);
  let light = luma(seen);
  let tint = seen / max(light, 0.05);
  let tinted = tint * (floor(light * 5.0 + 0.5) / 5.0);
  let hatch =
    step(light, 0.42) * step(0.6, fract((l.pixel.x + l.pixel.y) / 6.0));
  let tooth =
    valueNoise(l.pixel / 2.5, 493u) * 0.05 + fbm(l.uv * 4.0, 494u, 3) * 0.06;
  let paper = vec3f(0.95, 0.92, 0.84) * (0.92 + tooth);
  let printed =
    paper * mix(tinted * 1.15, vec3f(0.35, 0.33, 0.4), 0.45 * hatch);
  let ink = inkAt(l, l.uv);
  return mix(printed, vec3f(0.07, 0.06, 0.1), ink * 0.92) * vignette(l, 0.12);
}
