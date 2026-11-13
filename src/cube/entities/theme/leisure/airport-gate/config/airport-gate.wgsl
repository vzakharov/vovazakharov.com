// `airport-gate.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, Material, matte, polished, embossed, repeated, spaced};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, cellHash, valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{band, carpet};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::leisure::shape::lib::shape::{inside, stroke, roundBox, oneOf};
import package::cube::entities::theme::kit::lib::light::lampGlow;

/// The apron at night as it lies along `view` from a point `stand` metres
/// east and south on the floor: a sodium glow on the horizon, the far
/// terminal's windows, taxiway lights on the ground below and a mast's
/// beacon. The eye stands seven metres over the tarmac.
fn apron(view: vec3f, stand: vec2f, t: f32) -> vec3f {
  let rise = view.y / max(length(view.xz), 1e-4);
  let turn = atan2(view.z, view.x);
  if (rise >= 0.0) {
    let sky =
      mix(
        vec3f(0.06, 0.026, 0.01),
        vec3f(0.002, 0.004, 0.012),
        smoothstep(0.0, 0.1, rise),
      );
    let pane =
      hashOf(bitcast<u32>(i32(floor(turn * 700.0))), u32(rise * 500.0));
    let far =
      step(0.8, unitOf(pane))
        * (1.0 - smoothstep(0.008, 0.02, rise))
        * step(0.003, rise);
    let mast = stroke(turn - 1.1, 0.004) * (1.0 - smoothstep(0.1, 0.102, rise));
    let lit =
      inside(length(vec2f((turn - 1.1) * 0.6, rise - 0.108)) - 0.006) * step(
        0.5,
        fract(t * 0.7),
      );
    return
      mix(sky, vec3f(0.002), mast)
        + vec3f(0.9, 0.7, 0.4) * far * 0.9
        + vec3f(3.0, 0.1, 0.05) * lit;
  }
  let ground = stand + view.xz / -view.y * 7.0;
  let away = length(ground - stand);
  let tarmac =
    vec3f(0.006, 0.007, 0.009) + vec3f(0.012, 0.006, 0.002) * exp(
      -away / 220.0,
    );
  let edge = repeated(ground, vec2f(10.0, 40.0));
  let size = 0.12 + away * 0.0045;
  let blue = inside(length(edge) - size);
  let centre = repeated(ground + vec2f(5.0, 20.0), vec2f(10.0, 40.0));
  let green = inside(length(centre) - size * 0.8);
  let paint = stroke(centre.y, 0.35) * 0.02;
  let reach = exp(-away / 260.0);
  return
    tarmac
      + vec3f(0.6, 0.45, 0.04) * paint
      + (vec3f(0.08, 0.3, 2.6) * blue + vec3f(0.1, 1.7, 0.4) * green) * reach;
}

/// Glass from the sill to the head in aluminium frames, the night outside.
fn glazed(s: Surf) -> Material {
  let h = s.p.y;
  let bay = spaced(s.uv.x, 1.25);
  let upright = 1.0 - stroke(bay, 1.25 - 0.06);
  let rails = max(band(h, 0.48, 0.05), band(h, 2.1, 0.06));
  let sill = 1.0 - smoothstep(0.1, 0.104, h);
  let head = smoothstep(2.13, 2.134, h);
  let frame = max(max(upright, rails), max(sill, head));
  let brushed = valueNoise(vec2f(s.uv.x * 240.0, h * 8.0), 262u);
  let metal =
    mix(
      vec3f(0.26, 0.27, 0.28) * (0.85 + 0.2 * brushed),
      vec3f(0.035, 0.04, 0.045),
      max(sill, head),
    );
  let smear = fbm(vec2f(s.uv.x, h) * 2.3, s.seed ^ 0x63u, 4);
  let film = vec3f(0.012, 0.014, 0.016) + 0.02 * smoothstep(0.55, 0.8, smear);
  let world = vec2f(s.cell) * ROOM.xz + s.p.xz;
  let outside = apron(s.view, world, s.time);
  let pane = Material(film, outside, 0.93, vec3f(0.0));
  let framed = polished(metal, 0.45);
  if (frame > 0.5) {
    return embossed(s, framed, 1.0, 0.03);
  }
  return pane;
}

/// A carpet in slate, flecked with short bars of teal and ochre.
fn dashed(s: Surf) -> Material {
  let size = vec2f(0.6, 0.15);
  let course = floor(s.uv.y / size.y);
  let at = vec2f(s.uv.x / size.x + fract(course * 0.37), s.uv.y / size.y);
  let word = cellHash(vec2i(floor(at)), 263u);
  let bar =
    inside(
      roundBox((fract(at) - 0.5) * size, vec2f(0.19, 0.016), 0.016),
    ) * step(0.45, unitOf(word));
  let ink =
    oneOf(
      unitOf(mix32(word)),
      vec3f(0.02, 0.17, 0.17),
      vec3f(0.33, 0.2, 0.04),
      vec3f(0.2, 0.22, 0.25),
      vec3f(0.02, 0.17, 0.17),
    );
  let pile = valueNoise(s.uv * 240.0, 11u);
  let slate = carpet(s, vec3f(0.035, 0.05, 0.075));
  return
    embossed(s, matte(mix(slate, ink * (0.7 + 0.4 * pile), bar)), pile, 0.0015);
}

/// Aluminium slats with a dark gap between each, the lamps in long slots.
fn slatted(s: Surf) -> Material {
  let slat = abs(spaced(s.uv.x, 0.1));
  let gap = 1.0 - smoothstep(0.006, 0.01, 0.05 - slat);
  let brushed = valueNoise(vec2f(s.uv.x * 20.0, s.uv.y * 300.0), 264u);
  let white = vec3f(0.42, 0.43, 0.44) * (0.85 + 0.2 * brushed);
  let ceiling =
    Material(
      mix(white, vec3f(0.01), gap),
      lampGlow(s, lamps()),
      0.45 * (1.0 - gap),
      vec3f(0.0),
    );
  return embossed(s, ceiling, 1.0 - gap, 0.012);
}

/// A steel column carrying a yellow board at its head with no number on it.
fn numbered(s: Surf) -> Material {
  let board = band(s.p.y, 1.98, 0.3);
  let brushed = valueNoise(vec2f(s.uv.x * 300.0, s.p.y * 5.0), 265u);
  let steel = vec3f(0.33, 0.34, 0.35) * (0.8 + 0.3 * brushed);
  let post =
    Material(
      mix(steel, vec3f(0.6, 0.45, 0.02), board),
      vec3f(0.5, 0.36, 0.02) * board,
      mix(0.6, 0.3, board),
      vec3f(0.0),
    );
  return embossed(s, post, board, 0.01);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return glazed(s);
    }
    case FLOOR, OWNED: {
      return dashed(s);
    }
    case CEILING: {
      return slatted(s);
    }
    case TRIM: {
      return numbered(s);
    }
    default: {
      return stuff(s);
    }
  }
}
