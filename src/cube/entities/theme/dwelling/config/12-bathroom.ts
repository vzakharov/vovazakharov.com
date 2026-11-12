import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { DWELLING } from '../lib/home';

const AIR = linear(hex(0x9a_a8_a4));

/**
 * A bathroom the size of a house and no bath in it: mint tiles to the pencil
 * line and white above, a hexagon mosaic under a film of water that something
 * keeps dripping into, bulkhead lamps in steam that never clears.
 */
export const BATHROOM: FloorTheme = {
  name: 'Bathroom',
  air: AIR,
  pillar: 0.02,
  dark: 0.05,
  sound: { footing: 'wet', hum: 50, air: 0.25, echo: 2.6 },
  decor: [
    { thing: 'mirror', perRoom: 1 },
    { thing: 'drain', perRoom: 0.8 },
    { thing: 'pipe', perRoom: 0.8 },
    { thing: 'radiator', perRoom: 0.3 },
    { thing: 'curtain', perRoom: 0.4 },
    { thing: 'wet-floor-sign', perRoom: 0.1 },
    { thing: 'vent', perRoom: 0.4 },
  ],
  shader: wgsl(
    'bathroom',
    /* wgsl */ `
const GLAZED = 0.15;

fn glazed(s: Surf) -> Material {
  let y = s.p.y;
  let at = vec2f(s.uv.x, y);
  let pencil = band(y, 1.065, 0.03);
  let tile = tiling(at, GLAZED, 0.005, 0xc0u);
  let q = repeated(at, vec2f(GLAZED));
  let low = within(y - 1.05, 0.002);
  let gone = step(0.996, tile.y) * (1.0 - pencil);
  let mint = vec3f(0.2, 0.4, 0.33);
  let white = vec3f(0.56, 0.57, 0.53);
  let craze = worley(at * 70.0 + tile.y * 31.0, 0xc1u).x;
  var face = mix(white, mint, low) * (0.9 + 0.14 * fract(tile.y * 9.0)) * (0.93 + 0.1 * smoothstep(0.0, 0.3, craze));
  face = mix(face, vec3f(0.012, 0.014, 0.014), pencil);
  let comb = 0.5 + 0.5 * cos(at.x * 700.0);
  let bed = vec3f(0.22, 0.2, 0.17) * (0.7 + 0.4 * comb);
  let rising = 1.0 - smoothstep(0.0, 0.5, y) + smoothstep(1.9, ROOM.y, y);
  let mould = rising * fbm(at * 5.0, s.seed ^ 0xc2u, 3);
  let grout = mix(vec3f(0.3, 0.3, 0.27), vec3f(0.03, 0.035, 0.025), clamp(1.6 * mould, 0.0, 1.0));
  let seam = tile.x * (1.0 - pencil) + pencil * band(fract(at.x / 0.2) * 0.2, 0.1, 0.19);
  let scale = smoothstep(0.6, 0.75, fbm(vec2f(at.x * 11.0, y * 0.6), s.seed ^ 0xc3u, 3)) * (1.0 - smoothstep(0.2, 1.6, y));
  var albedo = mix(grout, mix(face, bed, gone), seam);
  albedo = mix(albedo, vec3f(0.42, 0.33, 0.2), 0.5 * scale);
  let pillow = seam * (1.0 - 14.0 * dot(q, q) / GLAZED) * (1.0 - gone);
  let wall = polished(albedo, 0.85 * seam * (1.0 - gone) * (1.0 - 0.6 * scale));
  return embossed(s, wall, 0.5 * seam + pillow - 0.6 * gone * seam + 0.1 * gone * comb, 0.004);
}

/// The hexagon of a unit-wide honeycomb a point is in: xy from its middle,
/// zw its column and row.
fn hexagon(p: vec2f) -> vec4f {
  let pitch = vec2f(1.0, 1.7320508);
  let a = repeated(p, pitch);
  let shifted = p - pitch * 0.5;
  let b = repeated(shifted, pitch);
  let own = select(b, a, dot(a, a) < dot(b, b));
  let middle = p - own;
  return vec4f(own, round(middle.x * 2.0), round(middle.y / 0.8660254));
}

fn mosaic(s: Surf) -> Material {
  let hex = hexagon(s.uv / 0.05);
  let reach = max(dot(abs(hex.xy), vec2f(0.5, 0.8660254)), abs(hex.x));
  let joint = smoothstep(0.0, 0.07, 0.5 - reach);
  let column = i32(hex.z);
  let row = i32(hex.w);
  let dot6 = wrapped(column + 3 * (wrapped(row, 4) / 2), 6) == 0 && wrapped(row, 2) == 0;
  let word = unitOf(cellHash(vec2i(column, row), 0xc4u));
  let china = select(vec3f(0.5, 0.5, 0.46), vec3f(0.02, 0.025, 0.03), dot6) * (0.9 + 0.14 * word);
  let dirt = fbm(s.uv * 1.6, 0xc5u, 3);
  let grout = vec3f(0.16, 0.15, 0.12) * (0.5 + 0.7 * dirt);

  let pool = smoothstep(0.42, 0.6, fbm(s.uv * 0.6, 0xc6u, 3));
  let drip = worley(s.uv * 0.9, 0xc7u);
  let beat = fract(s.time * (0.25 + 0.2 * drip.y) + drip.y * 7.0);
  let ring = sin((drip.x - beat * 0.5) * 90.0) * within(abs(drip.x - beat * 0.5) - 0.05, 0.05) * (1.0 - beat);
  let floor = polished(mix(grout, china, joint) * (1.0 - 0.3 * pool), mix(0.55 * joint, 0.96, pool));
  return embossed(s, floor, (joint + 0.5 * word) * (1.0 - pool) + 0.8 * ring * pool, 0.002);
}

fn mouldy(s: Surf) -> Material {
  let spot = worley(s.uv * 38.0, 0xc8u);
  let wet = clamp(damp(s) + smoothstep(0.6, 0.8, fbm(s.uv * 0.5, s.seed ^ 0xc9u, 4)), 0.0, 1.0);
  let colony = within(spot.x - 0.3 * spot.y, 0.12) * wet;
  let blister = smoothstep(0.55, 0.7, fbm(s.uv * 6.0, s.seed ^ 0xcau, 3)) * wet;
  let paint = vec3f(0.5, 0.52, 0.5) * (0.92 + 0.08 * fbm(s.uv * 3.0, 0xcbu, 2));
  var albedo = mix(paint, vec3f(0.03, 0.04, 0.03), 0.85 * colony);

  let off = fromLamp(s, 2);
  let r = length(off);
  let lens = within(r - 0.13, 0.004);
  let rim = band(r, 0.15, 0.035);
  let guard = lens * max(band(off.x, 0.0, 0.012), band(off.y, 0.0, 0.012));
  let ribs = 0.8 + 0.2 * cos(r * 260.0);
  let glow = lamps().colour * (6.0 * lens * ribs * (1.0 - guard) * burning(s, lamps()));
  albedo = mix(albedo, vec3f(0.5, 0.52, 0.5), lens);
  albedo = mix(albedo, vec3f(0.05, 0.055, 0.06), max(rim, guard));
  let ceiling = Material(albedo, glow, 0.35 + 0.3 * wet, vec3f(0.0));
  return embossed(s, ceiling, 0.4 * blister + 3.0 * rim + 2.0 * guard - 0.15 * colony, 0.006);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return glazed(s); }
    case FLOOR, OWNED: { return mosaic(s); }
    case CEILING: { return mouldy(s); }
    case TRIM: { return polished(vec3f(0.5, 0.52, 0.5) * (0.9 + 0.1 * fbm(s.uv * 9.0, 0xcbu, 2)), 0.6); }
    default: { return stuff(s); }
  }
}
`,
    FINISH,
    STUFF,
    DWELLING,
    ordinary('bathroom', {
      air: AIR,
      lamp: [1.25, 1.45, 1.5],
      ambient: [0.012, 0.015, 0.015],
      grid: 2,
      panel: [0.26, 0.26],
      stutter: 0.08,
      visibility: 22,
      exposure: 1,
      glow: 0.24,
      fringe: 0.004,
      vignette: 0.3,
      noise: 0.014,
    }),
  ),
};
