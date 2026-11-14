// Generated from greybox.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { PATTERN } from '../../pattern';

export const GREYBOX_SHADER = wgsl(
  'cube/entities/theme/edge/greybox/config/greybox',
  /* wgsl */ `
/// A measuring grid in \`tone\`: metre squares in two shades, ruled in
/// metres and quarters, a cross on every metre's corner.
fn measured(s: Surf, tone: vec3f, mark: vec3f) -> Material {
  let squares = mix(0.82, 1.0, chequer(s.uv, 1.0));
  let quarters = ruled(s.uv, 0.25, 0.004);
  let metres = ruled(s.uv, 1.0, 0.014);
  let corner = abs(fract(s.uv + 0.5) - 0.5);
  let cross =
    step(max(corner.x, corner.y), 0.09) * step(min(corner.x, corner.y), 0.012);
  let dust = 0.94 + 0.12 * fbm(s.uv * 1.7, s.seed, 3);
  var colour = tone * squares * dust;
  colour = mix(colour, tone * 1.25, 0.5 * quarters);
  colour = mix(colour, mark, max(metres * 0.85, cross));
  return polished(colour, 0.3);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let orange = vec3f(0.62, 0.21, 0.035);
      // Every wall says how tall it is: a band at one metre, another at two.
      let rule = band(s.p.y, 1.0, 0.03) + band(s.p.y, 2.0, 0.03);
      let m = measured(s, orange, vec3f(0.9, 0.62, 0.36));
      return
        Material(
          mix(m.albedo, vec3f(0.07, 0.03, 0.01), rule),
          m.emission,
          m.gloss,
          m.relief,
        );
    }
    case FLOOR, OWNED: {
      return measured(s, vec3f(0.23, 0.235, 0.24), vec3f(0.5, 0.51, 0.52));
    }
    case CEILING: {
      let m = measured(s, vec3f(0.4, 0.4, 0.4), vec3f(0.62, 0.62, 0.62));
      return Material(m.albedo, lampGlow(s, lamps()), 0.0, m.relief);
    }
    case TRIM: {
      let stripe = step(0.5, fract((s.uv.x + s.uv.y) * 4.0));
      return
        polished(
          mix(vec3f(0.03, 0.03, 0.03), vec3f(0.75, 0.56, 0.04), stripe),
          0.3,
        );
    }
    default: {
      return stuff(s);
    }
  }
}
`,
  CORE,
  HASH,
  PATTERN,
  FINISH,
  STUFF,
  LIGHT,
);
