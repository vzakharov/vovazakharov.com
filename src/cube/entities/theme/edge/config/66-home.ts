import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern';

const AIR = linear(hex(0x1c_10_08));

/**
 * Under everything, smaller than a quark, somebody's flat: herringbone
 * parquet, striped wallpaper, one warm lamp, and on every wall the carpet
 * that hung over a grandmother's sofa east of Berlin. The one room in the
 * building that was finished, and loved.
 */
export const HOME: FloorTheme = {
  name: 'Home',
  air: AIR,
  pillar: 0.02,
  dark: 0,
  sound: { footing: 'wood', hum: 50, air: 0, echo: 0.3 },
  decor: [
    { thing: 'sofa', perRoom: 0.8 },
    { thing: 'armchair', perRoom: 0.6 },
    { thing: 'floor-lamp', perRoom: 0.6 },
    { thing: 'tv', perRoom: 0.5 },
    { thing: 'bookshelf', perRoom: 0.6 },
    { thing: 'rug', perRoom: 0.5 },
    { thing: 'potted-plant', perRoom: 0.6 },
    { thing: 'radiator', perRoom: 0.4 },
    { thing: 'wall-clock', perRoom: 0.3 },
  ],
  shader: wgsl(
    'home',
    /* wgsl */ `
const MADDER = vec3f(0.3, 0.012, 0.01);
const INDIGO = vec3f(0.008, 0.012, 0.06);
const WOOL = vec3f(0.6, 0.48, 0.3);
const GOLD = vec3f(0.5, 0.27, 0.03);

/// The carpet's colour at knot \`knot\` of \`size\` knots, woven the same in
/// all four quarters: three borders, a field of small flowers, a stepped
/// medallion in the middle.
fn woven(knot: vec2i, size: vec2i) -> vec3f {
  let half = size / 2;
  let a = vec2u(abs(knot - half));
  let h = vec2u(half);
  let inward = min(h.x - a.x, h.y - a.y);
  if (inward < 2u) { return INDIGO; }
  if (inward < 7u) {
    return select(WOOL, MADDER, ((a.x + a.y) % 6u) < 3u);
  }
  if (inward < 9u) { return INDIGO; }
  if (inward < 21u) {
    let run = (a.x + a.y) % 12u;
    let cross = (a.x + 4096u - a.y) % 12u;
    let hook = (min(run, 11u - run) + min(cross, 11u - cross)) % 5u;
    return select(select(GOLD, WOOL, hook == 2u), INDIGO, hook < 2u);
  }
  if (inward < 23u) { return WOOL; }
  let diamond = a.x / 2u + a.y;
  if (diamond < 30u) {
    let ring = (diamond / 3u) % 4u;
    let core = select(select(INDIGO, WOOL, ring == 1u), select(GOLD, MADDER, ring == 3u), ring > 1u);
    return select(core, WOOL, diamond < 3u);
  }
  if (diamond < 33u) { return WOOL; }
  // Small flowers, a lattice of them, each a cross of five knots.
  let cell = vec2u(a.x % 10u, a.y % 10u);
  let petal = abs(vec2i(cell) - vec2i(5));
  let flower = petal.x + petal.y;
  if (flower < 2) { return select(GOLD, WOOL, flower == 0); }
  if ((a.x & a.y & 7u) == 7u) { return INDIGO; }
  return MADDER;
}

fn papered(s: Surf) -> Material {
  let stripe = step(0.5, fract(s.uv.x / 0.16));
  let sprig = worley(vec2f(s.uv.x / 0.16, s.uv.y / 0.2), 97u);
  let ochre = plaster(s, mix(vec3f(0.5, 0.36, 0.17), vec3f(0.42, 0.3, 0.15), stripe));
  let paper = mix(vec3f(0.3, 0.12, 0.06), ochre, smoothstep(0.1, 0.13, sprig.x));
  let skirting = 1.0 - smoothstep(0.12, 0.124, s.p.y);
  let oak = vec3f(0.16, 0.07, 0.025) * (0.6 + 0.6 * fbm(vec2f(s.uv.x * 2.0, s.uv.y * 60.0), 98u, 3));
  let wall = polished(mix(paper, oak, skirting), mix(0.05, 0.45, skirting));
  return embossed(s, wall, 3.0 * skirting + 0.2 * fbm(s.uv * 30.0, 99u, 2), 0.004);
}

fn carpeted(s: Surf) -> Material {
  // Three metres by a metre and a half, hung in the middle of the wall.
  let at = (vec2f(alongWall(s), s.p.y) - vec2f(1.0, 0.55)) / vec2f(3.0, 1.5);
  if (min(at.x, at.y) < 0.0 || max(at.x, at.y) > 1.0) {
    return papered(s);
  }
  let size = vec2i(240, 120);
  let knots = at * vec2f(size);
  let pile = valueNoise(knots * 2.0, 100u);
  let tuft = fract(knots) - 0.5;
  let rug = matte(woven(vec2i(floor(knots)), size) * (0.75 + 0.35 * pile));
  return embossed(s, rug, 1.0 - dot(tuft, tuft) * 1.5 + 2.0, 0.003);
}

/// Herringbone: blocks a tenth of a metre by four tenths, each of its own
/// plank, varnished and walked dull down the middle of the room.
fn parquet(s: Surf) -> Material {
  let at = s.uv / 0.1;
  let cell = vec2i(floor(at));
  let k = ((cell.x - cell.y) % 8 + 8) % 8;
  var block = vec2i(cell.x - k, cell.y);
  var local = vec2f(at.x - f32(block.x), fract(at.y));
  if (k >= 4) {
    block = vec2i(cell.x, cell.y + k - 4);
    local = vec2f(f32(block.y) + 1.0 - at.y, fract(at.x));
  }
  let edge = min(min(local.x, 4.0 - local.x), min(local.y, 1.0 - local.y));
  let joint = smoothstep(0.0, 0.05, edge);
  let plank = unitOf(cellHash(block, 101u + u32(k >= 4)));
  let grain = fbm(vec2f(local.x * 1.5 + plank * 30.0, local.y * 14.0), 102u, 3);
  let oak = mix(vec3f(0.3, 0.14, 0.045), vec3f(0.46, 0.25, 0.09), plank) * (0.7 + 0.5 * grain);
  let worn = fbm(s.uv * 0.8, 103u, 3);
  let wood = polished(oak * mix(0.25, 1.0, joint), 0.3 + 0.3 * worn);
  return embossed(s, wood, joint, 0.0006);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return carpeted(s); }
    case FLOOR, OWNED: { return parquet(s); }
    case CEILING: {
      // A plaster rose round the lamp.
      let out = length(s.p.xz - ROOM.xz * 0.5);
      let rose = (1.0 - smoothstep(0.5, 0.56, out)) * (0.6 + 0.4 * cos(out * 70.0));
      let white = plaster(s, vec3f(0.5, 0.46, 0.38));
      return embossed(s, glowing(white, lampGlow(s, lamps())), rose, 0.02);
    }
    case TRIM: { return polished(vec3f(0.2, 0.09, 0.03) * (0.7 + 0.5 * fbm(vec2f(s.uv.x * 60.0, s.uv.y * 2.0), 104u, 3)), 0.4); }
    default: { return stuff(s); }
  }
}
`,
    PATTERN,
    FINISH,
    STUFF,
    ordinary('home', {
      air: AIR,
      lamp: [2.5, 1.7, 0.85],
      ambient: [0.014, 0.008, 0.004],
      grid: 1,
      panel: [0.4, 0.4],
      stutter: 0,
      visibility: 45,
      exposure: 1.1,
      glow: 0.22,
      fringe: 0.003,
      vignette: 0.45,
      noise: 0.014,
    }),
  ),
};
