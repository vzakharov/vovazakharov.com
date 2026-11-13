// Generated from parking-level.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { STENCIL } from '../../stencil';

export const PARKING_LEVEL_SHADER = wgsl(
  'cube/entities/theme/workplace/parking-level/config/parking-level',
  /* wgsl */ `
/// 1 on an arrow painted along x, a metre and a bit long, pointing east.
fn arrowMark(at: vec2f) -> f32 {
  let soft = clamp(fwidth(at.x) + fwidth(at.y), 0.003, 0.2);
  let shaft =
    (1.0 - smoothstep(0.07, 0.07 + soft, abs(at.y)))
      * smoothstep(-0.6 - soft, -0.6, at.x)
      * (1.0 - smoothstep(0.1, 0.1 + soft, at.x));
  let head =
    (1.0 - smoothstep(0.0, soft, abs(at.y) - (0.6 - at.x) * 0.48)) * smoothstep(
      0.1 - soft,
      0.1,
      at.x,
    );
  return clamp(shaft + head, 0.0, 1.0);
}

fn tarmac(s: Surf) -> Material {
  let stones = valueNoise(s.uv * 150.0, 91u);
  let patchy = fbm(s.uv * 0.55, 92u, 4);
  let ground =
    vec3f(0.07, 0.07, 0.074) * (0.65 + 0.5 * stones) * (0.7 + 0.6 * patchy);

  // Two bays a room against its north side, the lane along its south.
  let depth = 3.3;
  let bay = i32(floor(s.p.x / 2.5));
  let toLine = abs(fract(s.p.x / 2.5 + 0.5) - 0.5) * 2.5;
  let soft = clamp(fwidth(s.p.x) + fwidth(s.p.z), 0.003, 0.3);
  let sides =
    (1.0 - smoothstep(0.05, 0.05 + soft, toLine)) * (1.0 - smoothstep(
      depth,
      depth + soft,
      s.p.z,
    ));
  let wear = smoothstep(0.3, 0.55, fbm(s.uv * 4.0, 93u, 3) + 0.3 * stones);
  let white = sides * wear;

  let cell = vec2i(s.cell);
  let count = u32(cell.x * 2 + bay + cell.y * 34);
  let middle = (f32(bay) + 0.5) * 2.5;
  // Read from the lane, looking north.
  let figure = vec2f(s.p.x - middle + 0.3, 3.1 - s.p.z) / 0.22;
  let digits =
    stencilDigit(figure, (count / 10u) % 10u) + stencilDigit(
      figure - vec2f(1.6, 0.0),
      count,
    );
  let turned = select(1.0, -1.0, (hashOf(u32(cell.y), 0x94u) & 1u) == 0u);
  let arrow = arrowMark(vec2f((s.p.x - 2.5) * turned, s.p.z - 4.15));
  let yellow = clamp(digits + arrow, 0.0, 1.0) * wear;

  // What cars left: a dark pool in most bays, rubber along the lane.
  let dripAt = vec2f(s.p.x - middle, s.p.z - 1.5) / vec2f(0.5, 0.8);
  let dripping = step(0.35, unitOf(hashOf(count, s.seed)));
  let oil =
    dripping * smoothstep(
      1.2,
      0.2,
      length(dripAt) + 0.9 * fbm(s.uv * 2.5, 95u, 3),
    );
  let tyres =
    smoothstep(
      0.55,
      0.75,
      fbm(vec2f(s.uv.x * 0.35, s.uv.y * 9.0), 96u, 3),
    ) * smoothstep(depth - 0.2, depth + 0.4, s.p.z);
  let wet = smoothstep(0.56, 0.62, fbm(s.uv * 0.38, 97u, 2));

  var albedo = mix(ground, vec3f(0.5, 0.49, 0.45), 0.8 * white);
  albedo = mix(albedo, vec3f(0.55, 0.36, 0.03), 0.8 * yellow);
  albedo *= (1.0 - 0.7 * oil) * (1.0 - 0.5 * tyres) * (1.0 - 0.45 * wet);
  let gloss = max(max(0.1 + 0.15 * patchy, 0.6 * oil), 0.93 * wet);
  return
    embossed(
      s,
      polished(albedo, gloss),
      (0.4 * stones + 0.6 * patchy)
        * (1.0 - oil)
        * (1.0 - smoothstep(0.46, 0.58, fbm(s.uv * 0.38, 97u, 2))),
      0.0015,
    );
}

fn levelWall(s: Surf) -> Material {
  let h = s.p.y;
  let along = wallAlong(s);
  let pour = fbm(s.uv * 0.8, s.seed ^ 0xa1u, 4);
  let pores = valueNoise(s.uv * 70.0, 0xa2u);
  let joint = min(abs(fract(s.uv.x / 1.25 + 0.5) - 0.5) * 1.25, abs(h - 1.2));
  let groove = 1.0 - smoothstep(0.004, 0.014, joint);
  let paint =
    vec3f(0.42, 0.4, 0.35) * (0.72 + 0.4 * pour) * (0.94 + 0.08 * pores);

  let stripe = smoothstep(1.3, 1.304, h) * (1.0 - smoothstep(1.8, 1.804, h));
  let blue = vec3f(0.035, 0.11, 0.36) * (0.8 + 0.35 * pour);
  let flaked = smoothstep(0.35, 0.5, fbm(s.uv * 6.0, 0xa3u, 3) + 0.2 * pores);
  let figure = stencilDigit(vec2f(along - 0.55, h - 1.36) / 0.19, 5u) * flaked;
  let chevrons = (1.0 - smoothstep(0.34, 0.344, h)) * flaked;
  let warning =
    mix(vec3f(0.02), vec3f(0.55, 0.38, 0.03), hazard(vec2f(along, h), 0.36));

  // Exhaust browns a wall from the top; bumpers black it at their height;
  // salts weep white out of its joints.
  let soot = smoothstep(0.9, 2.3, h) * (0.35 + 0.4 * pour);
  let smear = fbm(vec2f(s.uv.x * 1.4, h * 26.0), 0xa4u, 3);
  let bumped = band(h, 0.52, 0.16) * smoothstep(0.45, 0.7, smear);
  let run = fbm(vec2f(s.uv.x * 5.0, h * 0.5), s.seed ^ 0xa5u, 3);
  let salts =
    smoothstep(0.6, 0.78, run) * smoothstep(1.25, 0.2, h) * (1.0 - chevrons);

  var albedo = mix(paint, blue, stripe);
  albedo = mix(albedo, vec3f(0.5, 0.49, 0.45), 0.85 * figure);
  albedo = mix(albedo, warning, chevrons);
  albedo = mix(albedo, vec3f(0.5, 0.48, 0.44), 0.55 * salts);
  albedo *= (1.0 - 0.5 * groove) * (1.0 - soot) * (1.0 - 0.8 * bumped);
  let wall = polished(albedo, 0.05 + 0.25 * stripe + 0.3 * chevrons);
  return
    embossed(
      s,
      wall,
      0.3 * pores + 0.5 * pour - 2.0 * groove + 0.4 * salts,
      0.003,
    );
}

fn ribbedDeck(s: Surf) -> Material {
  // Precast ribs a metre and a quarter apart, the tubes hung between them.
  let rib = abs(spaced(s.p.x, 1.25));
  let web = 1.0 - smoothstep(0.06, 0.2, rib);
  let mottle = fbm(s.uv * 1.6, 0xa6u, 4);
  let concrete =
    vec3f(0.27, 0.26, 0.235)
      * (0.6 + 0.5 * mottle)
      * (0.4 + 0.6 * web)
      * (1.0 - 0.6 * damp(s));
  // A sprinkler main under the ribs, and the conduit that feeds the tubes.
  let main = (s.p.z - 2.5) / 0.04;
  let pipe = 1.0 - smoothstep(0.9, 1.0, abs(main));
  let round = sqrt(max(1.0 - main * main, 0.0));
  let coupling = band(fract(s.uv.x / 2.5) * 2.5, 1.25, 0.1);
  let red =
    vec3f(0.13, 0.014, 0.011) * (0.25 + 0.75 * round) * (1.0 - 0.3 * coupling);
  let feed = (s.p.z - 1.25) / 0.016;
  let conduit = (1.0 - smoothstep(0.8, 1.0, abs(feed))) * (1.0 - web);
  let glow = lampGlow(s, lamps());
  var albedo =
    mix(
      concrete,
      vec3f(0.3, 0.31, 0.32) * (0.4 + 0.6 * sqrt(max(1.0 - feed * feed, 0.0))),
      conduit,
    );
  albedo = mix(albedo, red, pipe);
  let deck = Material(albedo, glow, 0.35 * pipe, vec3f(0.0));
  return embossed(s, deck, web * (1.0 - pipe) + 0.04 * mottle, 0.5);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return levelWall(s);
    }
    case FLOOR, OWNED: {
      return tarmac(s);
    }
    case CEILING: {
      return ribbedDeck(s);
    }
    case TRIM: {
      // A column wears the level's colours where a bumper would find it.
      let pour = fbm(s.uv * vec2f(5.0, 1.0), 0xa7u, 4);
      let concrete = vec3f(0.36, 0.35, 0.31) * (0.6 + 0.5 * pour);
      let guard = 1.0 - smoothstep(0.9, 0.904, s.p.y);
      let stripes =
        mix(
          vec3f(0.02),
          vec3f(0.55, 0.38, 0.03),
          hazard(vec2f(s.uv.x, s.p.y), 0.3),
        );
      let ring = band(s.p.y, 1.55, 0.5);
      let dressed =
        mix(
          mix(concrete, vec3f(0.035, 0.11, 0.36), ring),
          stripes,
          guard * step(0.3, pour),
        );
      return polished(dressed, 0.25 * max(guard, ring));
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
  STENCIL,
  LIGHT,
);
