import { wgsl } from '@/cube/entities/theme/kit';

import { SAND_RELIEF } from './sand-relief';

/** Dry sand's albedo, linear: pale quartz with a little shell in it. */
export const DRY_SAND = [0.56, 0.47, 0.36] as const;

/**
 * The sand's colour, dry and wet, without its grain. The sea draws its bed
 * with `sandBed`, so the sand under shallow water is the beach's own.
 */
export const SAND_COLOUR = wgsl(
  'sand-colour',
  /* wgsl */ `
/// Dry sand's albedo at a ground point: the beach's broad tones, no grain.
fn sandAlbedo(xz: vec2f) -> vec3f {
  let broad = noised(xz / 11.0, 0x91u).x;
  let swathe = noised(xz / 1.9, 0x93u).x;
  let pale = vec3f(0.66, 0.6, 0.5);
  let tone = vec3f(${DRY_SAND.join(', ')}) * (0.9 + 0.2 * swathe);
  return mix(tone, pale, 0.5 * smoothstep(0.35, 0.8, broad));
}

/// \`albedo\` as it shows \`damp\` (0 dry, 1 soaked): darker and deeper.
fn sandWetted(albedo: vec3f, damp: f32) -> vec3f {
  return mix(albedo, 0.6 * pow(albedo, vec3f(1.5)), damp);
}

/// The bed's albedo at ground point \`xz\`, lying \`depth\` metres under the
/// water above it: soaked sand with the ripple marks waves leave, unlit.
fn sandBed(xz: vec2f, depth: f32) -> vec3f {
  let marks = rippleTrain(xz, vec2f(0.6, 0.8), 0.14, 0x97u);
  let stand = 1.0 - smoothstep(1.5, 6.0, depth);
  let shade = 1.0 + 0.22 * stand * (0.5 - 0.5 * cos(marks.x) - 0.5);
  return sandWetted(sandAlbedo(xz), 1.0) * shade;
}
`,
  SAND_RELIEF,
);
