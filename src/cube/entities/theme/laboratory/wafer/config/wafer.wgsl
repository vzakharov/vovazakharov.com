// `wafer.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, Material, polished, embossed};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, cellHash, valueNoise};
import package::cube::entities::theme::kit::lib::finish::tiling;
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// The colour a film `thickness` waves thick throws back, looked at
/// `facing` on, 1 square to it and 0 along it.
fn thinFilm(thickness: f32, facing: f32) -> vec3f {
  let phase = thickness * (0.55 + 0.45 * facing) * 6.2832;
  return 0.5 + 0.5 * cos(phase * vec3f(1.0, 1.22, 1.5) + vec3f(0.0, 0.7, 1.5));
}

fn dies(s: Surf) -> Material {
  let facing = max(dot(s.normal, -s.view), 0.0);
  let die = s.uv / vec2f(1.25, 0.625);
  let at = fract(die);
  let inset = min(min(at.x, 1.0 - at.x) * 1.25, min(at.y, 1.0 - at.y) * 0.625);
  let lane = 1.0 - smoothstep(0.012, 0.016, inset);
  let ringed = (1.0 - smoothstep(0.05, 0.054, inset)) * (1.0 - lane);
  let padRow = ringed * step(0.45, fract((at.x * 1.25 + at.y * 0.625) / 0.04));
  // A die is blocks: memory in fine stripes, logic in a grey fog of gates.
  let block = s.uv / 0.15625;
  let word = cellHash(vec2i(floor(block)), 451u);
  let kind = unitOf(word);
  let near = 1.0 / (1.0 + s.far * s.far / 60.0);
  let lines = select(s.uv.x, s.uv.y, (word & 2u) == 2u);
  let rows = 0.5 + 0.5 * near * sin(lines * 420.0);
  let gates = valueNoise(s.uv * 190.0, 452u);
  let detail = mix(rows, gates, step(0.55, kind));
  let gutter = 1.0 - tiling(s.uv, 0.15625, 0.006, 453u).x;
  let film = thinFilm(1.1 + 2.6 * kind + 0.25 * detail, facing);
  var albedo = mix(vec3f(0.3, 0.32, 0.36), film, 0.6) * (0.16 + 0.22 * detail);
  albedo = mix(albedo, vec3f(0.035, 0.04, 0.05), max(lane, gutter));
  albedo = mix(albedo, vec3f(0.6, 0.5, 0.2), padRow);
  let m = polished(albedo, 0.96 - 0.3 * max(lane, padRow));
  return
    embossed(s, m, 0.3 * detail * near - gutter - 2.0 * lane + padRow, 0.0012);
}

fn cassette(s: Surf) -> Material {
  let h = s.p.y;
  let facing = max(dot(s.normal, -s.view), 0.0);
  let slot = h / 0.05;
  let word =
    hashOf(
      bitcast<u32>(i32(floor(slot))),
      bitcast<u32>(i32(floor(s.uv.x / 1.25))) ^ s.seed,
    );
  let loaded = step(0.12, unitOf(word));
  let edge = loaded * (1.0 - smoothstep(0.1, 0.18, abs(fract(slot) - 0.5)));
  // The rack's posts, a bay apart, combed to hold the wafers.
  let across = fract(s.uv.x / 1.25) * 1.25;
  let post = 1.0 - smoothstep(0.035, 0.04, min(across, 1.25 - across));
  let comb = post * step(0.5, fract(slot + 0.5));
  let film = thinFilm(1.5 + 3.0 * unitOf(mix32(word)) + 0.4 * s.uv.x, facing);
  let bevel = 1.0 - 2.0 * abs(fract(slot) - 0.5);
  var albedo = mix(vec3f(0.006, 0.006, 0.008), film * 0.8 + 0.1, edge);
  albedo = mix(albedo, vec3f(0.5, 0.48, 0.4) * (0.7 + 0.3 * comb), post);
  let wall = polished(albedo, mix(0.2, 0.95, edge) * (1.0 - 0.6 * post));
  return embossed(s, wall, edge * bevel + 2.0 * post + comb, 0.012);
}

fn yellowCeiling(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.02, 454u);
  let near = 1.0 / (1.0 + s.far * s.far / 30.0);
  let mesh =
    mix(0.6, smoothstep(0.15, 0.3, length(fract(s.uv / 0.025) - 0.5)), near);
  let white = vec3f(0.5, 0.5, 0.48) * (0.6 + 0.4 * mesh);
  let m =
    Material(
      mix(vec3f(0.3), white, tile.x),
      lampGlow(s, lamps()),
      0.3,
      vec3f(0.0),
    );
  return embossed(s, m, tile.x + 0.3 * mesh, 0.004);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return cassette(s);
    }
    case FLOOR, OWNED: {
      return dies(s);
    }
    case CEILING: {
      return yellowCeiling(s);
    }
    case TRIM: {
      return polished(vec3f(0.5, 0.48, 0.4), 0.45);
    }
    default: {
      return stuff(s);
    }
  }
}
