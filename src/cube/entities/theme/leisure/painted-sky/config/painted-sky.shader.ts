// Generated from painted-sky.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, GRADE, LIGHT, STUFF } from '../../../kit';
import { SHAPE } from '../../shape';

export const PAINTED_SKY_SHADER = wgsl(
  'cube/entities/theme/leisure/painted-sky/config/painted-sky',
  /* wgsl */ `
fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(2.7, 2.4, 1.8),
      vec3f(0.07, 0.075, 0.085),
      1,
      vec2f(0.8, 0.8),
      0.0,
    );
}

/// A painter's clouds over \`at\`, 0 (sky) to 1 (the thick of one).
fn paintedCloud(at: vec2f, salt: u32) -> f32 {
  return smoothstep(0.58, 0.64, fbm(at, salt, 4));
}

/// Sky from a pale horizon up, cumulus at head height, two ranges of hills
/// with flowers on the nearer, all of it in emulsion that chips at the foot.
fn mural(s: Surf) -> Material {
  let h = s.p.y;
  let x = s.uv.x;
  let sky =
    mix(
      vec3f(0.5, 0.62, 0.68),
      vec3f(0.08, 0.26, 0.6),
      smoothstep(0.4, 2.3, h),
    );
  let puff = fbm(vec2f(x * 0.8, h * 1.9), 290u, 4) - 0.45 * abs(h - 1.6);
  let cloud = smoothstep(0.38, 0.43, puff);
  let lit =
    mix(
      vec3f(0.42, 0.44, 0.56),
      vec3f(0.74, 0.73, 0.68),
      smoothstep(0.38, 0.62, puff + 0.25 * (h - 1.6)),
    );
  let far = 0.72 + 0.1 * sin(x * 0.8 + 2.0) + 0.05 * sin(x * 2.3);
  let near = 0.42 + 0.13 * sin(x * 1.3) + 0.07 * sin(x * 3.1 + 1.0);
  let bloom = worley(vec2f(x, h) * 9.0, 291u);
  let flower =
    inside(bloom.x / 9.0 - 0.016)
      * step(0.5, bloom.y)
      * inside(h - near + 0.04);
  let petal =
    oneOf(
      bloom.y * 2.0 - 1.0,
      vec3f(0.6, 0.05, 0.04),
      vec3f(0.65, 0.5, 0.04),
      vec3f(0.7, 0.68, 0.62),
      vec3f(0.5, 0.1, 0.4),
    );
  var colour = mix(sky, lit, cloud);
  colour = mix(colour, vec3f(0.1, 0.27, 0.22), inside(h - far));
  colour =
    mix(
      colour,
      vec3f(0.12, 0.36, 0.06) * (0.8 + 0.4 * smoothstep(near - 0.3, near, h)),
      inside(h - near),
    );
  colour = mix(colour, petal, flower);
  let brush = valueNoise(vec2f(x * 14.0, h * 130.0), 292u);
  let chipped =
    step(
      0.9,
      fbm(vec2f(x, h) * 6.0, s.seed ^ 0x93u, 3) + 0.22 * exp(-h / 0.35),
    );
  let coat =
    mix(colour * (0.9 + 0.14 * brush), vec3f(0.36, 0.35, 0.32), chipped);
  return
    embossed(
      s,
      polished(coat, 0.14 * (1.0 - chipped)),
      0.5 * brush - chipped,
      0.002,
    );
}

/// More sky overhead, and round every lamp a sun with its rays painted on.
fn sunned(s: Surf) -> Material {
  let p = s.p.xz - ROOM.xz * 0.5;
  let r = length(p);
  let disc = inside(r - 0.42);
  let wave = 0.06 * sin(atan2(p.y, p.x) * 3.0 + f32(s.seed & 7u));
  let ray =
    step(0.5, fract(atan2(p.y, p.x) * 14.0 / 6.2832))
      * inside(r - 0.98 - wave)
      * (1.0 - inside(r - 0.5));
  let cloud = paintedCloud(s.uv * 0.7, 294u);
  let sky = mix(vec3f(0.07, 0.22, 0.55), vec3f(0.7, 0.7, 0.68), 0.9 * cloud);
  let brush = valueNoise(s.uv * vec2f(120.0, 14.0), 295u);
  let paint = mix(sky, vec3f(0.72, 0.52, 0.04), ray) * (0.9 + 0.14 * brush);
  let level = lampLevel(s, vec2i(0), litOf(s), 0.0);
  return
    embossed(
      s,
      glowing(paint, lamps().colour * (2.2 * disc * level)),
      0.5 * brush,
      0.002,
    );
}

/// Poured rubber crumb: terracotta, with a blue river, green banks and
/// yellow stepping stones laid into it.
fn crumbed(s: Surf) -> Material {
  let crumb = worley(s.uv * 95.0, 296u);
  let lie = fbm(s.uv * 0.33, 297u, 3);
  let river = stroke(lie - 0.5, 0.07);
  let bank = smoothstep(0.64, 0.645, lie);
  let stone = worley(s.uv * 1.1, 298u);
  let step_ = inside(stone.x / 1.1 - 0.16) * step(0.55, stone.y);
  var colour = vec3f(0.3, 0.07, 0.04);
  colour = mix(colour, vec3f(0.05, 0.25, 0.07), bank);
  colour = mix(colour, vec3f(0.03, 0.13, 0.42), river);
  colour = mix(colour, vec3f(0.62, 0.45, 0.03), step_);
  let fleck = mix(0.7, 1.25, crumb.y) * (0.7 + 0.5 * crumb.x);
  return embossed(s, matte(colour * fleck), crumb.x, 0.002);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return mural(s);
    }
    case FLOOR, OWNED: {
      return crumbed(s);
    }
    case CEILING: {
      return sunned(s);
    }
    case TRIM: {
      let stripe = step(0.5, fract((s.p.y + s.uv.x * 0.6) / 0.4));
      return
        polished(
          mix(vec3f(0.6, 0.45, 0.03), vec3f(0.5, 0.04, 0.03), stripe),
          0.55,
        );
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return haze(roomLight(s, m, lamps()), s, AIR, 70.0);
}

/// How sharply the scene's depth breaks at \`uv\`: 0 across a flat face, 1
/// at an outline or a fold.
fn outline(uv: vec2f, by: vec2f) -> f32 {
  let here = 1.0 / max(sceneAt(uv).a, 0.05);
  let east = 1.0 / max(sceneAt(uv + vec2f(by.x, 0.0)).a, 0.05);
  let west = 1.0 / max(sceneAt(uv - vec2f(by.x, 0.0)).a, 0.05);
  let south = 1.0 / max(sceneAt(uv + vec2f(0.0, by.y)).a, 0.05);
  let north = 1.0 / max(sceneAt(uv - vec2f(0.0, by.y)).a, 0.05);
  let bend = abs(east + west - 2.0 * here) + abs(south + north - 2.0 * here);
  return smoothstep(0.012, 0.05, bend / here);
}

/// The frame as a picture book prints it: flat washes in a few steps of
/// light, an ink line round every thing, the paper showing through.
fn themeLens(l: Lens) -> vec3f {
  let seen = tonemap((sceneAt(l.uv).rgb + glowAt(l.uv) * 0.1) * 1.05);
  let light = max(dot(seen, vec3f(0.3, 0.59, 0.11)), 0.02);
  let stepped = (floor(light * 7.0) + 0.5) / 7.0;
  let wash = mix(seen, seen * (stepped / light), 0.7);
  let wobble =
    (vec2f(
      valueNoise(l.pixel * 0.03, 299u),
      valueNoise(l.pixel * 0.03, 300u),
    ) - 0.5) * 3.0;
  let ink = outline(l.uv + wobble / l.size, 1.6 / l.size);
  let tooth =
    0.93
      + 0.07 * valueNoise(l.pixel * 0.7, 301u)
      + 0.03 * valueNoise(l.pixel * 0.05, 302u);
  return
    mix(wash, vec3f(0.07, 0.05, 0.1), 0.88 * ink) * tooth * vignette(l, 0.18);
}
`,
  CORE,
  HASH,
  STUFF,
  LIGHT,
  GRADE,
  SHAPE,
);
