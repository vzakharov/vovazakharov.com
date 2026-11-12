import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern';

const AIR = linear(hex(0x1c_1c_22));

/**
 * The map an artist lays on a model to see how a texture will sit: numbered
 * squares gone unnumbered, a hue for every square, a ring and a cross in
 * each. It was meant to be replaced.
 */
export const TEXTURE_TEST: FloorTheme = {
  name: 'Texture test',
  air: AIR,
  pillar: 0.025,
  dark: 0.05,
  sound: { footing: 'hollow', hum: 120, air: 0.05, echo: 0.9 },
  decor: [
    { thing: 'mannequin', perRoom: 0.4 },
    { thing: 'crate', perRoom: 0.4 },
    { thing: 'monolith', perRoom: 0.15 },
    { thing: 'mirror', perRoom: 0.2 },
  ],
  shader: wgsl(
    'texture-test',
    /* wgsl */ `
/// The test map in squares \`size\` metres across, \`deep\` how strongly coloured.
fn testMap(s: Surf, size: f32, deep: f32) -> Material {
  let at = s.uv / size;
  let square = vec2i(floor(at));
  let f = fract(at) - 0.5;
  // The hue walks the diagonal, so a stretched or mirrored face shows at once.
  let hue = spectrum(f32(square.x + square.y * 3) / 16.0);
  let light = f32((square.x + square.y) & 1);
  var colour = mix(vec3f(0.06), vec3f(0.42), light);
  colour = mix(colour, hue * mix(0.5, 0.95, light), deep);
  let pixel = fwidth(at.x) + fwidth(at.y);
  let ring = 1.0 - smoothstep(0.012, 0.012 + pixel, abs(length(f) - 0.32));
  let cross = 1.0 - smoothstep(0.006, 0.006 + pixel, min(abs(f.x), abs(f.y)));
  let tick = step(0.44, max(abs(f.x), abs(f.y))) * step(abs(fract(at.x * 8.0) - 0.5), 0.12);
  let near = 1.0 - smoothstep(0.08, 0.3, pixel);
  let ink = mix(vec3f(0.9), vec3f(0.02), light);
  colour = mix(colour, ink, near * max(ring, max(0.5 * cross, 0.6 * tick)));
  let seam = ruled(s.uv, size, 0.006);
  colour = mix(colour, vec3f(0.01), seam);
  let scuff = 0.9 + 0.2 * fbm(s.uv * 3.0, s.seed, 3);
  return embossed(s, polished(colour * scuff, 0.35), -seam, 0.002);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return testMap(s, 0.5, 0.8); }
    case FLOOR, OWNED: {
      let m = testMap(s, 1.0, 0.55);
      return Material(m.albedo, m.emission, 0.6, m.relief);
    }
    case CEILING: {
      let m = testMap(s, 1.25, 0.12);
      return Material(m.albedo, lampGlow(s, lamps()), 0.0, m.relief);
    }
    case TRIM: { return polished(vec3f(0.02) + 0.5 * vec3f(chequer(s.uv, 0.05)), 0.3); }
    default: { return stuff(s); }
  }
}
`,
    PATTERN,
    STUFF,
    ordinary('texture-test', {
      lamp: [1.3, 1.32, 1.4],
      ambient: [0.015, 0.015, 0.018],
      grid: 2,
      panel: [0.6, 0.6],
      stutter: 0.05,
      visibility: 55,
      exposure: 1,
      glow: 0.12,
      fringe: 0.004,
      vignette: 0.35,
      noise: 0.012,
    }),
  ),
};
