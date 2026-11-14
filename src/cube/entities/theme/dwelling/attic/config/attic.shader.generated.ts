// Generated from attic.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, STUFF } from '../../../kit';
import { HOUSEHOLD } from '../../household';

export const ATTIC_SHADER = wgsl(
  'cube/entities/theme/dwelling/attic/config/attic',
  /* wgsl */ `
fn brickwork(s: Surf) -> Material {
  let y = s.p.y;
  let course = floor(y / 0.075);
  let at = vec2f(s.uv.x / 0.225 + 0.5 * fract(course * 0.5) * 2.0, y / 0.075);
  let f = fract(at);
  let edge = min(min(f.x, 1.0 - f.x) * 0.225, min(f.y, 1.0 - f.y) * 0.075);
  let face = smoothstep(0.004, 0.011, edge);
  let roll = cellHash(vec2i(floor(at)), 0x130u);
  let fired = unitOf(roll);
  let rough = fbm(s.uv * 45.0, 0x131u, 3);
  var brick =
    mix(
      vec3f(0.25, 0.07, 0.04),
      vec3f(0.12, 0.045, 0.035),
      fired * fired,
    ) * (0.7 + 0.5 * rough);
  brick = mix(brick, vec3f(0.3, 0.2, 0.1), step(0.9, unitOf(mix32(roll))));
  let lime =
    smoothstep(
      0.42,
      0.62,
      fbm(s.uv * vec2f(1.6, 2.4), s.seed ^ 0x132u, 4)
        + 0.25 * rough
        - 0.3 * smoothstep(0.3, 2.0, y),
    );
  brick =
    mix(brick, vec3f(0.44, 0.42, 0.36) * (0.8 + 0.25 * rough), 0.85 * lime);
  let soot =
    smoothstep(
      0.6,
      0.8,
      fbm(vec2f(s.uv.x * 0.9, y * 0.35), s.seed ^ 0x133u, 3),
    ) * smoothstep(0.6, ROOM.y, y);
  let mortar = vec3f(0.3, 0.27, 0.21) * (0.7 + 0.4 * rough);
  let albedo = mix(mortar, brick, face) * (1.0 - 0.75 * soot);
  return
    embossed(
      s,
      matte(albedo),
      face * (1.0 + 0.25 * rough + 0.3 * fired) + 0.2 * lime,
      0.006,
    );
}

fn dusty(s: Surf) -> Material {
  let plank = boards(s.uv, 0.19, 3.4, 0x134u);
  let grain = figure(plank.at, 0x135u);
  let gap = smoothstep(0.0, 0.006, plank.edge);
  let pine =
    mix(
      vec3f(0.14, 0.085, 0.04),
      vec3f(0.22, 0.14, 0.065),
      plank.word,
    ) * (0.55 + 0.7 * grain);
  let nail =
    within(
      length(repeated(s.uv, vec2f(0.4, 0.19)) - vec2f(0.0, 0.05)) - 0.005,
      0.003,
    );
  let walked = smoothstep(0.42, 0.6, fbm(s.uv * 0.5, 0x136u, 4));
  let fur = (1.0 - 0.85 * walked) * (0.7 + 0.3 * fbm(s.uv * 7.0, 0x137u, 3));
  var albedo = pine * mix(0.25, 1.0, gap);
  albedo = mix(albedo, vec3f(0.03, 0.025, 0.02), nail);
  albedo = mix(albedo, vec3f(0.2, 0.19, 0.17), 0.75 * fur * gap);
  let floor = polished(albedo, 0.18 * walked * gap);
  return
    embossed(
      s,
      floor,
      gap * (1.0 + 0.2 * grain) + 0.3 * fur + 0.4 * plank.word,
      0.004,
    );
}

fn raftered(s: Surf) -> Material {
  let pitch = 0.6;
  let across = spaced(s.uv.x, pitch);
  let rafter = within(abs(across) - 0.035, 0.004);
  let lath = boards(s.uv.yx, 0.12, 2.2, 0x138u);
  let felt =
    vec3f(0.035, 0.03, 0.028) * (0.6 + 0.8 * fbm(s.uv * 12.0, 0x139u, 3));
  let slat =
    mix(
      felt,
      vec3f(0.1, 0.065, 0.035) * (0.5 + 0.8 * figure(lath.at, 0x13au)),
      smoothstep(0.012, 0.02, lath.edge),
    );
  let oak =
    vec3f(0.16, 0.1, 0.05) * (0.45 + 0.8 * figure(
      vec2f(s.uv.y, across * 2.5),
      0x13bu,
    ));

  let off = fromLamp(s, 1);
  let r = length(off);
  let bulb = within(r - 0.034, 0.004);
  let holder = band(r, 0.05, 0.018);
  let on = burning(s, lamps());
  let glow = lamps().colour * (14.0 * bulb * on);
  var albedo = mix(slat, oak, rafter);
  albedo = mix(albedo, vec3f(0.03), holder);
  albedo = mix(albedo, vec3f(0.5, 0.45, 0.35), bulb);
  return
    embossed(
      s,
      glowing(albedo, glow),
      3.0 * rafter + 0.5 * smoothstep(0.0, 0.02, lath.edge) + 2.0 * holder,
      0.03,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return brickwork(s);
    }
    case FLOOR, OWNED: {
      return dusty(s);
    }
    case CEILING: {
      return raftered(s);
    }
    case TRIM: {
      return
        polished(
          vec3f(0.16, 0.1, 0.05) * (0.45 + 0.8 * figure(
            s.uv.yx * vec2f(1.0, 2.0),
            0x13bu,
          )),
          0.1,
        );
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
  HOUSEHOLD,
);
