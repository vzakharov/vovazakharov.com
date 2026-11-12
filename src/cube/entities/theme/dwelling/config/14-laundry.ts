import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { DWELLING } from '../lib/dwelling.shader';

const AIR = linear(hex(0x0d_10_10));

/**
 * The laundry under the house: blockwork painted pipe-blue to the waist and
 * cream above, oxide-red floor paint worn through to the slab where the
 * baskets went, bare joists and a copper pipe overhead, tubes on battens.
 */
export const LAUNDRY: FloorTheme = {
  name: 'Laundry',
  air: AIR,
  pillar: 0.02,
  dark: 0.15,
  sound: { footing: 'concrete', hum: 100, air: 0.55, echo: 1.3 },
  decor: [
    { thing: 'pipe', perRoom: 1.2 },
    { thing: 'drain', perRoom: 0.6 },
    { thing: 'tank', perRoom: 0.3 },
    { thing: 'cardboard-box', perRoom: 0.5 },
    { thing: 'bin', perRoom: 0.3 },
    { thing: 'socket', perRoom: 0.6 },
    { thing: 'ladder', perRoom: 0.15 },
    { thing: 'vent', perRoom: 0.5 },
  ],
  shader: wgsl(
    'laundry',
    /* wgsl */ `
fn blockwork(s: Surf) -> Material {
  let y = s.p.y;
  let course = floor(y / 0.2);
  let at = vec2f(s.uv.x / 0.4 + 0.5 * fract(course * 0.5) * 2.0, y / 0.2);
  let f = fract(at);
  let edge = min(min(f.x, 1.0 - f.x) * 0.4, min(f.y, 1.0 - f.y) * 0.2);
  let face = smoothstep(0.004, 0.012, edge);
  let word = unitOf(cellHash(vec2i(floor(at)), 0xe0u));
  let pit = worley(s.uv * 130.0, 0xe1u);
  let pore = within(pit.x - 0.25, 0.1) * step(0.5, pit.y);
  let low = within(y - 1.1, 0.004);
  let coat = mix(vec3f(0.48, 0.44, 0.33), vec3f(0.07, 0.15, 0.2), low) * (0.92 + 0.12 * word);
  let salt = (1.0 - smoothstep(0.0, 0.45, y)) * smoothstep(0.45, 0.75, fbm(s.uv * vec2f(3.0, 6.0), s.seed ^ 0xe2u, 4));
  let weep = smoothstep(0.66, 0.74, fbm(vec2f(s.uv.x * 9.0, y * 0.5), s.seed ^ 0xe3u, 3))
    * smoothstep(ROOM.y, 0.3, y) * step(0.5, unitOf(wallWord(s)));
  var albedo = coat * (1.0 - 0.45 * pore) * mix(0.7, 1.0, face);
  albedo = mix(albedo, vec3f(0.5, 0.5, 0.47), 0.8 * salt);
  albedo = mix(albedo, vec3f(0.2, 0.08, 0.025), 0.6 * weep);
  let wall = polished(albedo, (0.45 - 0.3 * pore) * (1.0 - salt) * face);
  return embossed(s, wall, face - 0.25 * pore + 0.3 * salt * pit.x, 0.005);
}

fn floorPaint(s: Surf) -> Material {
  let wear = fbm(s.uv * 0.45, 0xe4u, 4) + 0.12 * fbm(s.uv * 9.0, 0xe5u, 3);
  let bare = smoothstep(0.66, 0.72, wear);
  let grit = worley(s.uv * 60.0, 0xe6u);
  let slab = vec3f(0.17, 0.165, 0.15) * (0.8 + 0.25 * grit.y) * (0.85 + 0.2 * fbm(s.uv * 2.0, 0xe7u, 3));
  let red = vec3f(0.2, 0.04, 0.026) * (0.85 + 0.2 * fbm(s.uv * 30.0, 0xe8u, 2));
  let vein = abs(fbm(s.uv * 0.7, 0xe9u, 4) - 0.5);
  let crack = within(vein - 0.0015, 0.002) * smoothstep(0.45, 0.6, fbm(s.uv * 0.25, 0xe9u + 9u, 2));
  let joint = 1.0 - tiling(s.uv, 2.5, 0.012, 0xeau).x;
  let wet = smoothstep(0.55, 0.7, fbm(s.uv * 0.8, s.seed ^ 0xebu, 3));
  var albedo = mix(red, slab, bare);
  albedo = mix(albedo, vec3f(0.03, 0.028, 0.025), max(crack, joint));
  albedo *= 1.0 - 0.4 * wet;
  let floor = polished(albedo, mix(mix(0.5, 0.12, bare), 0.9, wet) * (1.0 - max(crack, joint)));
  return embossed(s, floor, (0.4 * bare * grit.x - 0.5 * bare - 2.0 * max(crack, joint)) * (1.0 - wet), 0.002);
}

fn joisted(s: Surf) -> Material {
  let pitch = 0.4;
  let across = (fract(s.uv.x / pitch) - 0.5) * pitch;
  let joist = within(abs(across) - 0.024, 0.004);
  let plank = boards(s.uv.yx, 0.14, 2.6, 0xecu);
  let deck = vec3f(0.07, 0.045, 0.025) * (0.5 + 0.7 * figure(plank.at, 0xedu)) * smoothstep(0.0, 0.006, plank.edge);
  let pine = vec3f(0.3, 0.2, 0.09) * (0.55 + 0.6 * figure(vec2f(s.uv.y, across * 3.0), 0xeeu));
  let pipe = band(fract(s.uv.y / 2.5) * 2.5, 0.9, 0.028);
  let flex = band(fract(s.uv.y / 2.5) * 2.5 + 0.03 * sin(s.uv.x * 2.4), 1.7, 0.012);
  let copper = vec3f(0.36, 0.14, 0.05) * (0.7 + 0.5 * fbm(s.uv * vec2f(4.0, 60.0), 0xefu, 2));

  let off = fromLamp(s, 2);
  let tube = within(boxAway(off, vec2f(0.02, 0.6)), 0.004);
  let batten = within(boxAway(off, vec2f(0.045, 0.66)), 0.004);
  let glow = lamps().colour * (9.0 * tube * burning(s, lamps()));
  var albedo = mix(deck, pine, joist);
  albedo = mix(albedo, copper, pipe);
  albedo = mix(albedo, vec3f(0.42, 0.42, 0.4), flex);
  albedo = mix(albedo, vec3f(0.5, 0.5, 0.47), batten);
  let ceiling = Material(albedo, glow, 0.6 * pipe + 0.4 * batten, vec3f(0.0));
  return embossed(s, ceiling, 2.5 * joist + 3.5 * pipe + 3.0 * flex + 4.0 * batten + 1.0 * tube, 0.03);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return blockwork(s); }
    case FLOOR, OWNED: { return floorPaint(s); }
    case CEILING: { return joisted(s); }
    case TRIM: { return polished(vec3f(0.07, 0.15, 0.2) * (0.85 + 0.2 * fbm(s.uv * 12.0, 0xe1u, 2)), 0.4); }
    default: { return stuff(s); }
  }
}
`,
    FINISH,
    STUFF,
    DWELLING,
    ordinary('laundry', {
      air: AIR,
      lamp: [1.5, 1.66, 1.6],
      ambient: [0.006, 0.008, 0.008],
      grid: 2,
      panel: [0.06, 1.2],
      stutter: 0.2,
      visibility: 36,
      exposure: 1,
      glow: 0.16,
      fringe: 0.005,
      vignette: 0.42,
      noise: 0.02,
    }),
  ),
};
