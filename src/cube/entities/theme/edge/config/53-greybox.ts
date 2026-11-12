import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern.shader';

const AIR = linear(hex(0x2a_2b_2d));

/**
 * A level blocked out and never dressed: measuring-grid grey underfoot,
 * builder's orange on every wall with its metre marks, and lamps placed
 * where lamps will go.
 */
export const GREYBOX: FloorTheme = {
  name: 'Greybox',
  air: AIR,
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'concrete', hum: 100, air: 0.05, echo: 1.1 },
  decor: [
    { thing: 'crate', perRoom: 0.8 },
    { thing: 'mannequin', perRoom: 0.3 },
    { thing: 'traffic-cone', perRoom: 0.3 },
    { thing: 'ladder', perRoom: 0.15 },
    { thing: 'staircase', perRoom: 0.1 },
  ],
  shader: wgsl(
    'greybox',
    /* wgsl */ `
/// A measuring grid in \`tone\`: metre squares in two shades, ruled in
/// metres and quarters, a cross on every metre's corner.
fn measured(s: Surf, tone: vec3f, mark: vec3f) -> Material {
  let squares = mix(0.82, 1.0, chequer(s.uv, 1.0));
  let quarters = ruled(s.uv, 0.25, 0.004);
  let metres = ruled(s.uv, 1.0, 0.014);
  let corner = abs(fract(s.uv + 0.5) - 0.5);
  let cross = step(max(corner.x, corner.y), 0.09) * step(min(corner.x, corner.y), 0.012);
  let dust = 0.94 + 0.12 * fbm(s.uv * 1.7, s.seed, 3);
  var colour = tone * squares * dust;
  colour = mix(colour, tone * 1.25, 0.5 * quarters);
  colour = mix(colour, mark, max(metres * 0.85, cross));
  return polished(colour, 0.3);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let orange = vec3f(0.62, 0.21, 0.035);
      // Every wall says how tall it is: a band at one metre, another at two.
      let rule = band(s.p.y, 1.0, 0.03) + band(s.p.y, 2.0, 0.03);
      let m = measured(s, orange, vec3f(0.9, 0.62, 0.36));
      return Material(mix(m.albedo, vec3f(0.07, 0.03, 0.01), rule), m.emission, m.gloss, m.relief);
    }
    case FLOOR, OWNED: { return measured(s, vec3f(0.23, 0.235, 0.24), vec3f(0.5, 0.51, 0.52)); }
    case CEILING: {
      let m = measured(s, vec3f(0.4, 0.4, 0.4), vec3f(0.62, 0.62, 0.62));
      return Material(m.albedo, lampGlow(s, lamps()), 0.0, m.relief);
    }
    case TRIM: {
      let stripe = step(0.5, fract((s.uv.x + s.uv.y) * 4.0));
      return polished(mix(vec3f(0.03, 0.03, 0.03), vec3f(0.75, 0.56, 0.04), stripe), 0.3);
    }
    default: { return stuff(s); }
  }
}
`,
    PATTERN,
    FINISH,
    STUFF,
    ordinary('greybox', {
      lamp: [1.35, 1.35, 1.35],
      ambient: [0.02, 0.02, 0.02],
      grid: 2,
      panel: [1, 1],
      stutter: 0,
      visibility: 60,
      exposure: 1,
      glow: 0.1,
      fringe: 0.003,
      vignette: 0.3,
      noise: 0.01,
    }),
  ),
};
