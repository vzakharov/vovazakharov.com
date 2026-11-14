// Generated from cube-shadow.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { SUN_DISC } from '@/cube/shared/lib/sun-disc';
import { SUN } from '@/cube/shared/outside';
import { wgsl } from '@/cube/shared/shader';
import { LADDER_WGSL, WORLD } from '@/cube/entities/island';

import { CUBE_SHADOW_NUMBERS } from './cube-shadow-numbers';
import { OUTDOOR_FRAME } from './outdoor-frame';

export const CUBE_SHADOW = wgsl(
  'cube/widgets/outdoors/lib/cube-shadow',
  /* wgsl */ `
/// How much of the sun the cube leaves \`p\`, the edge as wide as the sun's
/// disc makes it at the distance the shadow has run.
fn boxLight(p: vec3f) -> f32 {
  let off = p - 0.5 * (CUBE_MIN + CUBE_MAX);
  var out = -1e9;
  var back = vec3f(0.0);
  for (var i = 0; i < 3; i++) {
    let side = CUBE_OUTLINE[i];
    let across = dot(side.xyz, off);
    if (abs(across) - side.w > out) {
      out = abs(across) - side.w;
      back = -side.xyz * sign(across);
    }
  }
  // A point beside the outline is judged by the ray of the outline's edge.
  let edge = p + back * (max(out, 0.0) + 0.001);
  let a = (CUBE_MIN - edge) / SUN_DIR;
  let b = (CUBE_MAX - edge) / SUN_DIR;
  let near = min(a, b);
  let far = max(a, b);
  let enters = max(near.x, max(near.y, near.z));
  let leaves = min(far.x, min(far.y, far.z));
  let hit = leaves > max(enters, 0.0);
  let ahead = -dot(off, SUN_DIR);
  let run = select(max(ahead, 0.0), max(enters, 0.0), hit);
  let beside = select(0.0, 1.0, out > 0.0 && ahead > 0.0);
  let behind = select(beside, smoothstep(0.0, SHADOW_BEHIND, leaves), hit);
  let soft = SUN_SPREAD * run + SHADOW_CRISP;
  return 1.0 - (1.0 - smoothstep(-soft, soft, out)) * behind;
}

/// How much of the sun a bar \`half\` wide leaves a point \`off\` from its
/// middle, its edge \`soft\` wide.
fn barLight(off: f32, half: f32, soft: f32) -> f32 {
  return
    (1.0 - smoothstep(half - soft, half + soft, off)) * min(1.0, half / soft);
}

/// How much of the sun the ladder leaves \`p\`.
fn ladderLight(p: vec3f) -> f32 {
  let run = dot(LADDER_FOOT - p, LADDER_OUT) / dot(SUN_DIR, LADDER_OUT);
  let at = p + SUN_DIR * run - LADDER_FOOT;
  let up = dot(at, LADDER_UP);
  let across = abs(dot(at, LADDER_ACROSS));
  let soft = SUN_SPREAD * max(run, 0.0) + SHADOW_CRISP;
  let stiles =
    barLight(
      abs(across - 0.5 * LADDER_SIZE.y),
      0.5 * LADDER_SIZE.z,
      soft,
    ) * barLight(abs(up - 0.5 * LADDER_SIZE.x), 0.5 * LADDER_SIZE.x, soft);
  let step = clamp(up, LADDER_RUNGS.x, LADDER_RUNGS.y) - LADDER_RUNGS.x;
  let rung = LADDER_RUNGS.x + round(step / LADDER_SIZE.w) * LADDER_SIZE.w;
  let rungs =
    barLight(abs(up - rung), 0.5 * LADDER_RUNGS.z, soft) * barLight(
      across,
      0.5 * LADDER_SIZE.y,
      soft,
    );
  return
    1.0 - max(stiles, rungs) * smoothstep(
      SHADOW_BEHIND,
      3.0 * SHADOW_BEHIND,
      run,
    );
}

/// How much of the sun reaches \`p\` in the world frame: 1 in the sun, 0 in
/// the shadow of the cube and its ladder. A point on the cube's own sunlit
/// faces is in the sun; one on the ladder is not in the ladder's shadow.
/// Once the frame says the ladder is gone the cube casts alone.
fn cubeShadow(p: vec3f) -> f32 {
  return boxLight(p) * mix(1.0, ladderLight(p), frame.state.x);
}
`,
  SUN_DISC,
  CUBE_SHADOW_NUMBERS,
  WORLD,
  LADDER_WGSL,
  OUTDOOR_FRAME,
  SUN,
);
