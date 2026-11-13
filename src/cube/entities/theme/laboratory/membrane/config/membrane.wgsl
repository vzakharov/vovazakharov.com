// `membrane.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::shared::shader::hash::{unitOf, fbm, worley};
import package::cube::entities::theme::laboratory::small_world::lib::small_world::{combHash, dome};
import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, polished, embossed, repeated};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::honeycomb::honeycomb;
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// Lipid heads `pitch` metres apart: x a head's height at the point, y the
/// head's own number. Each bobs to its own beat.
fn heads(s: Surf, pitch: f32, salt: u32) -> vec2f {
  let comb = honeycomb(s.uv / pitch);
  let own = unitOf(combHash(comb.zw, salt));
  let bob = 0.85 + 0.15 * sin(s.time * (0.6 + own) + own * 40.0);
  return vec2f(dome(comb.xy, 0.5) * bob, own);
}

/// A protein through the membrane: x how much of the point is protein, y
/// how deep into its pore the point is.
fn protein(uv: vec2f, salt: u32) -> vec2f {
  let site = worley(uv * 0.75, salt);
  let lumpy = site.x + 0.05 * fbm(uv * 9.0, salt + 1u, 3);
  let body = step(0.5, site.y) * (1.0 - smoothstep(0.24, 0.3, lumpy));
  let pore = step(0.72, site.y) * (1.0 - smoothstep(0.06, 0.1, lumpy));
  return vec2f(body, pore);
}

/// A protein's violet, mottled by `lobe`.
fn proteinViolet(lobe: f32) -> vec3f {
  return vec3f(0.2, 0.12, 0.5) * (0.5 + lobe);
}

fn leaflet(s: Surf) -> Material {
  let head = heads(s, 0.11, 411u);
  let embedded = protein(s.uv, 412u);
  let lobe = fbm(s.uv * 7.0, 413u, 3);
  let swell = 0.5 + 0.5 * sin(s.uv.x * 1.1 + s.uv.y * 0.7 + s.time * 0.35);
  let lipid =
    mix(
      vec3f(0.5, 0.13, 0.16),
      vec3f(0.72, 0.36, 0.2),
      head.y,
    ) * (0.25 + 0.75 * head.x);
  let albedo =
    mix(
      mix(lipid, proteinViolet(lobe), embedded.x),
      vec3f(0.01, 0.0, 0.02),
      embedded.y,
    );
  let glow =
    vec3f(0.5, 0.75, 1.0)
      * 0.5
      * embedded.y
      * (0.6 + 0.4 * sin(s.time * 1.7 + s.uv.x));
  let wall = Material(albedo, glow, 0.6, vec3f(0.0));
  let height =
    mix(head.x + 0.8 * swell, 1.6 + 1.2 * lobe - 3.0 * embedded.y, embedded.x);
  return embossed(s, wall, height, 0.035);
}

fn rafts(s: Surf) -> Material {
  let head = heads(s, 0.16, 414u);
  // Rafts: islands where the heads stand taller, paler and closer.
  let raft = smoothstep(0.5, 0.56, fbm(s.uv * 0.45, 415u, 3));
  let lipid =
    mix(vec3f(0.42, 0.24, 0.05), vec3f(0.6, 0.5, 0.26), raft)
      * (0.2 + 0.8 * head.x)
      * (0.8 + 0.4 * head.y);
  return embossed(s, polished(lipid, 0.75), head.x + 1.5 * raft, 0.03);
}

fn channels(s: Surf) -> Material {
  let comb = honeycomb(s.uv / 0.07);
  let tail = dome(comb.xy, 0.45);
  let pale = vec3f(0.5, 0.42, 0.2) * (0.3 + 0.7 * tail);
  // A channel is round: the panel's light through a pore.
  let pitch = ROOM.xz / 2.0;
  let off = repeated(s.p.xz, pitch);
  let r = length(off);
  let pore = 1.0 - smoothstep(0.42, 0.5, r);
  let collar = (1.0 - smoothstep(0.7, 0.78, r)) * (1.0 - pore);
  let albedo = mix(pale, proteinViolet(fbm(s.uv * 7.0, 416u, 3)), collar);
  let m = Material(albedo, lampGlow(s, lamps()) * pore, 0.5, vec3f(0.0));
  return embossed(s, m, tail * (1.0 - collar) + 4.0 * collar, 0.012);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return leaflet(s);
    }
    case FLOOR, OWNED: {
      return rafts(s);
    }
    case CEILING: {
      return channels(s);
    }
    case TRIM: {
      let lobe = fbm(s.uv * 7.0, 417u, 3);
      return embossed(s, polished(proteinViolet(lobe), 0.6), lobe, 0.03);
    }
    default: {
      return stuff(s);
    }
  }
}
