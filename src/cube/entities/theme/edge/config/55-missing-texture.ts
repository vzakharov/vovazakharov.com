import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern';

const AIR = linear(hex(0x14_02_14));

/**
 * What an engine draws where a texture should have been: magenta and black
 * squares, lit by nothing and so lit in the dark. Here and there a patch of
 * the wall that was meant has loaded after all.
 */
export const MISSING_TEXTURE: FloorTheme = {
  name: 'Missing texture',
  air: AIR,
  pillar: 0.025,
  dark: 0.3,
  sound: { footing: 'hollow', hum: 0, air: 0.02, echo: 1.4 },
  decor: [
    { thing: 'door', perRoom: 0.5 },
    { thing: 'exit-sign', perRoom: 0.2 },
    { thing: 'crate', perRoom: 0.3 },
    { thing: 'monolith', perRoom: 0.1 },
  ],
  shader: wgsl(
    'missing-texture',
    /* wgsl */ `
const MAGENTA = vec3f(1.0, 0.0, 0.86);

/// The placeholder in squares \`size\` metres across, giving off \`glow\` of
/// its own colour.
fn missing(s: Surf, size: f32, glow: f32) -> Material {
  let pink = chequer(s.uv, size);
  let colour = mix(vec3f(0.004), MAGENTA, pink);
  return Material(colour * 0.8, colour * glow, 0.5 * (1.0 - pink), vec3f(0.0));
}

/// 1 on the panels of this wall that found their texture.
fn loaded(s: Surf) -> f32 {
  let panel = tiling(s.uv, 1.25, 0.0, s.seed ^ 0x55u);
  return step(0.86, panel.y);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let wall = missing(s, 0.3125, 0.22);
      let low = 1.0 - smoothstep(1.1, 1.104, s.p.y);
      let meant = mix(plaster(s, vec3f(0.5, 0.46, 0.36)), vec3f(0.07, 0.11, 0.05), low);
      let found = loaded(s);
      return Material(mix(wall.albedo, meant, found), wall.emission * (1.0 - found),
        mix(wall.gloss, 0.1 + 0.3 * low, found), vec3f(0.0));
    }
    case FLOOR, OWNED: {
      let m = missing(s, 0.625, 0.1);
      return Material(m.albedo, m.emission, 0.75, vec3f(0.0));
    }
    case CEILING: {
      let m = missing(s, 0.625, 0.06);
      return Material(m.albedo, m.emission + lampGlow(s, lamps()), 0.0, vec3f(0.0));
    }
    case TRIM: { return missing(s, 0.078125, 0.3); }
    default: { return stuff(s); }
  }
}
`,
    PATTERN,
    FINISH,
    STUFF,
    ordinary('missing-texture', {
      air: AIR,
      lamp: [1.25, 1.05, 1.3],
      ambient: [0.012, 0.004, 0.012],
      grid: 2,
      panel: [0.625, 0.625],
      stutter: 0.25,
      visibility: 45,
      exposure: 1,
      glow: 0.22,
      fringe: 0.006,
      vignette: 0.4,
      noise: 0.015,
    }),
  ),
};
