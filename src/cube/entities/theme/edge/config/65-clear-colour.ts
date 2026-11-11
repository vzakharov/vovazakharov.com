import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, GRADE, LIGHT, STUFF, vec3f, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern';
import { SCREEN } from '../lib/screen';

/** The blue a frame is wiped to before anything is drawn in it. */
const CLEAR = linear(hex(0x64_95_ed));

/**
 * The colour a frame is cleared to, with next to nothing drawn over it:
 * walls a shade off the air they stand in, lamps a paler patch of the same
 * blue, the whole of it stepping in bands where a gradient ran out of
 * numbers.
 */
export const CLEAR_COLOUR: FloorTheme = {
  name: 'Clear colour',
  air: CLEAR,
  pillar: 0.02,
  dark: 0.15,
  sound: { footing: 'soft', hum: 0, air: 0, echo: 4 },
  decor: [
    { thing: 'door', perRoom: 0.3 },
    { thing: 'bench', perRoom: 0.2 },
    { thing: 'balloon', perRoom: 0.15 },
  ],
  shader: wgsl(
    'clear-colour',
    /* wgsl */ `
const CLEAR = ${vec3f(CLEAR)};

fn lamps() -> Lamps {
  return Lamps(vec3f(1.0), vec3f(0.06), 1, vec2f(0.8, 0.8), 0.0);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL, FLOOR, OWNED, TRIM: { return matte(vec3f(0.5)); }
    case CEILING: { return glowing(vec3f(0.5), lampGlow(s, lamps()) * 0.05); }
    default: { return stuff(s); }
  }
}

/// Everything is the clear colour, lighter or darker by the light on it and
/// by what is drawn on it, and is back to the plain colour a few rooms off.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let white = Material(vec3f(1.0), vec3f(0.0), 0.0, m.relief);
  let light = luma(roomLight(s, white, lamps()));
  let drawn = 0.4 + 1.2 * luma(m.albedo);
  // Each way a face can look is its own shade, so a corner shows as a step.
  let facing = 1.0 + 0.16 * s.normal.y - 0.1 * abs(s.normal.x) + 0.04 * abs(s.normal.z);
  let shade = mix(0.5, 1.2, clamp(light * 0.75, 0.0, 1.0)) * drawn * facing * cornerShade(s);
  let colour = CLEAR * shade + mix(CLEAR, vec3f(1.0), 0.6) * luma(m.emission);
  return mix(CLEAR, colour, exp(-s.far / 18.0));
}

fn themeLens(l: Lens) -> vec3f {
  let seen = shown(sceneAt(l.uv).rgb + glowAt(l.uv) * 0.3);
  return floor(seen * 28.0 + 0.5) / 28.0;
}
`,
    PATTERN,
    SCREEN,
    STUFF,
    LIGHT,
    GRADE,
  ),
};
