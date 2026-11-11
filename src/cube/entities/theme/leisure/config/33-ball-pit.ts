import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { SHAPES } from '../lib/shapes';

const AIR = linear(hex(0x1a_14_10));

/**
 * Soft play with the pit grown to the size of the building: the floor is
 * balls from wall to wall, the walls are padded to the waist and netted
 * above, and nothing in it has a corner.
 */
export const BALL_PIT: FloorTheme = {
  name: 'Ball pit',
  air: AIR,
  pillar: 0.035,
  dark: 0.02,
  sound: { footing: 'hollow', hum: 100, air: 0.1, echo: 0.4 },
  decor: [
    { thing: 'slide', perRoom: 0.9 },
    { thing: 'balloon', perRoom: 0.8 },
    { thing: 'mattress', perRoom: 0.5 },
    { thing: 'ladder', perRoom: 0.4 },
    { thing: 'bench', perRoom: 0.2 },
    { thing: 'wall-clock', perRoom: 0.1 },
    { thing: 'mannequin', perRoom: 0.05 },
  ],
  shader: wgsl(
    'ball-pit',
    /* wgsl */ `
fn primary(u: f32) -> vec3f {
  return oneOf(u, vec3f(0.55, 0.03, 0.03), vec3f(0.03, 0.14, 0.5), vec3f(0.62, 0.45, 0.03), vec3f(0.04, 0.36, 0.08));
}

/// Plastic balls a hand across lying on more of the same.
fn balls(s: Surf) -> Material {
  let scale = 7.0;
  let top = worley(s.uv * scale, 330u);
  let under = worley(s.uv * scale + 0.5, 331u);
  let reach = clamp(top.x / 0.5, 0.0, 1.0);
  let dome = sqrt(1.0 - reach * reach);
  let low = sqrt(1.0 - clamp(under.x / 0.5, 0.0, 1.0) * clamp(under.x / 0.5, 0.0, 1.0));
  let upper = primary(top.y) * (0.45 + 0.55 * dome);
  let lower = primary(under.y) * (0.2 + 0.35 * low);
  let on = smoothstep(0.0, 0.15, dome);
  let near = 1.0 / (1.0 + s.far * s.far / 30.0);
  let heap = polished(mix(lower, upper, on), 0.45 * near * on);
  return embossed(s, heap, mix(0.3 * low, dome, on), 0.07 * mix(0.25, 1.0, near));
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
    let vinyl = primary(unitOf(cellHash(vec2i(floor(at)), 333u))) * (0.45 + 0.6 * pillow) * (0.93 + 0.1 * sheen);
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
  let padded = vec3f(0.03, 0.12, 0.45) * (0.8 + 0.3 * valueNoise(vec2f(s.uv.x * 4.0, h * 120.0), 335u));
  return embossed(s, polished(mix(behind, padded, rail), 0.1 + 0.3 * rail), net + 6.0 * rail, 0.004);
}

/// White tiles scattered with painted dots, the lamps flush in them.
fn dotted(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.012, 4u);
  let spot = worley(s.uv * 2.2, 336u);
  let dot = inside(spot.x / 2.2 - 0.05 - 0.07 * spot.y) * step(0.35, spot.y);
  let white = vec3f(0.56, 0.55, 0.5) * (0.92 + 0.08 * tile.y);
  let painted = mix(white, primary(spot.y * 1.5 - 0.5) * 1.2, dot);
  return embossed(s, glowing(mix(vec3f(0.3), painted, tile.x), lampGlow(s, lamps())), tile.x, 0.005);
}

/// A post wrapped in foam, ringed blue and green.
fn wrapped(s: Surf) -> Material {
  let ring = step(0.5, fract(s.p.y / 0.5));
  let seam = band(fract(s.p.y / 0.25) * 0.25, 0.125, 0.01);
  let foam = mix(vec3f(0.03, 0.14, 0.5), vec3f(0.04, 0.36, 0.08), ring) * (1.0 - 0.5 * seam);
  return embossed(s, polished(foam, 0.35), 1.0 - seam, 0.01);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return netted(s); }
    case FLOOR, OWNED: { return balls(s); }
    case CEILING: { return dotted(s); }
    case TRIM: { return wrapped(s); }
    default: { return stuff(s); }
  }
}
`,
    FINISH,
    STUFF,
    SHAPES,
    ordinary('ball-pit', {
      air: AIR,
      lamp: [1.15, 1.08, 0.94],
      ambient: [0.014, 0.013, 0.011],
      grid: 2,
      panel: [0.625, 0.625],
      stutter: 0,
      visibility: 60,
      exposure: 1.05,
      glow: 0.14,
      fringe: 0.004,
      vignette: 0.3,
      noise: 0.012,
    }),
  ),
};
