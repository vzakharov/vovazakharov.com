import package::cube::shared::shader::hash::{hashOf, unitOf, fbm, worley};
import package::cube::entities::theme::laboratory::small_world::lib::small_world::shards;
import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, matte, polished, glowing, embossed, Lens};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, lampGlow, roomLight};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, through, grain};

const EOSIN = vec3f(0.86, 0.36, 0.52);
const HAEMATOXYLIN = vec3f(0.22, 0.1, 0.42);
const GLASS_WHITE = vec3f(0.84, 0.8, 0.82);

/// Muscle cut along its fibres: pink bands with a fine cross-stripe, split
/// by white, their nuclei pushed to the edges.
fn muscle(s: Surf) -> Material {
  let wave =
    s.uv.y + 0.12 * sin(s.uv.x * 1.1) + 0.08 * fbm(s.uv * 0.8, 421u, 3);
  let across = fract(wave / 0.28);
  let fibre = floor(wave / 0.28);
  let split = smoothstep(0.02, 0.05, min(across, 1.0 - across));
  let stripe = 0.92 + 0.08 * sin(s.uv.x * 110.0);
  let own = unitOf(hashOf(bitcast<u32>(i32(fibre)), 422u));
  let nucleus = worley(vec2f(s.uv.x * 2.4, wave * 9.0), 423u);
  let edge = 1.0 - smoothstep(0.1, 0.2, min(across, 1.0 - across));
  let dyed = edge * (1.0 - smoothstep(0.16, 0.22, nucleus.x));
  let pink = EOSIN * (0.8 + 0.3 * own) * stripe;
  let albedo = mix(mix(GLASS_WHITE, pink, split), HAEMATOXYLIN, dyed);
  return embossed(s, polished(albedo, 0.04), split - dyed, 0.004);
}

/// Glands: rings of tall cells round a white lumen, in a field of loose pink
/// cells with one dark nucleus each.
fn glands(s: Surf) -> Material {
  let cell = shards(s.uv * 7.0, 424u);
  let gland = worley(s.uv * 0.9, 425u);
  let ring =
    (1.0 - smoothstep(0.34, 0.37, gland.x)) * smoothstep(0.18, 0.21, gland.x);
  let lumen = 1.0 - smoothstep(0.18, 0.21, gland.x);
  let border = 1.0 - smoothstep(0.0, 0.07, cell.x);
  let cytoplasm = EOSIN * (0.75 + 0.5 * cell.y) * mix(1.0, 0.75, ring);
  let dyed = (1.0 - smoothstep(0.1 + 0.08 * ring, 0.17 + 0.08 * ring, cell.w));
  var albedo = mix(cytoplasm, GLASS_WHITE, 0.7 * border);
  albedo = mix(albedo, HAEMATOXYLIN * (0.8 + 0.6 * cell.z), dyed);
  // Secretion left in the lumen takes the pink weakly.
  let secretion = 0.25 * fbm(s.uv * 6.0, 426u, 3);
  albedo = mix(albedo, mix(GLASS_WHITE, EOSIN, secretion), lumen);
  return
    embossed(
      s,
      polished(albedo, 0.25),
      0.5 * dyed - border - 2.0 * lumen,
      0.004,
    );
}

/// Fat: every cell an empty white bubble in a thin pink wall.
fn fat(s: Surf) -> Material {
  let cell = shards(s.uv * 2.2, 427u);
  let wall = 1.0 - smoothstep(0.02, 0.06, cell.x);
  let dyed =
    wall
      * step(0.75, cell.y)
      * (1.0 - smoothstep(0.0, 0.5, abs(cell.w - 0.45) * 8.0));
  let albedo = mix(mix(GLASS_WHITE, EOSIN, wall), HAEMATOXYLIN, dyed);
  return embossed(s, glowing(albedo, lampGlow(s, lamps())), wall, 0.004);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return glands(s);
    }
    case FLOOR, OWNED: {
      return muscle(s);
    }
    case CEILING: {
      return fat(s);
    }
    case TRIM: {
      // Cartilage: blue-violet, its cells in pairs.
      let nest = worley(s.uv * 9.0, 428u);
      return
        matte(
          mix(
            vec3f(0.5, 0.48, 0.75),
            HAEMATOXYLIN,
            1.0 - smoothstep(0.12, 0.2, nest.x),
          ),
        );
    }
    default: {
      return stuff(s);
    }
  }
}

fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(0.95, 0.95, 0.92),
      vec3f(0.1, 0.09, 0.095),
      2,
      vec2f(1.1, 1.1),
      0.0,
    );
}

/// Light comes through a slide, not onto it: the dyes hold their colour in
/// the corners a lamp would leave dark.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let lit = roomLight(s, m, lamps());
  return haze(mix(lit, m.albedo * 0.9, 0.35), s, AIR, 70.0);
}

/// The frame as an eyepiece gives it: a round field with a hard stop,
/// colours parting toward its rim, dust on the glass and the pointer.
fn themeLens(l: Lens) -> vec3f {
  let aspect = l.size.x / l.size.y;
  let off = (l.uv - 0.5) * vec2f(aspect, 1.0);
  let r = length(off);
  let seen = tonemap(through(l, 0.1, 0.035));
  let mote = worley(off * 5.0, 429u);
  let dust =
    step(0.8, mote.y) * (1.0 - smoothstep(0.0, 0.012, abs(mote.x - 0.06)));
  let pointer =
    step(0.12, off.x) * step(abs(off.y + 0.06 * (off.x - 0.02)), 0.002);
  let stop = 1.0 - smoothstep(0.585, 0.6, r);
  let field =
    seen
      * (1.0 - 0.3 * smoothstep(0.25, 0.6, r))
      * (1.0 - 0.18 * dust)
      * (1.0 - 0.9 * pointer);
  return field * stop + grain(l) * 0.01;
}
