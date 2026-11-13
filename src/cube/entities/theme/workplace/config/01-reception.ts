import { hex, linear } from '@/cube/shared/lib/colour';
import type { Box } from '@/cube/shared/outside';

import {
  FINISH,
  type FloorTheme,
  LIGHT,
  type Shrub,
  STUFF,
  sunlit,
  wgsl,
} from '../../kit';

const AIR = linear(hex(0x17_14_0f));

/**
 * The potted plants the planted world stands in floor 1's room, where the
 * doorway's beam finds them: the one by the doorway and the one in the far
 * corner. The decor rolls their places and the light cannot ask it, so they
 * are written here and the page's `reception-shrubs.test.ts` holds them to
 * where it puts them.
 */
export const RECEPTION_SHRUBS: readonly Shrub[] = [
  { at: [4.415, 0.4252], draw: 0.9588 },
  { at: [0.441, 0.585], draw: 0.8749 },
];

/**
 * What else of the planted world's decor stands in the beam, as the boxes
 * it fills, in metres of the shell's frame: a bench. Written here and held to
 * the decor by `reception-beam-boxes.test.ts`, as the plants are.
 */
export const RECEPTION_BEAM_BOXES: readonly Box[] = [
  { min: [0.07, 0, 2.075], max: [0.5, 0.86, 3.575] },
];

/**
 * The whole cube as one room: a reception nobody staffs. Terrazzo, a green
 * dado under cream plaster, and four big panels nobody switched on: the
 * evening sun through the doorway is all its light.
 */
export const RECEPTION: FloorTheme = {
  name: 'Reception',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'tile', hum: 100, air: 0.15, echo: 1.6 },
  decor: [
    { thing: 'potted-plant', perRoom: 2 },
    { thing: 'bench', perRoom: 1 },
    { thing: 'wall-clock', perRoom: 1 },
    { thing: 'notice-board', perRoom: 1 },
  ],
  shader: wgsl(
    'reception',
    /* wgsl */ `
fn terrazzo(s: Surf) -> Material {
  let chips = worley(s.uv * 34.0, 7u);
  let chip = 1.0 - smoothstep(0.24, 0.3, chips.x);
  let pale = vec3f(0.5, 0.46, 0.38);
  let dark = vec3f(0.06, 0.05, 0.045);
  let rust = vec3f(0.3, 0.12, 0.07);
  let tone = mix(mix(pale, dark, step(0.5, chips.y)), rust, step(0.88, chips.y));
  let ground = vec3f(0.2, 0.18, 0.155) * (0.9 + 0.2 * valueNoise(s.uv * 7.0, 8u));
  let strip = tiling(s.uv, 1.25, 0.012, 9u).x;
  let brass = vec3f(0.5, 0.34, 0.1);
  let worn = fbm(s.uv * 0.7, 10u, 3);
  let floor = polished(mix(brass, mix(ground, tone, chip), strip), 0.55 + 0.35 * worn);
  return embossed(s, floor, fbm(s.uv * 2.5, 11u, 3), 0.004);
}

fn panelled(s: Surf) -> Material {
  let h = s.p.y;
  let rough = fbm(s.uv * 22.0, 12u, 3);
  let cream = plaster(s, vec3f(0.52, 0.47, 0.36));
  let green = vec3f(0.035, 0.1, 0.07) * (0.92 + 0.16 * rough);
  let oak = vec3f(0.2, 0.1, 0.045) * (0.6 + 0.6 * fbm(vec2f(s.uv.x * 2.0, h * 70.0), 13u, 3));
  let dado = 1.0 - smoothstep(0.98, 0.984, h);
  let rail = clamp(band(h, 1.02, 0.08) + band(h, 0.06, 0.12), 0.0, 1.0);
  let albedo = mix(mix(cream, green, dado), oak, rail);
  let wall = polished(albedo, mix(mix(0.04, 0.4, dado), 0.5, rail));
  return embossed(s, wall, rough * 0.15 + rail, 0.012);
}

fn tiled(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.016, 4u);
  let pin = step(0.72, valueNoise(s.uv * 110.0, 5u));
  let white = vec3f(0.58, 0.56, 0.5) * (0.93 + 0.07 * tile.y) * (1.0 - 0.3 * pin);
  let albedo = mix(vec3f(0.16, 0.155, 0.14), white, tile.x) * (1.0 - 0.5 * damp(s));
  // The panels are off: milky diffusers, a shade duller than the tiles.
  let panel = lampMask(s.p.xz, 2, vec2f(1.2));
  let prisms = 0.92 + 0.08 * tiling(s.uv, 0.012, 0.004, 6u).x;
  let ceiling = polished(mix(albedo, vec3f(0.33, 0.34, 0.33) * prisms, panel), 0.45 * panel);
  return embossed(s, ceiling, (tile.x - 0.2 * pin) * (1.0 - panel), 0.006);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return panelled(s); }
    case FLOOR, OWNED: { return terrazzo(s); }
    case CEILING: { return tiled(s); }
    default: { return stuff(s); }
  }
}
`,
    FINISH,
    STUFF,
    LIGHT,
    sunlit('reception', {
      air: AIR,
      ambient: [0.022, 0.02, 0.019],
      shrubs: RECEPTION_SHRUBS,
      boxes: RECEPTION_BEAM_BOXES,
      floor: [0.27, 0.24, 0.2],
      walls: [0.26, 0.26, 0.19],
      visibility: 70,
      exposure: 1.5,
      glow: 0.14,
      fringe: 0.004,
      vignette: 0.3,
      noise: 0.012,
    }),
  ),
};
