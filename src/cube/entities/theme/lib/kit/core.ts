import { SURFACES } from '@/cube/shared/lib/surface';

import { FLAGS_WGSL } from '../../model/flags';
import { wgsl } from '../wgsl';

const KINDS = SURFACES.map(
  (name, kind) => `const ${name.toUpperCase()}: u32 = ${String(kind)}u;`,
).join('\n');

/**
 * What every floor's WGSL is written over: the surface kinds by name, the
 * point being shaded as a `Surf`, and what a theme answers about it.
 */
export const CORE = wgsl(
  'core',
  /* wgsl */ `
${KINDS}

/// A room, in metres: x east, y up, z south.
const ROOM = vec3f(5.0, 2.5, 5.0);

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
  /// Read with closedAt, litOf and litBeside.
  flags: u32,
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
