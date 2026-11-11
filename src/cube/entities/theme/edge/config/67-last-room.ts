import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';

/**
 * The last room there is, and not all of it: boards under one bulb, plaster
 * as far up the walls as the light goes, and past that the room comes apart
 * into the dots it was made of and then into nothing.
 */
export const LAST_ROOM: FloorTheme = {
  name: 'The last room',
  air: [0, 0, 0],
  pillar: 0.015,
  dark: 0,
  sound: { footing: 'wood', hum: 0, air: 0, echo: 0.9 },
  decor: [
    { thing: 'armchair', perRoom: 1 },
    { thing: 'door', perRoom: 1 },
  ],
  shader: wgsl(
    'last-room',
    /* wgsl */ `
/// How much of the room is still there at a point: all of it under the
/// lamp, less with every step away and every hand's breadth up, in dots a
/// centimetre and a half across, each there or not.
fn remains(s: Surf) -> f32 {
  let out = length(s.p.xz - ROOM.xz * 0.5) / (ROOM.x * 0.5);
  let up = s.p.y / ROOM.y;
  let left = 1.0 - smoothstep(0.3, 1.3, 0.45 * out + 1.1 * up);
  let speck = unitOf(cellHash(vec2i(floor(s.uv * 64.0)), 111u));
  let drift = 0.15 * fbm(s.uv * 1.2, 112u, 3);
  return step(speck, left * left + drift * left);
}

fn there(m: Material, s: Surf) -> Material {
  let left = remains(s);
  return Material(m.albedo * left, m.emission, m.gloss * left, m.relief * left);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      let rough = fbm(s.uv * 18.0, 113u, 3);
      let skirting = 1.0 - smoothstep(0.1, 0.104, s.p.y);
      let wall = mix(plaster(s, vec3f(0.44, 0.4, 0.33)), vec3f(0.1, 0.06, 0.03), skirting);
      return there(embossed(s, polished(wall, 0.3 * skirting), 0.3 * rough + 3.0 * skirting, 0.003), s);
    }
    case FLOOR, OWNED: {
      let board = fract(s.uv.x / 0.12);
      let gap = smoothstep(0.0, 0.05, min(board, 1.0 - board));
      let plank = unitOf(cellHash(vec2i(i32(floor(s.uv.x / 0.12)), 0), 114u));
      let grain = fbm(vec2f(s.uv.x * 70.0, s.uv.y * 2.0), 115u, 3);
      let pine = vec3f(0.36, 0.2, 0.09) * (0.6 + 0.5 * plank) * (0.7 + 0.5 * grain);
      return there(embossed(s, polished(pine * mix(0.2, 1.0, gap), 0.3), gap + 0.2 * grain, 0.003), s);
    }
    case CEILING: { return glowing(vec3f(0.0), lampGlow(s, lamps())); }
    case TRIM: { return there(matte(vec3f(0.3, 0.28, 0.24)), s); }
    default: { return stuff(s); }
  }
}
`,
    FINISH,
    STUFF,
    ordinary('last-room', {
      air: [0, 0, 0],
      lamp: [5, 3.4, 1.7],
      ambient: [0, 0, 0],
      grid: 1,
      panel: [0.12, 0.12],
      stutter: 0,
      visibility: 25,
      exposure: 1,
      glow: 0.35,
      fringe: 0.002,
      vignette: 0.6,
      noise: 0.02,
    }),
  ),
};
