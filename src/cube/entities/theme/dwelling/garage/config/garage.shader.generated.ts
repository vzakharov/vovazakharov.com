// Generated from garage.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, STUFF } from '../../../kit';
import { HOUSEHOLD } from '../../household';

export const GARAGE_SHADER = wgsl(
  'cube/entities/theme/dwelling/garage/config/garage',
  /* wgsl */ `
/// How far \`w\` is outside the tool that hung in a pegboard bay rolled
/// \`what\`: a hammer, a spanner, a saw, or nothing at all.
fn toolAway(w: vec2f, what: f32) -> f32 {
  if (what < 0.3) {
    return
      min(
        boxAway(w + vec2f(0.0, 0.04), vec2f(0.014, 0.15)),
        boxAway(w - vec2f(0.012, 0.12), vec2f(0.065, 0.024)),
      );
  }
  if (what < 0.55) {
    let jaw =
      max(
        length(w - vec2f(0.0, 0.15)) - 0.036,
        -boxAway(w - vec2f(0.0, 0.175), vec2f(0.014, 0.03)),
      );
    return
      min(
        min(boxAway(w, vec2f(0.012, 0.14)), jaw),
        abs(length(w + vec2f(0.0, 0.15)) - 0.022) - 0.01,
      );
  }
  if (what < 0.75) {
    let blade =
      boxAway(
        vec2f(w.x - 0.04, w.y + (w.x - 0.04) * 0.14),
        vec2f(0.17, 0.05 - (w.x + 0.13) * 0.09),
      );
    return min(blade, boxAway(w + vec2f(0.17, -0.02), vec2f(0.045, 0.06)));
  }
  return 1.0;
}

fn pegboard(s: Surf) -> Material {
  let y = s.p.y;
  let along = alongWall(s);
  let wall = wallWord(s);

  let flake = worley(s.uv * vec2f(38.0, 60.0), 0x110u);
  let strand =
    mix(
      vec3f(0.3, 0.2, 0.09),
      vec3f(0.14, 0.08, 0.03),
      flake.y,
    ) * (0.75 + 0.5 * flake.x);
  let sheet = 1.0 - tiling(vec2f(s.uv.x, y + 0.1), 1.22, 0.004, 0x111u).x;
  let scuffed =
    1.0 - 0.4 * smoothstep(
      0.5,
      0.75,
      fbm(s.uv * vec2f(2.0, 5.0), s.seed ^ 0x112u, 3),
    );

  let pitch = 0.025;
  let hole =
    within(
      length((fract(vec2f(s.uv.x, y) / pitch) - 0.5) * pitch) - 0.0032,
      0.0015,
    ) / (1.0 + s.far * s.far / 12.0);
  let bay = floor(along / 0.62);
  let w = vec2f(along - (bay + 0.5) * 0.62, y - 1.62);
  let roll = hashOf(wall, u32(bay) + 0x113u);
  let away = toolAway(w, unitOf(roll));
  let kept = within(away, 0.004);
  let marker = band(away, 0.0, 0.007);
  let hook = within(length(w - vec2f(0.0, 0.31)) - 0.008, 0.003);
  let dust = 0.8 + 0.12 * fbm(s.uv * 2.0, s.seed ^ 0x114u, 3);
  var board = vec3f(0.48, 0.47, 0.42) * mix(dust, 1.04, kept);
  board = mix(board, vec3f(0.03, 0.05, 0.16), marker);
  board = mix(board, vec3f(0.012), hole);

  let low = within(y - 1.1, 0.003);
  let batten = band(y, 1.1, 0.06);
  var albedo = mix(board, strand * scuffed * (1.0 - 0.7 * sheet), low);
  albedo =
    mix(
      albedo,
      vec3f(0.22, 0.15, 0.07) * (0.6 + 0.5 * fbm(
        vec2f(s.uv.x * 3.0, y * 80.0),
        0x115u,
        3,
      )),
      batten,
    );
  albedo = mix(albedo, vec3f(0.4, 0.42, 0.44), hook * (1.0 - low));
  let gloss = mix(0.2, 0.08, low) + 0.6 * hook * (1.0 - low);
  let height =
    mix(
      -0.6 * hole + 2.0 * hook,
      0.4 * flake.x - 0.8 * sheet,
      low,
    ) + 2.5 * batten;
  return embossed(s, polished(albedo, gloss), height, 0.004);
}

fn slab(s: Surf) -> Material {
  let trowel = fbm(s.uv * 1.8 + 3.0 * fbm(s.uv * 0.4, 0x116u, 2), 0x117u, 4);
  let grit = worley(s.uv * 70.0, 0x118u);
  var concrete =
    vec3f(0.16, 0.16, 0.155) * (0.72 + 0.4 * trowel) * (0.9 + 0.15 * grit.y);
  let joint = 1.0 - tiling(s.uv, 2.5, 0.014, 0x119u).x;
  let bay = fract(s.uv.x / 2.5) * 2.5;
  let line = band(bay, 0.35, 0.1) * step(0.35, fbm(s.uv * 5.0, 0x11au, 3));
  let lane = fract(s.uv.x / 2.5 - 0.14) * 2.5;
  let tread =
    0.6 + 0.4 * step(0.5, fract(s.uv.y / 0.045 + 0.3 * sin(lane * 60.0)));
  let tyre =
    max(band(lane, 0.7, 0.19), band(lane, 2.15, 0.19))
      * tread
      * smoothstep(0.3, 0.6, fbm(s.uv * vec2f(2.0, 0.3), 0x11bu, 3));
  let spot = worley(s.uv * 0.8, s.seed ^ 0x11cu);
  let oil =
    within(spot.x - 0.16 - 0.1 * fbm(s.uv * 5.0, 0x11du, 3), 0.1) * step(
      0.72,
      spot.y,
    );
  let sheen = 0.5 + 0.5 * cos(vec3f(0.0, 2.1, 4.2) + spot.x * 22.0);
  concrete = mix(concrete, vec3f(0.42, 0.33, 0.04), 0.85 * line);
  concrete *= 1.0 - 0.55 * tyre;
  concrete =
    mix(concrete, vec3f(0.012, 0.012, 0.014) + 0.012 * sheen, 0.9 * oil);
  concrete = mix(concrete, vec3f(0.03), joint);
  let floor =
    polished(concrete, mix(0.1 + 0.15 * trowel, 0.8, oil) * (1.0 - joint));
  return
    embossed(
      s,
      floor,
      (0.5 * trowel + 0.15 * grit.x) * (1.0 - oil) - 2.0 * joint,
      0.002,
    );
}

fn boarded(s: Surf) -> Material {
  let seam = 1.0 - tiling(s.uv, 1.2, 0.05, 0x11eu).x;
  let tape = seam * (0.85 + 0.15 * fbm(s.uv * 9.0, 0x11fu, 3));
  let screw =
    within(length((fract(s.uv / 0.3) - 0.5) * 0.3) - 0.006, 0.003) * step(
      abs(fract(s.uv.x / 1.2) - 0.5),
      0.13,
    );
  let stain = smoothstep(0.5, 0.7, fbm(s.uv * 0.7, s.seed ^ 0x120u, 4));
  let ring = band(fbm(s.uv * 0.7, s.seed ^ 0x120u, 4), 0.6, 0.012);
  var paper =
    vec3f(0.3, 0.3, 0.28) * (0.9 + 0.1 * valueNoise(s.uv * 90.0, 0x121u));
  paper = mix(paper, vec3f(0.46, 0.45, 0.42), tape);
  paper = mix(paper, paper * vec3f(0.7, 0.55, 0.35), 0.6 * stain + 0.5 * ring);
  paper = mix(paper, vec3f(0.1), screw);

  let off = fromLamp(s, 1);
  let tube = within(boxAway(off, vec2f(0.75, 0.02)), 0.004);
  let batten = within(boxAway(off, vec2f(0.8, 0.05)), 0.004);
  let chain =
    max(band(off.x, 0.55, 0.008), band(off.x, -0.55, 0.008)) * step(
      abs(off.y),
      0.05,
    );
  let glow = lamps().colour * (3.0 * tube * burning(s, lamps()));
  var albedo = mix(paper, vec3f(0.46, 0.47, 0.46), batten);
  albedo = mix(albedo, vec3f(0.1), chain * (1.0 - tube));
  let ceiling = Material(albedo, glow, 0.4 * batten, vec3f(0.0));
  return
    embossed(s, ceiling, 0.4 * tape + 0.2 * screw + 4.0 * batten + tube, 0.008);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return pegboard(s);
    }
    case FLOOR, OWNED: {
      return slab(s);
    }
    case CEILING: {
      return boarded(s);
    }
    case TRIM: {
      return
        polished(
          vec3f(0.42, 0.33, 0.04)
            * (0.7 + 0.4 * fbm(s.uv * 8.0, 0x11au, 3))
            * step(0.5, fract((s.uv.x + s.uv.y) / 0.3)) + vec3f(0.02),
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
  FINISH,
  STUFF,
  HOUSEHOLD,
);
