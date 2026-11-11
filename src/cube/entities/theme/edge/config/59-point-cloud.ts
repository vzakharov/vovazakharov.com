import { type FloorTheme, GRADE, HASH, STUFF, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern';
import { SCREEN } from '../lib/screen';

/**
 * The building as a surveyor's scan of it: no surfaces, only the points
 * where a beam came back, coloured by how high each is. The floor keeps
 * the rings of the scanner's sweep; where nothing came back there is
 * nothing.
 */
export const POINT_CLOUD: FloorTheme = {
  name: 'Point cloud',
  air: [0, 0, 0],
  pillar: 0.03,
  dark: 0,
  sound: { footing: 'hollow', hum: 0, air: 0.02, echo: 3 },
  decor: [
    { thing: 'mannequin', perRoom: 0.4 },
    { thing: 'ladder', perRoom: 0.2 },
    { thing: 'chair-stack', perRoom: 0.3 },
    { thing: 'potted-plant', perRoom: 0.3 },
    { thing: 'staircase', perRoom: 0.1 },
  ],
  shader: wgsl(
    'point-cloud',
    /* wgsl */ `
/// How much of a returned point shows at \`s\`: points \`dense\` to the metre,
/// thinning in the room's own patches where the beam was lost. Farther off
/// than a pixel can part them they merge into a mist of the same weight.
fn returned(s: Surf, dense: f32) -> f32 {
  let at = s.uv * dense;
  let pixel = fwidth(at.x) + fwidth(at.y);
  let nearest = worley(at, 71u);
  let size = max(0.17, pixel * 0.9);
  let point = (1.0 - smoothstep(size * 0.5, size, nearest.x)) * (0.45 + 0.75 * nearest.y);
  let mist = smoothstep(0.35, 1.6, pixel);
  let lost = smoothstep(0.34, 0.5, fbm(s.uv * 0.7, s.seed ^ 0x59u, 3));
  return mix(point, 0.22, mist) * lost;
}

/// 1 on the rings the scanner in the room's middle swept over a floor or
/// ceiling, 0.25 between them.
fn swept(s: Surf) -> f32 {
  let out = length(s.p.xz - ROOM.xz * 0.5);
  let ring = abs(fract(out * 3.0 + 0.4 * log(1.0 + out)) - 0.5);
  return mix(0.25, 1.0, 1.0 - smoothstep(0.16, 0.3, ring));
}

/// The colour of a height: violet at the floor through green to red at
/// the ceiling.
fn heightHue(s: Surf) -> vec3f {
  return spectrum(0.76 - 0.76 * clamp(s.p.y / ROOM.y, 0.0, 1.0));
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return matte(vec3f(0.5)); }
    case FLOOR, OWNED, CEILING: { return matte(vec3f(0.5 * swept(s))); }
    case TRIM: { return matte(vec3f(0.8)); }
    default: { return stuff(s); }
  }
}

/// A point shines by how well its surface sent the beam back, which is its
/// brightness; nothing lights anything.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let dense = select(26.0, 34.0, abs(s.normal.y) > 0.5);
  let back = 0.25 + 1.5 * luma(m.albedo) + luma(m.emission);
  return heightHue(s) * (returned(s, dense) * back * 1.6 * exp(-s.far / 34.0));
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, 0.55, 0.002);
  return shown(1.0 - exp(-seen * 1.5)) * vignette(l, 0.3) + grain(l) * 0.006;
}
`,
    PATTERN,
    SCREEN,
    STUFF,
    HASH,
    GRADE,
  ),
};
