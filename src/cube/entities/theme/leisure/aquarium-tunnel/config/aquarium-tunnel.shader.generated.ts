// Generated from aquarium-tunnel.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { SHAPE } from '../../shape';

export const AQUARIUM_TUNNEL_SHADER = wgsl(
  'cube/entities/theme/leisure/aquarium-tunnel/config/aquarium-tunnel',
  /* wgsl */ `
/// The fish of one layer of a shoal over \`at\` in the water: 0 clear, 1 a
/// fish. Each row swims its own way at its own pace, \`size\` metres long.
fn shoal(at: vec2f, size: f32, t: f32, salt: u32) -> f32 {
  let depth = size * 2.2;
  let berth = size * 4.5;
  let lane = floor(at.y / depth);
  let word = hashOf(bitcast<u32>(i32(lane)), salt);
  let way = select(-1.0, 1.0, unitOf(word) < 0.5);
  let swum = at.x - way * t * size * (0.5 + 1.2 * unitOf(mix32(word)));
  let slot = swum / berth;
  let fish = hashOf(bitcast<u32>(i32(floor(slot))), word);
  let bob = 0.25 * size * sin(t * 1.3 + unitOf(fish) * 40.0);
  var p = vec2f(spaced(swum, berth), spaced(at.y, depth) + bob);
  p.x *= way;
  let trunk = inside(length(vec2f(p.x, p.y * 2.5)) - size * 0.5);
  let fin =
    step(-size * 0.95, p.x)
      * step(p.x, -size * 0.4)
      * inside(abs(p.y) - (-size * 0.38 - p.x) * 0.75);
  return max(trunk, fin) * step(0.4, unitOf(mix32(fish)));
}

/// The tank as seen through a wall: blue going dark with depth, shafts of
/// light leaning through it, two layers of shoal, the great one at the back
/// and the specks that drift down past the glass.
fn tank(s: Surf) -> vec3f {
  let t = s.time;
  let back = behind(s, 9.0);
  let mid = behind(s, 3.0);
  let front = behind(s, 0.5);
  let blue =
    mix(
      vec3f(0.002, 0.014, 0.05),
      vec3f(0.02, 0.22, 0.32),
      smoothstep(-2.0, 5.0, back.y),
    );
  let lean = (back.x + back.y * 0.45) * 0.55;
  let shaft =
    smoothstep(0.5, 0.9, valueNoise(vec2f(lean, t * 0.04), 350u)) * smoothstep(
      -1.0,
      3.5,
      back.y,
    );
  var water = blue * (1.0 + 1.6 * shaft);
  let great =
    repeated(vec2f(back.x - t * 0.3, back.y - 1.6), vec2f(53.0, 200.0));
  let whale =
    max(
      inside(length(vec2f(great.x, great.y * 4.0)) - 4.2),
      inside(abs(great.y) - (great.x - 3.6) * 0.6)
        * step(3.6, great.x)
        * step(great.x, 5.6),
    );
  water = mix(water, vec3f(0.001, 0.006, 0.02), 0.82 * whale);
  water =
    mix(water, blue * 0.35, 0.7 * shoal(back * 0.6 + 40.0, 0.11, t, 351u));
  water =
    mix(water, vec3f(0.002, 0.012, 0.03), 0.9 * shoal(mid, 0.34, t, 352u));
  let speck =
    worley((front + vec2f(0.02 * sin(t * 0.3), t * 0.03)) * 16.0, 353u);
  water +=
    vec3f(0.1, 0.22, 0.25)
      * inside(speck.x / 16.0 - 0.003)
      * step(0.82, speck.y);
  return water;
}

/// Acrylic from a black plinth to a black head, the tank beyond it.
fn windowed(s: Surf) -> Material {
  let h = s.p.y;
  let plinth = 1.0 - smoothstep(0.34, 0.344, h);
  let head = smoothstep(2.16, 2.164, h);
  let joint = stroke(spaced(s.uv.x, 2.5), 0.012);
  if (max(plinth, head) > 0.5) {
    let rock = fbm(vec2f(s.uv.x, h) * 9.0, 354u, 4);
    return
      embossed(
        s,
        polished(vec3f(0.012, 0.014, 0.018) * (0.5 + rock), 0.2),
        rock,
        0.01,
      );
  }
  let scuffed =
    0.006 + 0.02 * smoothstep(
      0.6,
      0.85,
      fbm(vec2f(s.uv.x, h) * 3.0, s.seed ^ 0x55u, 4),
    );
  return
    Material(
      vec3f(scuffed + 0.05 * joint),
      tank(s) * (1.0 - 0.5 * joint),
      0.93,
      vec3f(0.0),
    );
}

/// The water's surface from under it: its bright web, and where the lamp
/// is, the sun.
fn surfaced(s: Surf) -> Material {
  let web = caustics(s.uv * 0.8, s.time);
  let p = s.p.xz - ROOM.xz * 0.5;
  let sun = exp(-dot(p, p) / 0.9) * lampLevel(s, vec2i(0), litOf(s), 0.05);
  let swell = 0.5 + fbm(s.uv * 0.5 + s.time * 0.03, 355u, 3);
  let glow =
    (vec3f(0.004, 0.035, 0.06) + vec3f(
      0.02,
      0.13,
      0.17,
    ) * web) * swell + lamps().colour * (0.75 * sun * (0.5 + web));
  return Material(vec3f(0.01, 0.02, 0.03), glow, 0.0, vec3f(0.0));
}

/// A carpet the colour of deep water, the surface's light moving over it.
fn lapped(s: Surf) -> Material {
  let pile = valueNoise(s.uv * 240.0, 11u);
  let wave = 0.5 + 0.5 * sin(s.uv.x * 9.0 + 2.5 * sin(s.uv.y * 3.1));
  let navy =
    carpet(
      s,
      mix(
        vec3f(0.012, 0.03, 0.07),
        vec3f(0.015, 0.06, 0.1),
        smoothstep(0.75, 0.8, wave),
      ),
    );
  let thrown =
    vec3f(0.005, 0.035, 0.045)
      * caustics(s.uv * 0.7 + 3.0, s.time)
      * (0.6 + 0.6 * pile);
  return embossed(s, glowing(navy, thrown), pile, 0.0015);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return windowed(s);
    }
    case FLOOR, OWNED: {
      return lapped(s);
    }
    case CEILING: {
      return surfaced(s);
    }
    case TRIM: {
      return polished(vec3f(0.012, 0.014, 0.018), 0.5);
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
