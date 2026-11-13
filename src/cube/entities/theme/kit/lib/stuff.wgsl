// The stuffs things in a room are made of, the same on every floor: a theme
// draws its own walls, floor and ceiling and hands every other kind here.

import super::core::{Surf, Material, toNearestSide, embossed, polished, matte, PLATE, HANDLE, METAL, WOOD, PLASTIC, FABRIC, GLASS, SCREEN, PAPER, FOLIAGE, RUBBER, SKIN};
import package::cube::shared::shader::hash::{valueNoise, fbm, unitOf, hashOf, cellHash};

/// The face's paint, or `fallback` where it carries none.
fn painted(s: Surf, fallback: vec3f) -> vec3f {
  return select(fallback, s.paint, dot(s.paint, vec3f(1.0)) > 0.0);
}

/// A floor the viewer bought: `m` with a brass line inlaid round the room.
fn ownedMark(s: Surf, m: Material) -> Material {
  let line = 1.0 - smoothstep(0.02, 0.024, abs(toNearestSide(s) - 0.3));
  let brass =
    vec3f(0.62, 0.43, 0.14) * (0.85 + 0.3 * valueNoise(s.uv * 200.0, 36u));
  return
    Material(
      mix(m.albedo, brass, line),
      m.emission,
      mix(m.gloss, 0.7, line),
      m.relief,
    );
}

fn stuff(s: Surf) -> Material {
  let fine = valueNoise(s.uv * 90.0, 31u);
  switch s.kind {
    case PLATE: {
      return
        embossed(
          s,
          polished(vec3f(0.07, 0.08, 0.09) * (0.85 + 0.3 * fine), 0.45),
          fine,
          0.0006,
        );
    }
    case HANDLE: {
      return polished(painted(s, vec3f(0.5, 0.03, 0.025)), 0.6);
    }
    case METAL: {
      let brushed = valueNoise(vec2f(s.uv.x * 6.0, s.uv.y * 300.0), 32u);
      let steel = painted(s, vec3f(0.36, 0.38, 0.4)) * (0.85 + 0.2 * brushed);
      return embossed(s, polished(steel, 0.55), brushed, 0.0004);
    }
    case WOOD: {
      let grain = fbm(vec2f(s.uv.x * 40.0, s.uv.y * 1.5), 33u, 3);
      let wood = painted(s, vec3f(0.3, 0.17, 0.08)) * (0.65 + 0.55 * grain);
      return embossed(s, polished(wood, 0.25), grain, 0.0008);
    }
    case PLASTIC: {
      // Moulded smooth: without a highlight a black one is a hole in the room.
      return
        polished(painted(s, vec3f(0.5, 0.5, 0.48)) * (0.92 + 0.1 * fine), 0.6);
    }
    case FABRIC: {
      let weave = valueNoise(s.uv * 400.0, 34u);
      return matte(painted(s, vec3f(0.22, 0.24, 0.32)) * (0.75 + 0.35 * weave));
    }
    case GLASS: {
      return polished(painted(s, vec3f(0.03, 0.05, 0.06)), 0.95);
    }
    case SCREEN: {
      let frame = u32(s.time * 24.0);
      let snow =
        unitOf(hashOf(cellHash(vec2i(floor(s.uv * 160.0)), s.seed), frame));
      let lit = painted(s, vec3f(0.7, 0.75, 0.8)) * (0.25 + 0.75 * snow);
      return Material(vec3f(0.01), lit, 0.8, vec3f(0.0));
    }
    case PAPER: {
      return matte(painted(s, vec3f(0.7, 0.68, 0.6)) * (0.94 + 0.08 * fine));
    }
    case FOLIAGE: {
      let leaf = valueNoise(s.uv * 30.0, 35u);
      return matte(painted(s, vec3f(0.07, 0.22, 0.06)) * (0.6 + 0.7 * leaf));
    }
    case RUBBER: {
      return polished(painted(s, vec3f(0.02, 0.02, 0.02)), 0.15);
    }
    case SKIN: {
      return
        polished(painted(s, vec3f(0.6, 0.4, 0.3)) * (0.95 + 0.08 * fine), 0.2);
    }
    default: {
      return matte(painted(s, vec3f(0.5, 0.5, 0.48)) * (0.92 + 0.1 * fine));
    }
  }
}
