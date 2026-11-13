// Generated from den.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, GRADE, LIGHT, STUFF } from '../../../kit';
import { HOUSEHOLD } from '../../household';

export const DEN_SHADER = wgsl(
  'cube/entities/theme/dwelling/den/config/den',
  /* wgsl */ `
fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(4.4, 2.5, 0.95),
      vec3f(0.008, 0.005, 0.003),
      1,
      vec2f(0.3),
      0.04,
    );
}

fn panelling(s: Surf) -> Material {
  let y = s.p.y;
  let width = 0.14;
  let fx = fract(s.uv.x / width) * width;
  let word = unitOf(cellHash(vec2i(i32(floor(s.uv.x / width)), 0), 0xd0u));
  let groove = within(min(fx, width - fx) - 0.003, 0.005);
  let grain = figure(vec2f(y + word * 23.0, fx + word * 3.0), 0xd1u);
  let knot = worley(vec2f(s.uv.x * 9.0, y * 2.2) + word * 9.0, 0xd2u);
  let eye = within(knot.x - 0.07, 0.05) * step(0.8, knot.y);
  let walnut =
    mix(
      vec3f(0.075, 0.032, 0.013),
      vec3f(0.17, 0.08, 0.03),
      word,
    ) * (0.5 + 0.8 * grain);
  let rail = max(within(y - 0.12, 0.003), within(ROOM.y - 0.09 - y, 0.003));
  let handled =
    1.0 - 0.25 * band(y, 1.1, 0.5) * fbm(s.uv * 3.0, s.seed ^ 0xd3u, 3);
  var albedo =
    mix(walnut, vec3f(0.02, 0.008, 0.004), max(groove, eye) * (1.0 - rail));
  albedo = mix(albedo, vec3f(0.06, 0.026, 0.011) * (0.6 + 0.6 * grain), rail);
  let wall = polished(albedo * handled, 0.42 * (1.0 - groove));
  return
    embossed(
      s,
      wall,
      0.12 * grain - (groove + 0.5 * eye) * (1.0 - rail) + 1.5 * rail,
      0.006,
    );
}

fn shag(s: Surf) -> Material {
  let tuft = worley(s.uv * 95.0, 0xd4u);
  let lie = fbm(s.uv * 5.0, 0xd5u, 3);
  let bald = fbm(s.uv * 0.5, 0xd6u, 3);
  let orange = mix(vec3f(0.2, 0.05, 0.007), vec3f(0.27, 0.11, 0.016), lie);
  let lain = smoothstep(0.55, 0.8, bald);
  let wool =
    mix(orange, vec3f(0.12, 0.04, 0.01), lain)
      * (0.3 + 1.2 * tuft.x)
      * (0.8 + 0.4 * tuft.y);
  return
    embossed(s, matte(wool), (tuft.x + 0.5 * lie) * (1.0 - 0.7 * lain), 0.006);
}

fn beamed(s: Surf) -> Material {
  let pitch = 1.25;
  let across = spaced(s.uv.x, pitch);
  let beam = within(abs(across) - 0.08, 0.004);
  let grain = figure(vec2f(s.uv.y, across * 2.0), 0xd7u);
  let wood = vec3f(0.045, 0.02, 0.009) * (0.5 + 0.9 * grain);
  let stipple = worley(s.uv * 45.0, 0xd8u).x;
  let board =
    vec3f(0.4, 0.3, 0.16)
      * (0.82 + 0.18 * stipple)
      * (1.0 - 0.5 * damp(s))
      * (0.75 + 0.25 * fbm(s.uv * 0.9, s.seed ^ 0xd9u, 3));
  let off = fromLamp(s, 1);
  let r = length(off);
  let globe = within(r - 0.14, 0.006);
  let collar = band(r, 0.155, 0.02);
  let swirl = 0.6 + 0.4 * fbm(off * 30.0, 0xdau, 3);
  let glow =
    lamps().colour * (3.4
      * globe
      * swirl
      * (0.55 + 0.45 * within(r - 0.03, 0.09))
      * burning(s, lamps()));
  var albedo = mix(board, wood, beam);
  albedo = mix(albedo, vec3f(0.3, 0.12, 0.02), globe);
  albedo = mix(albedo, vec3f(0.3, 0.2, 0.05), collar);
  let ceiling = Material(albedo, glow, 0.3 * beam + 0.6 * collar, vec3f(0.0));
  return
    embossed(
      s,
      ceiling,
      3.0 * beam + 0.1 * stipple + 0.3 * beam * grain - 1.0 * globe,
      0.02,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return panelling(s);
    }
    case FLOOR, OWNED: {
      return shag(s);
    }
    case CEILING: {
      return beamed(s);
    }
    case TRIM: {
      return
        polished(
          vec3f(0.06, 0.026, 0.011) * (0.5 + 0.8 * figure(s.uv.yx, 0xd1u)),
          0.42,
        );
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return haze(roomLight(s, m, lamps()), s, AIR, 34.0);
}

/// The frame off a worn home-video tape. Brightness keeps most of its
/// detail and colour is smeared a few hundredths of the screen to the
/// right; every line sits a little off its neighbours, far off inside a band
/// of snow that rolls up the picture, and the bottom lines tear sideways
/// where the heads switch.
fn themeLens(l: Lens) -> vec3f {
  let line = u32(l.uv.y * 262.0);
  let frame = u32(l.time * 30.0);
  let roll = 1.0 - fract(l.time * 0.045);
  let fault = within(abs(l.uv.y - roll) - 0.012, 0.035);
  let shake = unitOf(hashOf(line, frame)) - 0.5;
  let foot = smoothstep(0.955, 0.975, l.uv.y);
  let tear = foot * (0.05 + 0.03 * sin(l.time * 2.3) + 0.04 * shake);
  let uv = vec2f(l.uv.x + shake * (0.0012 + 0.03 * fault) + tear, l.uv.y);

  let sharp =
    0.5 * sceneAt(uv).rgb + 0.25 * (sceneAt(
      uv + vec2f(0.0016, 0.0),
    ).rgb + sceneAt(uv - vec2f(0.0016, 0.0)).rgb);
  var smear = vec3f(0.0);
  for (var tap = 0; tap < 6; tap++) {
    smear += sceneAt(uv - vec2f(0.0035 * f32(tap) + 0.002, 0.0)).rgb;
  }
  smear = smear / 6.0;
  let weights = vec3f(0.3, 0.59, 0.11);
  let colour =
    smear * clamp(
      dot(sharp, weights) / max(dot(smear, weights), 1e-4),
      0.0,
      3.0,
    );
  let film = tonemap((mix(sharp, colour, 0.85) + glowAt(uv) * 0.22) * 1.15);
  let luma = dot(film, weights);
  var tape =
    (vec3f(luma) + (film - vec3f(luma)) * vec3f(1.35, 1.1, 0.9)) * 0.9 + vec3f(
      0.035,
      0.03,
      0.04,
    );
  tape *= 0.94 + 0.06 * cos(l.uv.y * 262.0 * 6.2831853);
  let snow = unitOf(hashOf(hashOf(u32(l.uv.x * 420.0), line), frame));
  let dropout = step(0.997, unitOf(hashOf(line / 2u, frame))) * step(snow, 0.5);
  tape =
    mix(
      tape,
      vec3f(0.85),
      max(
        fault * step(0.72, snow),
        max(0.7 * foot * step(0.55, snow), dropout),
      ),
    );
  tape += (snow - 0.5) * 0.045;
  return tape * vignette(l, 0.3);
}
`,
  CORE,
  HASH,
  FINISH,
  STUFF,
  LIGHT,
  HOUSEHOLD,
  GRADE,
);
