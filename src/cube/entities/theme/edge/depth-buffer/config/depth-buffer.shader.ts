// Generated from depth-buffer.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { CORE, GRADE, STUFF } from '../../../kit';
import { PATTERN } from '../../pattern';

export const DEPTH_BUFFER_SHADER = wgsl(
  'cube/entities/theme/edge/depth-buffer/config/depth-buffer',
  /* wgsl */ `
fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL, FLOOR, OWNED, CEILING, TRIM: {
      return matte(vec3f(0.5));
    }
    default: {
      return stuff(s);
    }
  }
}

/// A point passes on only how bright it is, for the lens to mark what is
/// drawn on a face it would otherwise show as bare distance.
fn themeLight(s: Surf, m: Material) -> vec3f {
  return vec3f(luma(m.albedo) + luma(m.emission));
}

/// 1 on the contour at every \`every\` metres of distance \`far\`, a pixel or
/// two wide, fading where contours crowd.
fn contour(far: f32, every: f32) -> f32 {
  let at = far / every;
  let pixel = fwidth(at);
  let line =
    1.0 - smoothstep(pixel * 0.7, pixel * 1.5, abs(fract(at - 0.5) - 0.5));
  return line * (1.0 - smoothstep(0.2, 0.5, pixel));
}

fn themeLens(l: Lens) -> vec3f {
  let scene = sceneAt(l.uv);
  let near = exp(-scene.a / 7.0);
  let level = floor(near * 16.0 + 0.5) / 16.0;
  let drawn = clamp(0.55 + 0.9 * scene.r, 0.3, 1.1);
  var grey = level * drawn;
  // A contour is dark on what is near and light on what is far, so it shows on both.
  let line = max(0.45 * contour(scene.a, 1.0), contour(scene.a, 5.0));
  grey = mix(grey, select(0.0, 0.5, grey < 0.25), line);
  return
    mix(vec3f(0.0, 0.012, 0.03), vec3f(1.0, 0.98, 0.93), grey) * vignette(
      l,
      0.2,
    ) + grain(l) * 0.008;
}
`,
  CORE,
  PATTERN,
  STUFF,
  GRADE,
);
