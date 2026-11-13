// Generated from casino.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { SHAPE } from '../../shape';

export const CASINO_SHADER = wgsl(
  'cube/entities/theme/leisure/casino/config/casino',
  /* wgsl */ `
/// A carpet of ribbons that never run straight, a rosette where they would
/// cross, in purple, teal, crimson and gold.
fn swirled(s: Surf) -> Material {
  let warp =
    vec2f(fbm(s.uv * 0.9, 340u, 3), fbm(s.uv * 0.9 + 5.0, 341u, 3)) - 0.5;
  let p = s.uv + warp * 1.3;
  let ribbon = sin(p.x * 8.0 + 3.0 * sin(p.y * 2.3));
  let edge = 1.0 - smoothstep(0.08, 0.16, abs(abs(ribbon) - 0.55));
  let leaf = repeated(p, vec2f(0.4, 0.3));
  let sprig =
    inside(length(vec2f(leaf.x, leaf.y * 2.2)) - 0.07) * step(abs(ribbon), 0.4);
  let rose = repeated(s.uv, vec2f(1.25));
  let r = length(rose);
  let a = atan2(rose.y, rose.x);
  let petal = r - (0.22 + 0.07 * cos(a * 8.0));
  let pile = valueNoise(s.uv * 240.0, 11u);
  var colour =
    mix(
      vec3f(0.07, 0.012, 0.1),
      vec3f(0.015, 0.14, 0.14),
      step(0.55, abs(ribbon)),
    );
  colour = mix(colour, vec3f(0.4, 0.24, 0.03), max(edge, sprig));
  colour = mix(colour, vec3f(0.3, 0.012, 0.03), inside(petal));
  colour =
    mix(
      colour,
      vec3f(0.4, 0.24, 0.03),
      max(stroke(petal, 0.03), inside(r - 0.06)),
    );
  let worn = 0.55 + 0.25 * fbm(s.uv * 0.45, 5u, 3);
  return embossed(s, matte(colour * (0.72 + 0.4 * pile) * worn), pile, 0.0015);
}

/// How bright the bulb at \`at\` metres from its row is: one in four lit,
/// the lit one moving \`way\` along the row.
fn bulbs(along: f32, up: f32, way: i32, time: f32, salt: u32) -> f32 {
  let pitch = 0.14;
  let index = i32(floor(along / pitch));
  let turn = ((index * way + i32(time * 7.0)) % 4 + 4) % 4;
  let dead = step(unitOf(hashOf(bitcast<u32>(index), salt)), 0.06);
  let bulb = inside(length(vec2f(spaced(along, pitch), up)) - 0.026);
  return bulb * mix(select(0.12, 1.0, turn == 0), 0.0, dead);
}

/// Burgundy lacquer in gilt frames over a dark dado, and a row of bulbs at
/// the head of the wall and at the waist, chasing opposite ways.
fn gilded(s: Surf) -> Material {
  let h = s.p.y;
  let bay = spaced(s.uv.x, 1.25);
  let upper = vec2f(bay, h - 1.52);
  let lower = vec2f(bay, h - 0.5);
  let frame =
    max(
      stroke(roundBox(upper, vec2f(0.5, 0.42), 0.06), 0.03),
      stroke(roundBox(lower, vec2f(0.5, 0.3), 0.0), 0.025),
    );
  let sheen = fbm(vec2f(s.uv.x, h) * 3.0, 342u, 3);
  let lacquer =
    mix(
      vec3f(0.1, 0.008, 0.018),
      vec3f(0.03, 0.006, 0.01),
      1.0 - smoothstep(0.92, 0.924, h),
    ) * (0.8 + 0.4 * sheen);
  let gilt =
    vec3f(0.5, 0.31, 0.06) * (0.7 + 0.5 * valueNoise(
      vec2f(s.uv.x, h) * 80.0,
      343u,
    ));
  let rail =
    max(max(band(h, 0.95, 0.1), band(h, 2.14, 0.12)), band(h, 0.05, 0.1));
  let lit =
    bulbs(s.uv.x, h - 2.14, 1, s.time, 344u) + bulbs(
      s.uv.x + 0.07,
      h - 0.95,
      -1,
      s.time,
      345u,
    );
  let warm = vec3f(1.0, 0.62, 0.22);
  let halo = exp(-abs(h - 2.14) * 9.0) + exp(-abs(h - 0.95) * 9.0);
  let albedo = mix(mix(lacquer, gilt, frame), gilt * 0.5, rail);
  let wall =
    Material(
      albedo,
      warm * (7.0 * lit) + albedo * warm * (0.8 * halo),
      mix(0.75, 0.55, max(frame, rail)),
      vec3f(0.0),
    );
  return embossed(s, wall, 2.0 * frame + 3.0 * rail + 0.1 * sheen, 0.005);
}

/// Squares of gold mirror in dark beading, a downlight in every third.
fn mirrored(s: Surf) -> Material {
  let pane = tiling(s.uv, 0.625, 0.03, 346u);
  let ripple = fbm(s.uv * 3.0 + pane.y * 20.0, 347u, 3);
  let q = repeated(s.uv, vec2f(0.625));
  let lozenge = stroke(abs(q.x) + abs(q.y) - 0.2, 0.012);
  let boss = inside(length(q) - 0.035);
  let gold =
    vec3f(0.2, 0.12, 0.025)
      * (0.6 + 0.6 * ripple)
      * (1.0 + 1.2 * max(lozenge, boss));
  let ceiling =
    Material(
      mix(vec3f(0.02, 0.012, 0.01), gold, pane.x),
      lampGlow(s, lamps()),
      0.6 * pane.x,
      vec3f(0.0),
    );
  return
    embossed(
      s,
      ceiling,
      pane.x + 0.6 * ripple + 2.0 * max(lozenge, boss),
      0.006,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return gilded(s);
    }
    case FLOOR, OWNED: {
      return swirled(s);
    }
    case CEILING: {
      return mirrored(s);
    }
    case TRIM: {
      let flute = 0.5 + 0.5 * cos(s.uv.x * 126.0);
      return
        embossed(
          s,
          polished(vec3f(0.035, 0.008, 0.012) * (0.6 + 0.6 * flute), 0.8),
          flute,
          0.004,
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
  SHAPE,
  LIGHT,
);
