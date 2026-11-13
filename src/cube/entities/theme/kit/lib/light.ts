import { wgsl } from '@/cube/shared/lib/wgsl';
import { HASH } from '@/cube/shared/lib/wgsl-hash';

import { CORE } from './core';

/**
 * A point lit by the ceiling lamps of its room and of the eight around it,
 * through what the room's flags say is open: the cost is the same on floor
 * 66 as on floor 1, light is the same from either side of an open edge, and
 * a room whose lamps failed takes its neighbours' through its doorways.
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

/// The lamps of the room \`by\` rooms east and south of the point's right
/// now, 0 to 1, \`lit\` being whether they work. A stuttering room's fits
/// come in four-second spells on the shared clock, so two viewers see the
/// same flash, and are rolled from its place on the floor, so every room
/// around it sees them too.
fn lampLevel(s: Surf, by: vec2i, lit: f32, stutter: f32) -> f32 {
  let place = vec2u(vec2i(s.cell) + by) & vec2u(63u);
  let word = hashOf(place.x | (place.y << 8u), 0x1au);
  if (unitOf(word) >= stutter) {
    return lit;
  }
  let tick = u32(s.time * 12.0) + s.hour * 43200u;
  if (unitOf(hashOf(word ^ 0x77u, tick / 48u)) >= 0.35) {
    return lit;
  }
  let fit = unitOf(hashOf(word, tick));
  return select(lit, 0.75 - 0.6 * lit, fit < 0.3);
}

/// The side a room one step away lies through: 0 east, 1 south, 2 west, 3 north.
fn sideOf(by: vec2i) -> u32 {
  return select(select(3u, 1u, by.y > 0), select(2u, 0u, by.x > 0), by.x != 0);
}

/// The corner a room one step each way lies across: 0 south-east, 1
/// south-west, 2 north-west, 3 north-east.
fn cornerOf(by: vec2i) -> u32 {
  return select(select(2u, 3u, by.x > 0), select(1u, 0u, by.x > 0), by.y > 0);
}

/// The lamps of the room \`by\` rooms away, no farther than one each way,
/// as far as any of their light can enter the point's room: nothing through
/// a closed side or across a corner with no way round it.
fn lampsBeside(s: Surf, by: vec2i, stutter: f32) -> f32 {
  var lit = litOf(s);
  if (by.x != 0 && by.y != 0) {
    let corner = cornerOf(by);
    if (!(wayAcross(s, corner, true) || wayAcross(s, corner, false))) {
      return 0.0;
    }
    lit = f32(litAcross(s, corner));
  } else if (by.x != 0 || by.y != 0) {
    let side = sideOf(by);
    if (closedAt(s, side)) {
      return 0.0;
    }
    lit = f32(litBeside(s, side));
  }
  return lampLevel(s, by, lit, stutter);
}

/// Whether light from a lamp across a corner, \`to\` away from the point,
/// gets to it: it leaves the point's room by one of the corner's two sides,
/// and that way round has to be open.
fn reachesAcross(s: Surf, by: vec2i, to: vec3f) -> bool {
  let edge = vec2f(max(by, vec2i(0))) * ROOM.xz;
  let leaves = (edge - s.p.xz) / to.xz;
  let corner = cornerOf(by);
  // Even corners' first way is through an east or west side.
  return wayAcross(s, corner, (leaves.x < leaves.y) == ((corner & 1u) == 0u));
}

/// 1 inside a lamp panel at ceiling point \`at\` (metres east and south in the
/// room), 0 outside, for \`grid\` panels a side, each \`size\` metres.
fn lampMask(at: vec2f, grid: i32, size: vec2f) -> f32 {
  return 1.0 - smoothstep(0.0, 0.03, panelEdge(at, grid, size));
}

/// \`lampMask\` blurred \`soft\` metres across, as a floor short of glass
/// mirrors it: the panel spreads into a dimmer glow holding the light it
/// had, as the frame's own blur of a panel it shows does, so the two agree
/// where one gives way to the other.
fn lampBlur(at: vec2f, grid: i32, size: vec2f, soft: f32) -> f32 {
  let half = 0.5 * max(soft, 0.03);
  let spread = size / (size + vec2f(soft));
  return (1.0 - smoothstep(-half, half, panelEdge(at, grid, size))) * spread.x * spread.y;
}

/// How far ceiling point \`at\` lies outside the nearest of \`grid\` panels a
/// side, each \`size\` metres: negative inside one.
fn panelEdge(at: vec2f, grid: i32, size: vec2f) -> f32 {
  let pitch = ROOM.xz / f32(grid);
  let off = repeated(at, pitch);
  let edge = abs(off) - size * 0.5;
  return max(edge.x, edge.y);
}

/// How much light a point takes from the lamps of its room and of the
/// eight around it: x what it scatters, y what it throws back at the eye as
/// a highlight, z what hangs in the air about it whichever way it faces and
/// however high it is. A lamp's light dies out a room's side away, so a point on an open edge
/// takes the same from the rooms either side of it.
fn lampReach(s: Surf, normal: vec3f, gloss: f32, lamps: Lamps) -> vec3f {
  let pitch = ROOM.xz / f32(lamps.grid);
  let power = mix(6.0, 600.0, gloss * gloss);
  // A polished floor mirrors the panels themselves, which is its highlight.
  let glinting = gloss > 0.0 && s.normal.y <= 0.9;
  var sum = vec3f(0.0);
  for (var south = -1; south <= 1; south++) {
    for (var east = -1; east <= 1; east++) {
      let by = vec2i(east, south);
      let level = lampsBeside(s, by, lamps.stutter);
      if (level <= 0.0) {
        continue;
      }
      let across = east != 0 && south != 0;
      for (var i = 0; i < lamps.grid; i++) {
        for (var j = 0; j < lamps.grid; j++) {
          let lamp = vec3f(
            (f32(east * lamps.grid + i) + 0.5) * pitch.x,
            ROOM.y - 0.05,
            (f32(south * lamps.grid + j) + 0.5) * pitch.y,
          );
          let to = lamp - s.p;
          let h2 = dot(to.xz, to.xz);
          let span = 1.0 - h2 * h2 / (ROOM.x * ROOM.x * ROOM.x * ROOM.x);
          if (span <= 0.0 || (across && !reachesAcross(s, by, to))) {
            continue;
          }
          let shine = level * span * span;
          let d2 = dot(to, to);
          let l = to / sqrt(d2);
          // A panel shines mostly down, and less with distance.
          let falloff = shine * (0.3 + 0.7 * max(l.y, 0.0)) / (1.0 + 0.35 * d2);
          let facing = max(dot(normal, l), 0.0);
          var glint = 0.0;
          if (glinting) {
            let half = normalize(l - s.view);
            glint = pow(max(dot(normal, half), 0.0), power) * (power + 8.0) / 25.0;
          }
          sum += vec3f(facing * falloff, facing * glint * falloff, shine / (1.0 + 0.35 * h2));
        }
      }
    }
  }
  return sum;
}

/// The dimming where surfaces meet: a floor or ceiling toward the walls
/// that stand on it — its room's own, and those that end on its corners from
/// the rooms beside, so the dimming runs on across an open edge — and a wall
/// toward the floor, the ceiling and the walls it joins.
fn cornerShade(s: Surf) -> f32 {
  let reach = 0.7;
  let toSide = toSides(s);
  var near = reach;
  if (abs(s.normal.y) > 0.5) {
    for (var side = 0u; side < 4u; side++) {
      if (closedAt(s, side)) {
        near = min(near, toSide[side]);
        continue;
      }
      for (var turn = 1u; turn < 4u; turn += 2u) {
        let end = (side + turn) & 3u;
        if (!closedAt(s, end) && wallBeside(s, side, turn == 1u)) {
          near = min(near, length(vec2f(toSide[side], toSide[end])));
        }
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
    * lampLevel(s, vec2i(0), litOf(s), lamps.stutter));
}

/// How much of a polished floor's relief bends what it mirrors.
const RIPPLE = 0.15;

/// How many metres a floor's reflection blurs per metre the mirrored ray
/// runs, on a floor of no gloss at all.
const BLUR = 0.15;

/// How much of the lamps' light the air about a point passes on to it.
const FILL = 0.16;

/// How many metres a moulded skin blurs what it mirrors per metre the
/// mirrored ray runs.
const SKIN_BLUR = 0.15;

/// The panels of the point's room and the rooms around as a mirror at it
/// facing \`plane\` shows them, blurred \`blur\` metres a metre.
fn panelsMirrored(s: Surf, plane: vec3f, blur: f32, lamps: Lamps) -> vec3f {
  let ray = reflect(s.view, plane);
  if (ray.y <= 0.001) {
    return vec3f(0.0);
  }
  let hit = s.p + ray * ((ROOM.y - s.p.y) / ray.y);
  // Past the rooms around, the ceiling mirrored is taken for theirs.
  let by = clamp(vec2i(floor(hit.xz / ROOM.xz)), vec2i(-1), vec2i(1));
  let soft = blur * length(hit - s.p);
  return lamps.colour * (GLARE * lampsBeside(s, by, lamps.stutter))
    * lampBlur(hit.xz, lamps.grid, lamps.size, soft);
}

/// The point lit by the lamps around it: their direct light and what the
/// air passes on, the ambient and their highlights on anything polished. A
/// polished floor is left a mirror, which the frame fills with what it shows
/// along the reflection, or, where it shows nothing there, with the panels
/// of the rooms around mirrored in it.
fn roomLight(s: Surf, m: Material, lamps: Lamps) -> vec3f {
  let normal = normalize(s.normal + m.relief);
  let reach = lampReach(s, normal, m.gloss, lamps);
  let shade = cornerShade(s);
  let light = lamps.ambient + lamps.colour * (reach.x + FILL * reach.z);
  // A polished thing mirrors more the more it is looked along.
  let along = pow(1.0 - max(dot(normal, -s.view), 0.0), 5.0);
  let mirror = m.gloss * (0.04 + 0.96 * along);
  var colour = m.albedo * light * shade + m.emission
    + lamps.colour * (reach.y * mirror * shade);
  if (s.kind == PLASTIC) {
    // Plastic is too small and too rounded for the frame to mirror in: it
    // carries the panels' own blurred image, which is its highlight.
    colour += panelsMirrored(s, normal, SKIN_BLUR, lamps) * ((0.04 + 0.96 * along) * shade);
  } else if (m.gloss > 0.0 && s.normal.y > 0.9) {
    // The floor mirrors off its plane, its relief only rippling what it
    // shows: relief steep at every joint between boards would throw single
    // pixels' rays onto a panel, and the floor would sparkle.
    let plane = normalize(s.normal + RIPPLE * m.relief);
    let blur = BLUR * (1.0 - m.gloss);
    mirroring = Mirror(mirror, plane, blur, panelsMirrored(s, plane, blur, lamps));
  }
  return colour;
}
`,
  CORE,
  HASH,
);
