// Generated from gymnasium.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { SHAPE } from '../../shape';

export const GYMNASIUM_SHADER = wgsl(
  'cube/entities/theme/leisure/gymnasium/config/gymnasium',
  /* wgsl */ `
/// Maple strip under varnish, and over it the courts of several games,
/// every room marked out the same.
fn court(s: Surf) -> Material {
  let board = slabs(s.uv.yx, vec2f(1.4, 0.057), 0.0012, 231u, 0.37);
  let grain = fbm(vec2f(s.uv.y * 3.0, s.uv.x * 90.0) + board.y * 30.0, 232u, 3);
  let near = fading(s, 50.0);
  let maple =
    vec3f(0.5, 0.32, 0.15)
      * (0.82 + 0.22 * board.y)
      * (0.8 + 0.3 * mix(0.5, grain, near));
  let q = fract(s.uv / ROOM.xz) * ROOM.xz;
  let white =
    max(
      stroke(q.x - 0.5, 0.05),
      stroke(length(q - vec2f(2.5, 2.5)) - 0.9, 0.05),
    );
  let red =
    max(
      stroke(length(q - vec2f(2.5, 2.5)) - 1.8, 0.05),
      stroke(q.y - 2.5, 0.05),
    );
  let arc = min(length(q - vec2f(2.5, 0.0)), length(q - vec2f(2.5, 5.0))) - 2.2;
  let yellow = max(stroke(arc, 0.04), stroke(q.x - 3.9, 0.04));
  let blue =
    max(
      stroke(roundBox(q - vec2f(2.5, 4.3), vec2f(0.9, 0.7), 0.0), 0.05),
      stroke(q.y - 1.2, 0.05),
    );
  let green = stroke(roundBox(q - vec2f(1.6, 2.5), vec2f(1.3, 2.2), 0.0), 0.04);
  let worn = 0.55 + 0.45 * fbm(s.uv * 1.1, 233u, 3);
  var colour = mix(maple, vec3f(0.03, 0.2, 0.08), green * worn);
  colour = mix(colour, vec3f(0.03, 0.09, 0.33), blue * worn);
  colour = mix(colour, vec3f(0.55, 0.42, 0.04), yellow * worn);
  colour = mix(colour, vec3f(0.42, 0.03, 0.025), red * worn);
  colour = mix(colour, vec3f(0.6, 0.6, 0.56), white * worn);
  let scuff = smoothstep(0.55, 0.8, fbm(s.uv * 1.7, 234u, 3));
  // Joints and grain finer than a pixel would shimmer: they fade with distance.
  let joint = mix(1.0, board.x, near);
  let floor = polished(colour * mix(0.45, 1.0, joint), 0.06 - 0.03 * scuff);
  return
    embossed(
      s,
      floor,
      2.0 * fbm(s.uv * 2.4, 235u, 3) + 0.3 * fbm(s.uv * 11.0, 230u, 2),
      0.003,
    );
}

/// Pine boards to shoulder height under a rail, painted block above.
fn boarded(s: Surf) -> Material {
  let h = s.p.y;
  let plank = slabs(vec2f(h, s.uv.x), vec2f(4.0, 0.09), 0.003, 236u, 0.0);
  let grain = fbm(vec2f(s.uv.x * 70.0, h * 2.0) + plank.y * 20.0, 237u, 3);
  let knot =
    smoothstep(0.045, 0.0, worley(vec2f(s.uv.x * 6.0, h * 1.5), 238u).x);
  let pine =
    vec3f(0.47, 0.27, 0.09)
      * (0.8 + 0.25 * plank.y)
      * (0.72 + 0.4 * grain)
      * (1.0 - 0.6 * knot);
  let block = slabs(s.uv, vec2f(0.4, 0.2), 0.012, 239u, 0.5);
  let pores = valueNoise(s.uv * 120.0, 240u);
  let paint =
    plaster(s, vec3f(0.5, 0.52, 0.4))
      * (0.9 + 0.1 * pores)
      * mix(0.7, 1.0, block.x);
  let low = 1.0 - smoothstep(1.4, 1.404, h);
  let rail = band(h, 1.43, 0.07);
  let skirt = 1.0 - smoothstep(0.12, 0.124, h);
  let wood =
    mix(
      pine * mix(0.4, 1.0, plank.x),
      vec3f(0.16, 0.08, 0.03) * (0.7 + 0.5 * grain),
      max(rail, skirt),
    );
  let wall =
    polished(mix(paint, wood, max(low, rail)), mix(0.3, 0.6, max(low, rail)));
  let height =
    mix(
      block.x + 0.15 * pores,
      plank.x + 0.3 * grain + 3.0 * max(rail, skirt),
      max(low, rail),
    );
  return embossed(s, wall, height, 0.003);
}

/// Wood-wool panels between steel purlins, the lamps behind wire.
fn caged(s: Surf) -> Material {
  let panel = tiling(s.uv, 1.25, 0.02, 241u);
  let strand = worley(s.uv * vec2f(60.0, 22.0), 242u).x;
  let wool =
    vec3f(0.5, 0.47, 0.38) * (0.6 + 0.5 * strand) * (0.92 + 0.08 * panel.y);
  let purlin = band(fract(s.uv.x / 2.5) * 2.5, 1.25, 0.14);
  let steel = vec3f(0.1, 0.16, 0.2);
  let wire = repeated(s.uv, vec2f(0.07));
  let cage = 1.0 - 0.75 * max(stroke(wire.x, 0.008), stroke(wire.y, 0.008));
  let albedo =
    mix(mix(vec3f(0.1), wool, panel.x), steel, purlin) * (1.0 - 0.25 * damp(s));
  let ceiling =
    Material(albedo, lampGlow(s, lamps()) * cage, 0.4 * purlin, vec3f(0.0));
  return
    embossed(
      s,
      ceiling,
      0.4 * strand * (1.0 - purlin) + panel.x - 3.0 * purlin,
      0.006,
    );
}

/// A post padded in blue to above head height.
fn padded(s: Surf) -> Material {
  let pad = 1.0 - smoothstep(1.8, 1.804, s.p.y);
  let seam = band(fract(s.p.y / 0.6) * 0.6, 0.3, 0.008);
  let vinyl =
    vec3f(0.03, 0.1, 0.32)
      * (0.9 + 0.2 * valueNoise(s.uv * 150.0, 243u))
      * (1.0 - 0.5 * seam);
  let post =
    polished(mix(vec3f(0.3, 0.31, 0.3), vinyl, pad), mix(0.5, 0.35, pad));
  return embossed(s, post, pad * (1.0 - seam), 0.006);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return boarded(s);
    }
    case FLOOR, OWNED: {
      return court(s);
    }
    case CEILING: {
      return caged(s);
    }
    case TRIM: {
      return padded(s);
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
