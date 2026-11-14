// Generated from household.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, LIGHT } from '../../../kit';

export const HOUSEHOLD = wgsl(
  'cube/entities/theme/dwelling/household/lib/household',
  /* wgsl */ `
/// The word of the room's side \`side\` (0 east, 1 south, 2 west, 3 north).
fn sideWord(s: Surf, side: u32) -> u32 {
  return hashOf(s.seed, side + 0x5du);
}

/// The word of the wall an upright point is on: sideWord of the side it closes.
fn wallWord(s: Surf) -> u32 {
  let eastWest = select(0u, 2u, s.normal.x > 0.0);
  let northSouth = select(1u, 3u, s.normal.z > 0.0);
  return
    sideWord(
      s,
      select(northSouth, eastWest, abs(s.normal.x) > abs(s.normal.z)),
    );
}

/// How far \`p\` is outside a box \`half\` each way from the origin; negative inside.
fn boxAway(p: vec2f, half: vec2f) -> f32 {
  let d = abs(p) - half;
  return max(d.x, d.y);
}

/// 1 where \`away\` is negative, 0 past \`soft\`.
fn within(away: f32, soft: f32) -> f32 {
  return 1.0 - smoothstep(0.0, soft, away);
}

/// \`a\` modulo \`n\`, never negative.
fn wrapped(a: i32, n: i32) -> i32 {
  return ((a % n) + n) % n;
}

/// From the nearest lamp of a \`grid\`-a-side ceiling to a floor or ceiling
/// point, in metres east and south.
fn fromLamp(s: Surf, grid: i32) -> vec2f {
  let pitch = ROOM.xz / f32(grid);
  return (fract(s.p.xz / pitch) - 0.5) * pitch;
}

/// How brightly the room's own lamps burn right now, 0 to 1.
fn burning(s: Surf, lamps: Lamps) -> f32 {
  return lampLevel(s, vec2i(0), litOf(s), lamps.stutter);
}

/// A point of a half-drop repeat \`size\` across: xy from its cell's middle,
/// z the cell's own number.
fn halfDrop(uv: vec2f, size: vec2f, salt: u32) -> vec3f {
  let column = floor(uv.x / size.x);
  let v = uv.y / size.y + 0.5 * (column - 2.0 * floor(column * 0.5));
  let q = vec2f(fract(uv.x / size.x) - 0.5, fract(v) - 0.5) * size;
  return vec3f(q, unitOf(cellHash(vec2i(i32(column), i32(floor(v))), salt)));
}

/// A point on one board of a boarded face.
struct Board {
  /// Metres to the board's nearest edge.
  edge: f32,
  /// The board's own number in [0, 1).
  word: f32,
  /// Metres along and across the board, from a start of its own.
  at: vec2f,
}

/// Boards \`width\` across and \`length\` long, laid along x, each row's joints
/// where its own roll puts them.
fn boards(uv: vec2f, width: f32, length: f32, salt: u32) -> Board {
  let row = i32(floor(uv.y / width));
  let along = uv.x / length + unitOf(cellHash(vec2i(row, 0), salt));
  let local = vec2f(fract(along) * length, fract(uv.y / width) * width);
  let word = unitOf(cellHash(vec2i(i32(floor(along)), row), salt + 1u));
  let edge = min(min(local.x, length - local.x), min(local.y, width - local.y));
  return Board(edge, word, local + word * 37.0);
}

/// Blocks \`width\` across and \`ratio\` times as long, laid herringbone.
fn herringbone(uv: vec2f, width: f32, ratio: i32, salt: u32) -> Board {
  let p = uv / width;
  let i = i32(floor(p.x));
  let j = i32(floor(p.y));
  let turn = wrapped(i - j, 2 * ratio);
  var local = vec2f(f32(turn) + fract(p.x), fract(p.y));
  var id = vec2i(i - turn, j);
  if (turn >= ratio) {
    let up = 2 * ratio - 1 - turn;
    local = vec2f(f32(up) + fract(p.y), fract(p.x));
    id = vec2i(i, j - up);
  }
  let word = unitOf(cellHash(id, salt + select(0u, 1u, turn >= ratio)));
  let edge =
    min(min(local.x, f32(ratio) - local.x), min(local.y, 1.0 - local.y));
  return Board(edge * width, word, local * width + word * 37.0);
}

/// Wood's figure at a board point, 0 (the dark of a ring) to 1.
fn figure(at: vec2f, salt: u32) -> f32 {
  let wave = fbm(vec2f(at.x * 1.2, at.y * 9.0), salt, 3);
  let rings = 0.5 + 0.5 * sin(at.y * 70.0 + wave * 16.0);
  let pores = valueNoise(vec2f(at.x * 14.0, at.y * 420.0), salt + 7u);
  return 0.5 * rings + 0.3 * wave + 0.2 * pores;
}
`,
  CORE,
  HASH,
  LIGHT,
);
