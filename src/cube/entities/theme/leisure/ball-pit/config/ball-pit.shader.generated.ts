// Generated from ball-pit.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { SHAPE } from '../../shape';

export const BALL_PIT_SHADER = wgsl(
  'cube/entities/theme/leisure/ball-pit/config/ball-pit',
  /* wgsl */ `
fn primary(u: f32) -> vec3f {
  return
    oneOf(
      u,
      vec3f(0.55, 0.03, 0.03),
      vec3f(0.03, 0.14, 0.5),
      vec3f(0.62, 0.45, 0.03),
      vec3f(0.04, 0.36, 0.08),
    );
}

/// A ball's width and its radius, metres.
const BALL = 0.075;
const BALL_RADIUS = 0.039;

/// How far under the floor's plane the heap's top lies at a point, metres:
/// slow dunes, the same for everyone standing there.
fn dune(p: vec2f) -> f32 {
  return
    0.04 * (2.0
      + sin(p.x * 1.7 + 1.9 * sin(p.y * 0.8))
      + sin(p.y * 2.3 + 1.3 * sin(p.x * 1.1)));
}

/// The ball of one cell of one layer of the heap: its centre under the
/// floor's plane, and in \`w\` its own number, 0 to 1. The lower layer sits
/// in the gaps of the upper.
fn ballOf(cell: vec2i, layer: u32) -> vec4f {
  let word = cellHash(cell, 330u + layer);
  let shift = vec2f(f32(word & 0xffffu), f32(word >> 16u)) / 65535.0 - 0.5;
  let at = (vec2f(cell) + 0.5 + 0.5 * f32(layer) + 0.34 * shift) * BALL;
  let down =
    BALL_RADIUS + dune(at) + 0.035 * unitOf(mix32(word)) + 0.05 * f32(layer);
  return vec4f(at.x, -down, at.y, unitOf(word));
}

struct Nearest {
  gap: f32,
  ball: vec4f,
}

/// The ball nearest a point of the heap, and the gap to its skin.
fn nearest(p: vec3f) -> Nearest {
  var best = Nearest(1.0, vec4f(0.0));
  for (var layer = 0u; layer < 2u; layer++) {
    let first = vec2i(floor(p.xz / BALL - 0.5 * f32(layer) - 0.5));
    for (var k = 0; k < 4; k++) {
      let ball = ballOf(first + vec2i(k & 1, k >> 1), layer);
      let gap = length(p - ball.xyz) - BALL_RADIUS;
      if (gap < best.gap) {
        best = Nearest(gap, ball);
      }
    }
  }
  return best;
}

/// Plastic balls a hand across, heaped: the eye's ray is followed under
/// the floor's plane to the ball it lands on, so each is round, hides the
/// ones behind it and lies at its own height.
fn balls(s: Surf) -> Material {
  var p = vec3f(s.uv.x, 0.0, s.uv.y);
  var found = nearest(p);
  for (var i = 0; i < 12; i++) {
    if (found.gap < 0.002 || p.y < -0.3) {
      break;
    }
    p += s.view * found.gap;
    found = nearest(p);
  }
  let round = normalize(p - found.ball.xyz);
  let near = fading(s, 120.0);
  let pit =
    mix(0.22, 1.0, smoothstep(-0.26, -0.03, p.y)) * (0.62 + 0.38 * clamp(
      round.y,
      0.0,
      1.0,
    ));
  let landed = 1.0 - smoothstep(0.004, 0.03, found.gap);
  let plastic = primary(found.ball.w) * pit * mix(0.3, 1.0, landed);
  let heap = mix(vec3f(0.3, 0.24, 0.15) * pit, plastic, mix(0.45, 1.0, near));
  let normal = normalize(mix(s.normal, round, landed * mix(0.35, 1.0, near)));
  return Material(heap, vec3f(0.0), 0.3 * near * landed, normal - s.normal);
}

/// Vinyl pads to the waist, each quilted and its own colour; above them a
/// yellow wall with big dots on it behind a black net.
fn netted(s: Surf) -> Material {
  let h = s.p.y;
  if (h < 1.0) {
    let size = vec2f(0.625, 0.5);
    let at = vec2f(s.uv.x, h) / size;
    let f = abs(fract(at) - 0.5) * 2.0;
    let pillow = pow((1.0 - pow(f.x, 4.0)) * (1.0 - pow(f.y, 4.0)), 0.5);
    let button = smoothstep(0.03, 0.012, length((fract(at) - 0.5) * size));
    let sheen = valueNoise(vec2f(s.uv.x, h) * 180.0, 332u);
    let vinyl =
      primary(unitOf(cellHash(vec2i(floor(at)), 333u)))
        * (0.45 + 0.6 * pillow)
        * (0.93 + 0.1 * sheen);
    return embossed(s, polished(vinyl, 0.4), pillow - 0.4 * button, 0.03);
  }
  let rail = max(band(h, 1.04, 0.08), band(h, 2.2, 0.2));
  let row = floor((h - 1.1) / 0.5);
  let cell = vec2f(s.uv.x + 0.45 * row, h - 1.1) / vec2f(0.9, 0.5);
  let spot = inside(length((fract(cell) - 0.5) * vec2f(0.9, 0.5)) - 0.17);
  let word = cellHash(vec2i(floor(cell)), 334u);
  let wall = mix(plaster(s, vec3f(0.6, 0.5, 0.2)), primary(unitOf(word)), spot);
  let mesh = spun(vec2f(s.uv.x, h), 0.7854);
  let cord = repeated(mesh, vec2f(0.055));
  let net = max(stroke(cord.x, 0.007), stroke(cord.y, 0.007));
  let behind = mix(wall * 0.8, vec3f(0.012), net);
  let padded =
    vec3f(0.03, 0.12, 0.45) * (0.8 + 0.3 * valueNoise(
      vec2f(s.uv.x * 4.0, h * 120.0),
      335u,
    ));
  return
    embossed(
      s,
      polished(mix(behind, padded, rail), 0.1 + 0.3 * rail),
      net + 6.0 * rail,
      0.004,
    );
}

/// White tiles scattered with painted dots, the lamps flush in them.
fn dotted(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.012, 4u);
  let spot = worley(s.uv * 2.2, 336u);
  let dot = inside(spot.x / 2.2 - 0.05 - 0.07 * spot.y) * step(0.35, spot.y);
  let white = vec3f(0.56, 0.55, 0.5) * (0.92 + 0.08 * tile.y);
  let painted = mix(white, primary(spot.y * 1.5 - 0.5) * 1.2, dot);
  return
    embossed(
      s,
      glowing(mix(vec3f(0.3), painted, tile.x), lampGlow(s, lamps())),
      tile.x,
      0.005,
    );
}

/// A post wrapped in foam, ringed blue and green.
fn wrapped(s: Surf) -> Material {
  let ring = step(0.5, fract(s.p.y / 0.5));
  let seam = band(fract(s.p.y / 0.25) * 0.25, 0.125, 0.01);
  let foam =
    mix(
      vec3f(0.03, 0.14, 0.5),
      vec3f(0.04, 0.36, 0.08),
      ring,
    ) * (1.0 - 0.5 * seam);
  return embossed(s, polished(foam, 0.35), 1.0 - seam, 0.01);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return netted(s);
    }
    case FLOOR, OWNED: {
      return balls(s);
    }
    case CEILING: {
      return dotted(s);
    }
    case TRIM: {
      return wrapped(s);
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
