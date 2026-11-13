import { CEILING_HEIGHT, ROOM_METRES } from '@/cube/shared/lib/room-shape';
import { SURFACES } from '@/cube/shared/lib/surface';
import { wgsl } from '@/cube/shared/shader';

import { FLAGS_WGSL } from '../model/flags';

const KINDS = SURFACES.map(
  (name, kind) => `const ${name.toUpperCase()}: u32 = ${String(kind)}u;`,
).join('\n');

/**
 * What every floor's WGSL is written over: the surface kinds by name, the
 * point being shaded as a `Surf`, what a theme answers about it, and the
 * lattice a pattern repeats over.
 */
export const CORE = wgsl(
  'core',
  /* wgsl */ `
${KINDS}

/// A room from its floor to its ceiling, in metres: x east, y up, z south.
const ROOM = vec3f(${ROOM_METRES.toFixed(1)}, ${(ROOM_METRES * CEILING_HEIGHT).toFixed(3)}, ${ROOM_METRES.toFixed(1)});

/// The point being shaded, in its own room's terms.
struct Surf {
  /// One of the surface constants above.
  kind: u32,
  /// Metres from the room's north-west floor corner: x east, y up, z south.
  p: vec3f,
  /// Metres across the face: (east, south) on a floor or ceiling, (along, up)
  /// on anything upright. It runs on through neighbouring rooms, so a pattern
  /// drawn in it has no seam at a doorway.
  uv: vec2f,
  normal: vec3f,
  /// The room's own word: what its stains, wear and timing grow from.
  seed: u32,
  /// Read with the flag readers: closedAt, litOf and the rest.
  flags: u32,
  /// The room's column and row on its floor, each modulo 64.
  cell: vec2u,
  /// The face's tint, linear; black where it has none.
  paint: vec3f,
  /// From the eye to the point, unit length, and how far that is in metres.
  view: vec3f,
  far: f32,
  /// The framebuffer pixel, and the same as a 0..1 share of the screen.
  pixel: vec2f,
  screen: vec2f,
  /// Seconds into the hour of the clock every viewer shares, and which hour.
  time: f32,
  hour: u32,
};

/// Metres from the point to its room's sides, in closedAt's order: east,
/// south, west, north.
fn toSides(s: Surf) -> vec4f {
  return vec4f(ROOM.x - s.p.x, ROOM.z - s.p.z, s.p.x, s.p.z);
}

/// Metres from the point to the nearest of its room's sides, wall or not.
fn toNearestSide(s: Surf) -> f32 {
  let away = toSides(s);
  return min(min(away.x, away.y), min(away.z, away.w));
}

/// Metres along an upright face from its room's west or north end.
fn alongWall(s: Surf) -> f32 {
  return select(s.p.x, s.p.z, abs(s.normal.x) > abs(s.normal.z));
}

/// What a surface is: its colour, the light it gives off, how polished it
/// is, 0 (chalk) to 1 (a mirror), and its relief — what is added to the
/// face's normal before it is lit, zero for a flat face.
struct Material {
  albedo: vec3f,
  emission: vec3f,
  gloss: f32,
  relief: vec3f,
};

fn matte(albedo: vec3f) -> Material {
  return Material(albedo, vec3f(0.0), 0.0, vec3f(0.0));
}

fn polished(albedo: vec3f, gloss: f32) -> Material {
  return Material(albedo, vec3f(0.0), gloss, vec3f(0.0));
}

fn glowing(albedo: vec3f, emission: vec3f) -> Material {
  return Material(albedo, emission, 0.0, vec3f(0.0));
}

/// \`m\` with relief: \`height\` is the surface's height at the point in any
/// unit, and \`depth\` how many metres one unit of it stands proud. It
/// flattens with distance, where its grain is finer than a pixel.
fn embossed(s: Surf, m: Material, height: f32, depth: f32) -> Material {
  let dpx = dpdx(s.p);
  let dpy = dpdy(s.p);
  let r1 = cross(dpy, s.normal);
  let r2 = cross(s.normal, dpx);
  let det = dot(dpx, r1);
  let slope = (dpdx(height) * r1 + dpdy(height) * r2) * depth;
  let near = 1.0 / (1.0 + s.far * s.far / 150.0);
  let relief = -slope * sign(det) * near / max(abs(det), 1e-9);
  return Material(m.albedo, m.emission, m.gloss, m.relief + clamp(relief, vec3f(-2.0), vec3f(2.0)));
}

/// \`uv\` within its cell of a lattice of \`size\`, from the cell's middle.
fn repeated(uv: vec2f, size: vec2f) -> vec2f {
  return (fract(uv / size) - 0.5) * size;
}

/// \`x\` within its interval of a row of them \`size\` long, from the middle.
fn spaced(x: f32, size: f32) -> f32 {
  return (fract(x / size) - 0.5) * size;
}

/// What a point mirroring its surroundings leaves for the frame to finish:
/// the share of what lies along its reflection it shows, the plane it
/// reflects off, how many metres the reflection blurs per metre it runs, and
/// \`fallback\`, the lamps' light it shows where the frame cannot see along
/// the reflection.
struct Mirror {
  strength: f32,
  normal: vec3f,
  blur: f32,
  fallback: vec3f,
};

/// The mirror of the point being shaded, none until its light says so; the
/// stage hands it on beside the point's light, and what dims that light on
/// its way to the eye dims \`strength\` with it.
var<private> mirroring: Mirror;

/// The pixel a floor's lens is asked for.
struct Lens {
  /// Its place on the screen, 0 to 1 from the top left, and in pixels.
  uv: vec2f,
  pixel: vec2f,
  /// The screen's size in pixels.
  size: vec2f,
  /// The shared clock, as a Surf has it.
  time: f32,
  hour: u32,
};

// The stage supplies what a lens looks at:
//   fn sceneAt(uv: vec2f) -> vec4f   the lit scene there, and in \`a\` how many
//                                    metres off it is
//   fn glowAt(uv: vec2f) -> vec3f    the scene's bright parts, spread wide

${FLAGS_WGSL}
`,
);
