import { hex, linear } from '@/cube/shared/lib/colour';

import { type FloorTheme, GRADE, HASH, STUFF, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern.shader';
import { SCREEN } from '../lib/screen.shader';

const AIR = linear(hex(0xee_e3_c8));

/**
 * No light at all, so no shading: every face is one flat colour out of six,
 * rolled per room, and only an inked line says where one face ends and the
 * next begins. A building as a cut-paper poster of itself.
 */
export const FLAT_FIELDS: FloorTheme = {
  name: 'Flat fields',
  air: AIR,
  pillar: 0.035,
  dark: 0,
  sound: { footing: 'soft', hum: 0, air: 0, echo: 0.2 },
  decor: [
    { thing: 'armchair', perRoom: 0.4 },
    { thing: 'potted-plant', perRoom: 0.5 },
    { thing: 'floor-lamp', perRoom: 0.3 },
    { thing: 'balloon', perRoom: 0.2 },
    { thing: 'door', perRoom: 0.4 },
  ],
  shader: wgsl(
    'flat-fields',
    /* wgsl */ `
const PAPERS = array<vec3f, 6>(
  vec3f(0.85, 0.73, 0.49),
  vec3f(0.71, 0.055, 0.022),
  vec3f(0.81, 0.39, 0.018),
  vec3f(0.006, 0.15, 0.17),
  vec3f(0.008, 0.013, 0.064),
  vec3f(0.85, 0.32, 0.34),
);

/// The room's paper for its face number \`face\`, 0 to 3: four different
/// papers of the six, so no two faces of a room run together.
fn paperOf(s: Surf, face: u32) -> vec3f {
  let roll = hashOf(s.seed, 0x57u);
  let spread = select(vec4u(0u, 2u, 3u, 5u), vec4u(0u, 1u, 3u, 4u), (roll & 64u) != 0u);
  return PAPERS[(roll + spread[face]) % 6u];
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      // The two walls that face each other across a room share a paper.
      return matte(paperOf(s, select(2u, 3u, abs(s.normal.x) > abs(s.normal.z))));
    }
    case FLOOR, OWNED: { return matte(paperOf(s, 0u)); }
    case CEILING: {
      let disc = 1.0 - smoothstep(0.78, 0.8, fromMiddle(s));
      return matte(mix(paperOf(s, 1u), vec3f(0.97, 0.93, 0.8), disc));
    }
    case TRIM: { return matte(vec3f(0.012)); }
    default: { return stuff(s); }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return m.albedo + m.emission;
}

fn themeLens(l: Lens) -> vec3f {
  let ink = max(creaseAt(l, 1.0), creaseAt(l, 2.2));
  let page = mix(sceneAt(l.uv).rgb, vec3f(0.006, 0.006, 0.012), ink);
  return shown(page) * vignette(l, 0.12) + grain(l) * 0.012;
}
`,
    PATTERN,
    SCREEN,
    STUFF,
    HASH,
    GRADE,
  ),
};
