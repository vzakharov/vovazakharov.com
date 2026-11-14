// Generated from mall-atrium.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { SHAPE } from '../../shape';

export const MALL_ATRIUM_SHADER = wgsl(
  'cube/entities/theme/leisure/mall-atrium/config/mall-atrium',
  /* wgsl */ `
fn stone(uv: vec2f, own: f32) -> vec3f {
  let cloud = fbm(uv * 1.3 + own * 17.0, 246u, 3);
  let vein =
    1.0 - smoothstep(
      0.0,
      0.07,
      abs(fbm(uv * 2.2 + cloud * 1.6 + own * 31.0, 247u, 4) - 0.5),
    );
  return
    mix(
      vec3f(0.56, 0.5, 0.4) * (0.86 + 0.2 * cloud),
      vec3f(0.27, 0.19, 0.12),
      0.65 * vein,
    );
}

/// Cream marble in big squares, a green diamond let in where four meet, a
/// red granite border round every room.
fn marbled(s: Surf) -> Material {
  let size = 0.8;
  let tile = tiling(s.uv, size, 0.004, 245u);
  let corner = repeated(s.uv + size * 0.5, vec2f(size));
  let diamond = inside(abs(corner.x) + abs(corner.y) - 0.11);
  let speckle = fbm(s.uv * 9.0, 248u, 3);
  let green = vec3f(0.015, 0.075, 0.05) * (0.6 + 0.8 * speckle);
  let q = fract(s.uv / ROOM.xz) * ROOM.xz;
  let border = stroke(roundBox(q - 2.5, vec2f(2.1), 0.0), 0.18);
  let red = vec3f(0.22, 0.06, 0.04) * (0.6 + 0.8 * worley(s.uv * 60.0, 250u).x);
  let laid = mix(mix(stone(s.uv, tile.y), green, diamond), red, border);
  let wear = fbm(s.uv * 0.8, 244u, 3);
  let floor = polished(laid * mix(0.45, 1.0, tile.x), 0.07 - 0.03 * wear);
  return
    embossed(s, floor, 2.0 * fbm(s.uv * 2.2, 243u, 3) + 0.4 * tile.y, 0.003);
}

/// A row of shops: stone piers, a steel shutter down between each pair and
/// a lit sign box over it with nothing on it.
fn shuttered(s: Surf) -> Material {
  let h = s.p.y;
  let bay = 2.5;
  let along = fract(s.uv.x / bay) * bay;
  let word = hashOf(bitcast<u32>(i32(floor(s.uv.x / bay))), 249u);
  let pier = 1.0 - smoothstep(0.16, 0.164, min(along, bay - along));
  let fascia = smoothstep(1.9, 1.904, h);
  let rib = sin(fract(h / 0.075) * 3.1416);
  let brushed = valueNoise(vec2f(s.uv.x * 5.0, h * 260.0), 251u);
  let slot = repeated(vec2f(s.uv.x, h), vec2f(0.045, 0.075));
  let punched =
    inside(roundBox(slot, vec2f(0.014, 0.006), 0.005)) * band(h, 1.25, 0.55);
  let foot = 1.0 - smoothstep(0.07, 0.074, h);
  let steel =
    vec3f(0.36, 0.38, 0.39) * (0.45 + 0.6 * rib) * (0.88 + 0.16 * brushed);
  let open = unitOf(word) < 0.2;
  let shop = select(vec3f(0.0), vec3f(1.6, 1.25, 0.8), open);
  let luck = unitOf(mix32(word));
  let trying = step(0.4, unitOf(hashOf(word, u32(s.time * 11.0))));
  let live = select(select(1.0, trying, luck < 0.22), 0.0, luck < 0.1);
  let tint =
    oneOf(
      unitOf(mix32(word ^ 0x9u)),
      vec3f(1.0, 0.82, 0.74),
      vec3f(0.7, 0.95, 1.0),
      vec3f(1.0, 0.95, 0.6),
      vec3f(0.78, 1.0, 0.8),
    );
  let signBox =
    roundBox(vec2f(along - bay * 0.5, h - 2.1), vec2f(1.0, 0.13), 0.0);
  let frame = max(stroke(signBox, 0.025), 1.0 - inside(signBox));
  let tubes = 0.75 + 0.25 * cos((along - bay * 0.5) * 9.0);
  let sign = tint * (1.5 * tubes * live * (1.0 - frame));
  var albedo =
    mix(mix(steel, vec3f(0.12, 0.125, 0.13), foot), vec3f(0.01), punched);
  var glow = shop * punched;
  var gloss = 0.5;
  var height = rib - punched + 2.0 * foot;
  if (fascia > 0.5) {
    albedo = mix(tint * 0.5, vec3f(0.05, 0.05, 0.055), frame);
    glow = sign;
    gloss = 0.6;
    height = 6.0 * frame + 3.0;
  }
  if (pier > 0.5) {
    albedo =
      stone(vec2f(s.uv.x, h) * 0.8, f32(word & 7u)) * mix(
        1.0,
        0.55,
        band(h, 1.9, 0.05) + foot,
      );
    glow = vec3f(0.0);
    gloss = 0.7;
    height = 8.0;
  }
  return embossed(s, Material(albedo, glow, gloss, vec3f(0.0)), height, 0.004);
}

/// White plaster stepping up to a skylight, its glazing bars across a sky
/// that is the same flat white in every room.
fn skylit(s: Surf) -> Material {
  let d = roundBox(s.p.xz - ROOM.xz * 0.5, vec2f(1.3), 0.0);
  let step1 = smoothstep(0.0, 0.02, d);
  let step2 = smoothstep(0.3, 0.32, d);
  let white =
    plaster(s, vec3f(0.56, 0.55, 0.5))
      * (0.72 + 0.14 * step1 + 0.14 * step2)
      * (1.0 - 0.3 * damp(s));
  let bar = repeated(s.p.xz - ROOM.xz * 0.5, vec2f(0.65));
  let bars = max(stroke(bar.x, 0.035), stroke(bar.y, 0.035));
  let sky = 0.55 + 0.6 * fbm(s.uv * 0.7, 252u, 4);
  let ceiling =
    glowing(
      mix(white, vec3f(0.3), bars * (1.0 - step1)),
      lampGlow(s, lamps())
        * vec3f(0.8, 0.92, 1.08)
        * (0.028 * sky * (1.0 - 0.9 * bars)),
    );
  return embossed(s, ceiling, step1 + step2, 0.04);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return shuttered(s);
    }
    case FLOOR, OWNED: {
      return marbled(s);
    }
    case CEILING: {
      return skylit(s);
    }
    case TRIM: {
      return polished(stone(s.uv * 0.8, 3.0), 0.7);
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
  SHAPE,
  LIGHT,
);
