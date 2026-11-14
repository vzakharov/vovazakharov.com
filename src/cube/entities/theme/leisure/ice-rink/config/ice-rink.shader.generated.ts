// Generated from ice-rink.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';
import { SHAPE } from '../../shape';

export const ICE_RINK_SHADER = wgsl(
  'cube/entities/theme/leisure/ice-rink/config/ice-rink',
  /* wgsl */ `
/// The arcs skates leave: each lattice cell a turn round its own point.
fn cut(uv: vec2f, scale: f32, salt: u32) -> f32 {
  let turn = worley(uv * scale, salt);
  return stroke(turn.x / scale - (0.12 + 0.3 * turn.y) / scale, 0.004);
}

/// Ice over the lines of a hockey rink, clouded where it froze fast and
/// scored where it was skated.
fn ice(s: Surf) -> Material {
  let q = fract(s.uv / ROOM.xz) * ROOM.xz;
  let mid = q - ROOM.xz * 0.5;
  let goalmouth =
    min(length(q - vec2f(2.5, 0.0)), length(q - vec2f(2.5, 5.0))) - 0.95;
  let red =
    max(
      max(stroke(mid.x, 0.3), stroke(length(mid) - 1.5, 0.06)),
      stroke(goalmouth, 0.05),
    );
  let blue = max(stroke(q.y - 4.1, 0.3), inside(length(mid) - 0.16));
  let crease = inside(goalmouth);
  let frost = fbm(s.uv * 1.3, 303u, 4);
  let clear = vec3f(0.5, 0.58, 0.62) * (0.8 + 0.35 * frost);
  var colour = mix(clear, vec3f(0.3, 0.5, 0.66), 0.5 * crease);
  colour = mix(colour, vec3f(0.03, 0.1, 0.45), 0.8 * blue);
  colour = mix(colour, vec3f(0.5, 0.03, 0.04), 0.8 * red);
  let cuts =
    max(
      max(cut(s.uv, 0.9, 304u), cut(s.uv + 3.3, 1.7, 305u)),
      cut(s.uv + 7.1, 0.45, 306u),
    );
  let snow = smoothstep(0.55, 0.9, fbm(s.uv * 3.0, 307u, 3));
  let scored =
    mix(colour, vec3f(0.66, 0.7, 0.72), max(0.75 * cuts, 0.5 * snow));
  let sheet = polished(scored, 0.72 * (1.0 - 0.6 * snow) * (1.0 - 0.7 * cuts));
  return
    embossed(
      s,
      sheet,
      2.0 * fbm(s.uv * 2.2, 308u, 3) - 0.6 * cuts + 0.5 * snow,
      0.003,
    );
}

/// Rows of seats in the dark, as far behind the glass as \`at\` was taken.
fn seats(at: vec2f) -> vec3f {
  let row = floor((at.y - 0.4) / 0.42);
  let seat =
    vec2f(fract(at.x / 0.5) - 0.5, fract((at.y - 0.4) / 0.42) - 0.45) * vec2f(
      0.5,
      0.42,
    );
  let back = inside(roundBox(seat, vec2f(0.2, 0.15), 0.06)) * step(0.0, row);
  let word =
    hashOf(bitcast<u32>(i32(floor(at.x / 0.5))), bitcast<u32>(i32(row)));
  let shell =
    mix(
      vec3f(0.012, 0.02, 0.06),
      vec3f(0.05, 0.012, 0.012),
      step(0.93, unitOf(word)),
    );
  return shell * back * exp(-max(row, 0.0) * 0.22);
}

/// White boards with a yellow kick plate and a blue rail, blocks of colour
/// where the sponsors went, and above the rail glass onto the stands.
fn boards(s: Surf) -> Material {
  let h = s.p.y;
  let bay = 2.5;
  let along = fract(s.uv.x / bay) * bay;
  let word = hashOf(bitcast<u32>(i32(floor(s.uv.x / bay))), 309u);
  if (h > 1.13) {
    let post = 1.0 - stroke(spaced(s.uv.x, 1.25), 1.21);
    let haze =
      0.012 + 0.03 * smoothstep(
        0.5,
        0.8,
        fbm(vec2f(s.uv.x, h) * 2.0, s.seed ^ 0x31u, 4),
      );
    let pane =
      Material(vec3f(haze), seats(behind(s, 3.0)) * 2.0, 0.94, vec3f(0.0));
    let metal = polished(vec3f(0.3, 0.31, 0.32), 0.5);
    if (post > 0.5) {
      return embossed(s, metal, 1.0, 0.02);
    }
    return pane;
  }
  let scuff = worley(vec2f(s.uv.x, h) * 7.0, 310u);
  let puck =
    smoothstep(0.03, 0.0, abs(scuff.x - 0.2))
      * step(0.6, scuff.y)
      * exp(-h / 0.5);
  let white =
    vec3f(0.6, 0.61, 0.6) * (0.92 + 0.08 * valueNoise(
      vec2f(s.uv.x * 3.0, h * 90.0),
      311u,
    ));
  let advert =
    inside(
      roundBox(vec2f(along - bay * 0.5, h - 0.63), vec2f(0.85, 0.27), 0.0),
    ) * step(0.4, unitOf(word));
  let ground =
    oneOf(
      unitOf(mix32(word)),
      vec3f(0.45, 0.03, 0.03),
      vec3f(0.03, 0.12, 0.4),
      vec3f(0.55, 0.42, 0.03),
      vec3f(0.03, 0.25, 0.12),
    );
  let emblem =
    max(
      inside(length(vec2f(along - bay * 0.5 + 0.5, h - 0.63)) - 0.14),
      inside(
        roundBox(
          vec2f(along - bay * 0.5 - 0.2, h - 0.63),
          vec2f(0.35, 0.05),
          0.0,
        ),
      ),
    );
  var colour = mix(white, mix(ground, vec3f(0.6), emblem), advert);
  colour = mix(colour, vec3f(0.015), 0.8 * puck);
  let seam = stroke(along - 0.002, 0.008);
  let kick = 1.0 - smoothstep(0.2, 0.204, h);
  let rail = smoothstep(1.06, 1.064, h);
  colour =
    mix(
      mix(colour, vec3f(0.6, 0.44, 0.03), kick),
      vec3f(0.03, 0.09, 0.34),
      rail,
    ) * (1.0 - 0.6 * seam);
  return
    embossed(
      s,
      polished(colour, 0.4 + 0.2 * rail),
      2.0 * rail + kick - seam - 0.5 * puck,
      0.006,
    );
}

/// A dark steel deck on trusses, the lamps hung in the squares between.
fn trussed(s: Surf) -> Material {
  let rib = smoothstep(0.25, 0.4, abs(fract(s.uv.y / 0.18) - 0.5));
  let web = repeated(s.uv, vec2f(2.5));
  let chord = max(stroke(web.x, 0.1), stroke(web.y, 0.1));
  let lace = stroke(abs(web.x) - abs(web.y), 0.03) * (1.0 - chord);
  let deck = vec3f(0.035, 0.045, 0.06) * (0.6 + 0.5 * rib);
  let steel = vec3f(0.11, 0.12, 0.13);
  let ceiling =
    glowing(mix(deck, steel, max(chord, lace)), lampGlow(s, lamps()));
  return embossed(s, ceiling, rib - 4.0 * chord - 2.0 * lace, 0.012);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return boards(s);
    }
    case FLOOR, OWNED: {
      return ice(s);
    }
    case CEILING: {
      return trussed(s);
    }
    case TRIM: {
      let pad = band(s.p.y, 0.6, 1.2);
      return
        polished(mix(vec3f(0.5, 0.5, 0.5), vec3f(0.45, 0.03, 0.03), pad), 0.4);
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
