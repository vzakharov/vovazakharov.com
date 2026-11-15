// Generated from fluorescence.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, LIGHT, LUMA, STUFF } from '../../../kit';
import { SMALL_WORLD } from '../../small-world';

export const FLUORESCENCE_SHADER = wgsl(
  'cube/entities/theme/laboratory/fluorescence/config/fluorescence',
  /* wgsl */ `
const DAPI = vec3f(0.08, 0.25, 1.0);
const ACTIN = vec3f(0.1, 1.0, 0.25);
const MITO = vec3f(1.0, 0.12, 0.08);

/// A thin bright thread wherever \`field\` crosses a half.
fn thread(field: f32, width: f32) -> f32 {
  return 1.0 - smoothstep(0.0, width, abs(field - 0.5));
}

/// Cells spread flat on glass: a lit outline, a speckled nucleus, fibres
/// pulled taut across each cell its own way, engines crowding the nucleus.
fn monolayer(s: Surf) -> Material {
  let cell = shards(s.uv * 0.9, 471u);
  let turn = cell.y * 6.2832;
  let lay = dot(s.uv, vec2f(cos(turn), sin(turn)));
  let near = 1.0 / (1.0 + s.far * s.far / 80.0);
  let fibre =
    pow(
      0.5 + 0.5 * sin(lay * 70.0 + 3.0 * fbm(s.uv * 2.0, 472u, 2)),
      6.0,
    ) * near + 0.15 * (1.0 - near);
  let edge = 1.0 - smoothstep(0.0, 0.05, cell.x);
  let chromatin = fbm(s.uv * 16.0, 473u, 3);
  let nucleus =
    (1.0 - smoothstep(0.13, 0.16, cell.w)) * (0.35 + 1.3
      * chromatin
      * chromatin);
  let around =
    smoothstep(0.14, 0.2, cell.w) * (1.0 - smoothstep(0.3, 0.5, cell.w));
  let worm = thread(fbm(s.uv * 5.0, 474u, 3), 0.02) * around;
  let glow =
    DAPI * 1.6 * nucleus
      + ACTIN * (0.9 * edge + 0.35 * fibre * (1.0 - nucleus))
      + MITO * 1.4 * worm;
  return Material(vec3f(0.004), glow, 0.55, vec3f(0.0));
}

/// Nerve cells: bodies with their nuclei, and green processes wandering
/// between them, beaded red where two touch.
fn neurons(s: Surf) -> Material {
  let body = worley(s.uv * 0.8, 475u);
  let soma =
    1.0 - smoothstep(0.1, 0.2, body.x + 0.05 * fbm(s.uv * 6.0, 476u, 2));
  let nucleus = 1.0 - smoothstep(0.05, 0.08, body.x);
  let wander = fbm(s.uv * 0.9, 477u, 4);
  let process =
    thread(wander, 0.012) + 0.6 * thread(fbm(s.uv * 2.1 + 9.0, 478u, 3), 0.014);
  let bead = step(0.8, valueNoise(s.uv * 40.0, 479u)) * thread(wander, 0.03);
  let pulse = 0.75 + 0.25 * sin(s.time * 0.9 + wander * 30.0);
  let glow =
    ACTIN * (0.8 * process * pulse + 0.35 * soma)
      + DAPI * 1.5 * nucleus
      + MITO * 1.6 * bead;
  return Material(vec3f(0.004), glow, 0.2, vec3f(0.0));
}

/// Overhead, what drifted out of focus: soft blue discs.
fn outOfFocus(s: Surf) -> Material {
  let blur = worley(s.uv * 0.7, 480u);
  let disc = step(0.4, blur.y) * (1.0 - smoothstep(0.1, 0.3, blur.x)) * 0.35;
  let speck = step(0.992, valueNoise(s.uv * 60.0, 481u));
  return
    glowing(
      vec3f(0.004),
      lampGlow(s, lamps()) + DAPI * disc + ACTIN * 0.8 * speck,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return neurons(s);
    }
    case FLOOR, OWNED: {
      return monolayer(s);
    }
    case CEILING: {
      return outOfFocus(s);
    }
    case TRIM: {
      let strand =
        thread(fbm(vec2f(s.uv.x * 14.0, s.uv.y * 1.2), 482u, 3), 0.06);
      return glowing(vec3f(0.004), MITO * 0.9 * strand);
    }
    default: {
      let m = stuff(s);
      return
        Material(
          m.albedo,
          m.emission + ACTIN * 0.12 * luma(m.albedo),
          m.gloss,
          m.relief,
        );
    }
  }
}
`,
  HASH,
  SMALL_WORLD,
  CORE,
  STUFF,
  LUMA,
  LIGHT,
);
