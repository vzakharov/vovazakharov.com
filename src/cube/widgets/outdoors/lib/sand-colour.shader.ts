// Generated from sand-colour.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { SAND_RELIEF } from './sand-relief.shader';
import { SAND_SALT } from './sand-salt';

export const SAND_COLOUR = wgsl(
  'cube/widgets/outdoors/lib/sand-colour',
  /* wgsl */ `
/// Dry sand's albedo, linear: pale quartz with a little shell in it.
const DRY_SAND = vec3f(0.6, 0.47, 0.31);

/// Dry sand's albedo at a ground point: the beach's broad tones, no grain.
fn sandAlbedo(xz: vec2f) -> vec3f {
  let broad = noised(xz / 11.0, SAND_SALT + 0x91u).x;
  let swathe = noised(xz / 1.9, SAND_SALT + 0x93u).x;
  let pale = vec3f(0.66, 0.6, 0.5);
  let tone = DRY_SAND * (0.9 + 0.2 * swathe);
  return mix(tone, pale, 0.5 * smoothstep(0.35, 0.8, broad));
}

/// \`albedo\` as it shows \`damp\` (0 dry, 1 soaked): darker and deeper.
fn sandWetted(albedo: vec3f, damp: f32) -> vec3f {
  return mix(albedo, 0.6 * pow(albedo, vec3f(1.5)), damp);
}

/// The bed's albedo at ground point \`xz\`, lying \`depth\` metres under the
/// water above it: soaked sand, mottled where the waves have sorted it, unlit.
fn sandBed(xz: vec2f, depth: f32) -> vec3f {
  let sorted = fbmd(xz / 1.7, SAND_SALT + 0x97u, 2).x;
  let shade = 1.0 + 0.3 * (sorted - 0.5) / (1.0 + 0.15 * depth);
  return sandWetted(sandAlbedo(xz), 1.0) * shade;
}
`,
  SAND_RELIEF,
  SAND_SALT,
);
