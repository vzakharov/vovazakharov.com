// Generated from clean-room.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';

export const CLEAN_ROOM_SHADER = wgsl(
  'cube/entities/theme/laboratory/clean-room/config/clean-room',
  /* wgsl */ `
fn accessFloor(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.006, 361u);
  let at = fract(s.uv / 0.625);
  let inset = step(0.1, min(min(at.x, 1.0 - at.x), min(at.y, 1.0 - at.y)));
  // One panel in three is drilled for the air going down.
  let vented = step(0.66, tile.y) * inset;
  let near = 1.0 / (1.0 + s.far * s.far / 40.0);
  let hole = 1.0 - smoothstep(0.22, 0.3, length(fract(s.uv / 0.04) - 0.5));
  let drilled = vented * mix(0.3, hole, near);
  let speck = valueNoise(s.uv * 160.0, 362u);
  let vinyl =
    vec3f(0.5, 0.53, 0.55) * (0.93 + 0.1 * speck) * (0.95 + 0.08 * tile.y);
  let albedo =
    mix(vec3f(0.08, 0.09, 0.1), vinyl, tile.x) * (1.0 - 0.9 * drilled);
  let scuff = fbm(s.uv * 1.1, 363u, 3);
  let panel = polished(albedo, (0.8 - 0.35 * scuff) * (1.0 - drilled));
  return embossed(s, panel, tile.x - hole * vented, 0.002);
}

/// The yellow room seen through a wall's window: its lamps, and the dark
/// shapes of what stands under them.
fn yellowRoom(s: Surf, along: f32) -> vec3f {
  let lampRow = band(s.p.y, 1.68, 0.03) * step(0.3, fract(along * 2.5));
  let kit =
    step(
      s.p.y,
      1.1 + 0.45 * unitOf(
        hashOf(bitcast<u32>(i32(floor(along * 9.0))), s.seed ^ 0x24u),
      ),
    );
  let glow = 0.5 + 0.5 * fbm(vec2f(along * 2.0, s.p.y * 2.0), 364u, 3);
  return
    vec3f(1.0, 0.62, 0.04) * (0.5 * glow * (1.0 - 0.85 * kit) + 5.0 * lampRow);
}

fn cleanWall(s: Surf) -> Material {
  let h = s.p.y;
  let bay = floor(s.uv.x / 1.25);
  let across = fract(s.uv.x / 1.25) * 1.25;
  let toSeam = min(across, 1.25 - across);
  let joint = 1.0 - smoothstep(0.004, 0.009, toSeam);
  let peel = fbm(s.uv * 60.0, 365u, 2);
  let white = vec3f(0.6, 0.63, 0.64) * (0.95 + 0.06 * peel);
  // Louvres to knee height take the air back.
  let grille =
    step(0.08, h) * (1.0 - smoothstep(0.52, 0.524, h)) * step(0.1, toSeam);
  let slat = fract(h / 0.04);
  let gap = grille * (1.0 - smoothstep(0.3, 0.45, slat));
  let glazed =
    step(0.55, unitOf(hashOf(bitcast<u32>(i32(bay)), s.seed ^ 0x36u)));
  let pane = max(abs(across - 0.625) - 0.4, abs(h - 1.4) - 0.34);
  let window = glazed * (1.0 - smoothstep(0.0, 0.006, pane));
  let frame = glazed * (1.0 - smoothstep(0.03, 0.036, pane)) - window;
  let steel = vec3f(0.42, 0.44, 0.46);
  var albedo = mix(white, vec3f(0.07, 0.08, 0.09), max(joint, gap));
  albedo = mix(albedo, steel, max(frame, 1.0 - smoothstep(0.06, 0.064, h)));
  albedo = mix(albedo, vec3f(0.015, 0.012, 0.004), window);
  let gloss = mix(0.35 + 0.3 * frame, 0.95, window);
  let wall =
    Material(albedo, yellowRoom(s, s.uv.x) * window, gloss, vec3f(0.0));
  return
    embossed(
      s,
      wall,
      0.04 * peel + slat * grille - 2.0 * joint - 3.0 * window + 2.0 * frame,
      0.004,
    );
}

fn filterCeiling(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.03, 366u);
  let near = 1.0 / (1.0 + s.far * s.far / 30.0);
  let mesh = fract(s.uv / 0.02) - 0.5;
  let pleat = mix(0.5, smoothstep(0.1, 0.4, abs(mesh.x)), near);
  let face =
    vec3f(0.5, 0.52, 0.52) * (0.7 + 0.3 * pleat) * (0.94 + 0.06 * tile.y);
  let bar = vec3f(0.55, 0.57, 0.58);
  let ceiling =
    Material(
      mix(bar, face, tile.x),
      lampGlow(s, lamps()),
      0.4 * (1.0 - tile.x),
      vec3f(0.0),
    );
  return embossed(s, ceiling, pleat * tile.x * near - 2.0 * tile.x, 0.004);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return cleanWall(s);
    }
    case FLOOR, OWNED: {
      return accessFloor(s);
    }
    case CEILING: {
      return filterCeiling(s);
    }
    case TRIM: {
      let brushed = valueNoise(vec2f(s.uv.x * 8.0, s.uv.y * 260.0), 367u);
      return polished(vec3f(0.5, 0.52, 0.54) * (0.85 + 0.2 * brushed), 0.6);
    }
    default: {
      return stuff(s);
    }
  }
}
`,
  CORE,
  HASH,
  FINISH,
  STUFF,
  LIGHT,
);
