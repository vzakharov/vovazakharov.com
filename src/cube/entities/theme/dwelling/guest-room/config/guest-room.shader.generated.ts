// Generated from guest-room.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, STUFF } from '../../../kit';
import { HOUSEHOLD } from '../../household';

export const GUEST_ROOM_SHADER = wgsl(
  'cube/entities/theme/dwelling/guest-room/config/guest-room',
  /* wgsl */ `
fn quilted(s: Surf) -> Material {
  let y = s.p.y;
  let size = 0.3;
  let a = fract((s.uv.x + y) / size) - 0.5;
  let b = fract((s.uv.x - y) / size) - 0.5;
  let pillow = pow(max(cos(a * 3.1415927) * cos(b * 3.1415927), 0.0), 0.55);
  let stud = length(vec2f(0.5 - abs(a), 0.5 - abs(b))) * size;
  let button = within(stud - 0.016, 0.003);
  let pucker =
    (0.5 + 0.5 * cos(
      atan2(0.5 - abs(b), 0.5 - abs(a)) * 16.0 + a * 9.0,
    )) * within(stud - 0.09, 0.07);
  let weave = valueNoise(vec2f(s.uv.x * 40.0, y * 900.0), 0x101u);
  let faded = 0.8 + 0.25 * fbm(s.uv * 0.9, s.seed ^ 0x102u, 3);
  let satin =
    vec3f(0.4, 0.15, 0.17)
      * (0.9 + 0.1 * weave)
      * faded
      * (0.72 + 0.28 * pillow);
  let skirting = within(y - 0.15, 0.004);
  let pelmet = within(ROOM.y - 0.1 - y, 0.004);
  let trim = max(skirting, pelmet);
  var albedo = mix(satin, satin * 0.6, button);
  albedo = mix(albedo, vec3f(0.5, 0.47, 0.42), trim);
  let wall = polished(albedo, mix(0.5 + 0.2 * pillow, 0.45, trim));
  let height =
    (pillow
      - 0.12 * pucker
      - 0.35 * button
      + 0.01 * weave) * (1.0 - trim) + 1.4 * trim;
  return embossed(s, wall, height, 0.028);
}

/// The dents a bed's four feet left in the room's carpet, 0 to 1.
fn dented(s: Surf) -> f32 {
  let middle =
    vec2f(
      1.4 + 2.2 * unitOf(s.seed ^ 0x103u),
      1.4 + 2.2 * unitOf(mix32(s.seed ^ 0x104u)),
    );
  let lengthwise = unitOf(mix32(s.seed ^ 0x105u)) > 0.5;
  let half = select(vec2f(0.45, 0.95), vec2f(0.95, 0.45), lengthwise);
  let foot = length(abs(s.p.xz - middle) - half);
  return within(foot - 0.035, 0.012);
}

fn hoovered(s: Surf) -> Material {
  let stripe = 0.36;
  let lane = floor(s.uv.y / stripe);
  let pushed = lane - 2.0 * floor(lane * 0.5);
  let seam = band(fract(s.uv.y / stripe) * stripe, 0.0, 0.01);
  let pile = valueNoise(s.uv * 220.0, 0x106u);
  let nap = fbm(vec2f(s.uv.x * 3.0, s.uv.y * 14.0), 0x107u, 3);
  let tread = smoothstep(0.6, 0.8, fbm(s.uv * 0.4, 0x108u, 3));
  let dent = dented(s);
  let cream =
    vec3f(0.5, 0.45, 0.36)
      * (0.86 + 0.14 * pushed + 0.06 * nap)
      * (1.0 - 0.1 * seam);
  let wool =
    cream * (0.8 + 0.25 * pile) * (1.0 - 0.18 * tread) * (1.0 - 0.4 * dent);
  return
    embossed(
      s,
      matte(wool),
      pile + 0.6 * pushed + 0.5 * nap - 4.0 * dent,
      0.003,
    );
}

fn pleated(s: Surf) -> Material {
  let off = fromLamp(s, 1);
  let r = length(off);
  let turn = atan2(off.y, off.x);
  let pleat = 0.5 + 0.5 * cos(turn * 40.0);
  let shade = within(r - 0.2 - 0.004 * pleat, 0.005);
  let braid = band(r, 0.19, 0.016);
  let rose = within(r - 0.34, 0.006) * (1.0 - shade);
  let leaves = 0.5 + 0.5 * cos(turn * 9.0);
  let glow =
    lamps().colour
      * vec3f(1.0, 0.72, 0.68)
      * (2.4
        * shade
        * (0.55 + 0.25 * pleat + 0.4 * within(r - 0.05, 0.1))
        * burning(s, lamps()));
  let cornice = within(toNearestSide(s) - 0.09, 0.07);
  let white = plaster(s, vec3f(0.5, 0.46, 0.43)) * (1.0 - 0.4 * damp(s));
  var albedo = mix(white, vec3f(0.5, 0.26, 0.26) * (0.7 + 0.3 * pleat), shade);
  albedo = mix(albedo, vec3f(0.42, 0.3, 0.1), braid);
  return
    embossed(
      s,
      glowing(albedo, glow),
      rose * (0.6 + 0.4 * leaves * smoothstep(0.2, 0.34, r))
        + 1.5 * cornice
        - 2.0 * shade,
      0.012,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return quilted(s);
    }
    case FLOOR, OWNED: {
      return hoovered(s);
    }
    case CEILING: {
      return pleated(s);
    }
    case TRIM: {
      return polished(plaster(s, vec3f(0.5, 0.47, 0.42)), 0.45);
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
