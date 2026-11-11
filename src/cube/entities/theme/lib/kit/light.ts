import { wgsl } from '../wgsl';
import { CORE } from './core';
import { HASH } from './hash';

/**
 * A room lit by its own ceiling lamps and nothing else: no ray leaves the
 * room, so the cost is the same on floor 66 as on floor 1, and a room whose
 * lamps failed is dark up to its doorways.
 */
export const LIGHT = wgsl(
  'light',
  /* wgsl */ `
/// A floor's lamps: a square grid of panels in each room's ceiling.
struct Lamps {
  /// Their colour times their strength.
  colour: vec3f,
  /// The light left with every lamp off.
  ambient: vec3f,
  /// Panels along each side of the ceiling, and one panel's size in metres.
  grid: i32,
  size: vec2f,
  /// The share of rooms whose lamps stutter: lit ones dip, failed ones try
  /// to start.
  stutter: f32,
};

/// The room's lamps right now, 0 to 1. A stuttering room's fits come in
/// four-second spells on the shared clock, so two viewers see the same flash.
fn lampLevel(s: Surf, stutter: f32) -> f32 {
  let steady = litOf(s);
  if (unitOf(hashOf(s.seed, 0x1au)) >= stutter) {
    return steady;
  }
  let tick = u32(s.time * 12.0) + s.hour * 43200u;
  if (unitOf(hashOf(s.seed ^ 0x77u, tick / 48u)) >= 0.35) {
    return steady;
  }
  let fit = unitOf(hashOf(s.seed, tick));
  return select(steady, 0.75 - 0.6 * steady, fit < 0.3);
}

/// 1 inside a lamp panel at ceiling point \`at\` (metres east and south in the
/// room), 0 outside, for \`grid\` panels a side, each \`size\` metres.
fn lampMask(at: vec2f, grid: i32, size: vec2f) -> f32 {
  let pitch = ROOM.xz / f32(grid);
  let off = (fract(at / pitch) - 0.5) * pitch;
  let edge = abs(off) - size * 0.5;
  return 1.0 - smoothstep(0.0, 0.03, max(edge.x, edge.y));
}

/// How much of the lamps' light a point takes: x what it scatters, y what it
/// throws back at the eye as a highlight.
fn lampReach(s: Surf, normal: vec3f, gloss: f32, grid: i32) -> vec2f {
  let pitch = ROOM.xz / f32(grid);
  let power = mix(6.0, 600.0, gloss * gloss);
  var sum = vec2f(0.0);
  for (var i = 0; i < grid; i++) {
    for (var j = 0; j < grid; j++) {
      let lamp = vec3f(
        (f32(i) + 0.5) * pitch.x,
        ROOM.y - 0.05,
        (f32(j) + 0.5) * pitch.y,
      );
      let to = lamp - s.p;
      let d2 = dot(to, to);
      let l = to / sqrt(d2);
      // A panel shines mostly down, and less with distance.
      let falloff = (0.3 + 0.7 * max(l.y, 0.0)) / (1.0 + 0.35 * d2);
      let facing = max(dot(normal, l), 0.0);
      let half = normalize(l - s.view);
      let glint = pow(max(dot(normal, half), 0.0), power) * (power + 8.0) / 25.0;
      sum += vec2f(facing, facing * glint) * falloff;
    }
  }
  return sum;
}

/// The dimming where surfaces meet: a floor or ceiling toward its closed
/// walls, a wall toward the floor, the ceiling and the walls it joins.
fn cornerShade(s: Surf) -> f32 {
  let reach = 0.7;
  // Metres to the room's east, south, west and north sides.
  let toSide = vec4f(ROOM.x - s.p.x, ROOM.z - s.p.z, s.p.x, s.p.z);
  var near = reach;
  if (abs(s.normal.y) > 0.5) {
    for (var side = 0u; side < 4u; side++) {
      if (closedAt(s, side)) {
        near = min(near, toSide[side]);
      }
    }
  } else {
    near = min(s.p.y, ROOM.y - s.p.y);
    // The walls a wall joins are the pair it does not run along.
    let first = select(0u, 1u, abs(s.normal.x) > abs(s.normal.z));
    for (var side = first; side < 4u; side += 2u) {
      if (closedAt(s, side)) {
        near = min(near, toSide[side]);
      }
    }
  }
  let dim = 1.0 - smoothstep(0.0, reach, near);
  return 1.0 - 0.45 * dim * dim;
}

/// How much brighter a panel is to look at than the room it lights.
const GLARE = 8.0;

/// What a ceiling gives off at the point: the lamps' glare inside a panel.
fn lampGlow(s: Surf, lamps: Lamps) -> vec3f {
  return lamps.colour * (GLARE * lampMask(s.p.xz, lamps.grid, lamps.size)
    * lampLevel(s, lamps.stutter));
}

/// The point lit by its room: the lamps' direct light and what bounces off
/// the room, the spill through its doorways from lit neighbours, the ambient,
/// the lamps' highlights on anything polished, and on a polished floor the
/// panels themselves mirrored in it.
fn roomLight(s: Surf, m: Material, lamps: Lamps) -> vec3f {
  let level = lampLevel(s, lamps.stutter);
  let normal = normalize(s.normal + m.relief);
  let reach = lampReach(s, normal, m.gloss, lamps.grid);
  let shade = cornerShade(s);
  let light = lamps.ambient
    + lamps.colour * (level * (reach.x + 0.2) + 0.1 * spillOf(s));
  // A polished thing mirrors more the more it is looked along.
  let along = pow(1.0 - max(dot(normal, -s.view), 0.0), 5.0);
  let mirror = m.gloss * (0.04 + 0.96 * along);
  var colour = m.albedo * light * shade + m.emission
    + lamps.colour * (level * reach.y * mirror * shade);
  if (m.gloss > 0.0 && s.normal.y > 0.9) {
    let mirrored = reflect(s.view, normal);
    if (mirrored.y > 0.001) {
      let hit = s.p + mirrored * ((ROOM.y - s.p.y) / mirrored.y);
      // Past a closed wall there is that wall to mirror, not more ceiling.
      let past = vec4f(hit.x - ROOM.x, hit.z - ROOM.z, -hit.x, -hit.z);
      var open = 1.0;
      for (var side = 0u; side < 4u; side++) {
        if (past[side] > 0.0 && closedAt(s, side)) {
          open = 0.0;
        }
      }
      colour += lamps.colour * (GLARE * level * mirror * open)
        * lampMask(hit.xz, lamps.grid, lamps.size);
    }
  }
  return colour;
}
`,
  CORE,
  HASH,
);
