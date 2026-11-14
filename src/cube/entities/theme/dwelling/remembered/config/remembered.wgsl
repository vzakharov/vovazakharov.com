// `remembered.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, alongWall, Material, matte, polished, glowing, embossed};
import package::cube::shared::shader::hash::{mix32, unitOf, valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{plaster, carpet, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::dwelling::household::lib::household::{wallWord, boxAway, within, fromLamp, burning, halfDrop};

/// How far a pattern has slid at `uv` by now, in metres: slowly, and never
/// the same way twice in a row.
fn drift(uv: vec2f, time: f32) -> vec2f {
  let t = time * 0.02;
  return
    0.16 * (vec2f(
      fbm(uv * 0.9 + vec2f(t, -t), 0x160u, 3),
      fbm(uv * 0.9 + vec2f(-t, t * 0.7), 0x161u, 3),
    ) - 0.5);
}

/// The colour a room says its paper was.
fn recalled(seed: u32) -> vec3f {
  let roll = unitOf(mix32(seed ^ 0x162u));
  let rose = vec3f(0.42, 0.22, 0.2);
  let sage = vec3f(0.24, 0.32, 0.2);
  let blue = vec3f(0.2, 0.27, 0.38);
  let ochre = vec3f(0.44, 0.33, 0.14);
  return
    mix(
      mix(rose, sage, smoothstep(0.2, 0.3, roll)),
      mix(blue, ochre, smoothstep(0.7, 0.8, roll)),
      smoothstep(0.45, 0.55, roll),
    );
}

fn unsure(s: Surf) -> Material {
  let y = s.p.y;
  let along = alongWall(s);
  let wall = wallWord(s);
  let slid = s.uv + drift(s.uv, s.time);
  let ground = recalled(s.seed);
  let hold =
    smoothstep(0.3, 0.7, fbm(s.uv * 0.5 + s.time * 0.01, s.seed ^ 0x163u, 3));

  let cell = halfDrop(slid, vec2f(0.36, 0.44), 0x164u);
  let r = length(cell.xy);
  let turn = atan2(cell.y, cell.x);
  let lobes = 3.0 + floor(cell.z * 4.0);
  let motif =
    within(
      r - 0.1 - 0.035 * cos(turn * lobes + s.time * 0.05),
      0.012 + 0.05 * (1.0 - hold),
    );
  let stripe = 0.5 + 0.5 * cos(slid.x * 52.0);
  var paper = ground * (0.9 + 0.12 * stripe * hold);
  paper =
    mix(
      paper,
      mix(ground * 0.45, vec3f(0.5, 0.44, 0.34), cell.z),
      motif * (0.35 + 0.65 * hold),
    );
  paper = plaster(s, paper);

  let middle =
    vec2f(1.0 + 3.0 * unitOf(wall), 1.45 + 0.3 * unitOf(mix32(wall)));
  let half =
    vec2f(
      0.14 + 0.18 * unitOf(mix32(wall ^ 0x165u)),
      0.18 + 0.16 * unitOf(mix32(wall ^ 0x166u)),
    );
  let p = vec2f(along, y) - middle;
  let frame = boxAway(p, half);
  let glass = within(frame + 0.03, 0.004);
  let face =
    exp(
      -dot(p * vec2f(1.5, 1.0), p * vec2f(1.5, 1.0)) / (half.x * half.x * 0.45),
    );
  let shoulders =
    exp(
      -dot(
        (p + vec2f(0.0, half.y)) * vec2f(0.8, 1.6),
        (p + vec2f(0.0, half.y)) * vec2f(0.8, 1.6),
      ) / (half.x * half.x),
    );
  let photo =
    mix(
      vec3f(0.05, 0.045, 0.04),
      vec3f(0.4, 0.33, 0.27),
      clamp(face + 0.6 * shoulders, 0.0, 1.0),
    );
  let hung = step(unitOf(mix32(wall ^ 0x167u)), 0.75);
  paper = mix(paper, vec3f(0.1, 0.06, 0.03), within(frame, 0.004) * hung);
  paper = mix(paper, photo, glass * hung);

  let at = vec2f(0.8 + 3.4 * unitOf(mix32(wall ^ 0x168u)), 0.0);
  let size =
    vec2f(
      0.25 + 0.4 * unitOf(mix32(wall ^ 0x169u)),
      1.1 + 1.1 * unitOf(mix32(wall ^ 0x16au)),
    );
  let q = vec2f(along - at.x, y);
  let leaf = boxAway(q, size);
  let doorway = within(leaf, 0.004) * step(0.35, unitOf(mix32(wall ^ 0x16bu)));
  let knobAt =
    vec2f(
      (unitOf(mix32(wall ^ 0x16cu)) - 0.5) * 1.6 * size.x,
      size.y * unitOf(mix32(wall ^ 0x16du)),
    );
  let knob = within(length(q - knobAt) - 0.03, 0.004) * doorway;
  paper =
    mix(
      paper,
      vec3f(0.44, 0.41, 0.34) * (0.92 + 0.08 * fbm(
        s.uv * vec2f(60.0, 3.0),
        0x16eu,
        2,
      )),
      doorway * (1.0 - glass * hung),
    );
  paper = mix(paper, vec3f(0.45, 0.32, 0.1), knob);

  let skirt =
    0.06 + 0.42 * fbm(
      vec2f(s.uv.x * 0.5 + s.time * 0.004, 0.3),
      s.seed ^ 0x16fu,
      3,
    );
  let skirting = within(y - skirt, 0.004);
  let albedo = mix(paper, vec3f(0.42, 0.39, 0.33), skirting);
  let gloss =
    0.05 + 0.4 * max(skirting, doorway) + 0.5 * glass * hung + 0.4 * knob;
  let height =
    0.5 * skirting
      - 0.3 * doorway
      + 1.0 * knob
      + 0.5 * (within(frame, 0.004) - glass) * hung
      + 0.04 * motif * hold;
  return embossed(s, polished(albedo, min(gloss, 0.9)), height, 0.012);
}

fn halfCarpet(s: Surf) -> Material {
  let slid = s.uv + 2.0 * drift(s.uv * 0.5, s.time);
  let check = (fract(slid.x / 0.8) - 0.5) * (fract(slid.y / 0.8) - 0.5);
  let weave = smoothstep(-0.006, 0.006, check);
  let sure =
    smoothstep(0.35, 0.65, fbm(s.uv * 0.4 - s.time * 0.008, 0x170u, 3));
  let a = vec3f(0.2, 0.13, 0.08);
  let b = vec3f(0.32, 0.25, 0.16);
  let wool = mix(mix(a, b, 0.5), mix(a, b, weave), sure);
  let pile = valueNoise(s.uv * 240.0, 0x171u);
  return embossed(s, matte(carpet(s, wool) * 1.3), pile, 0.0015);
}

fn blank(s: Surf) -> Material {
  let stray =
    (vec2f(
      unitOf(s.seed ^ 0x172u),
      unitOf(mix32(s.seed ^ 0x173u)),
    ) - 0.5) * 1.4;
  let off = fromLamp(s, 1) - stray;
  let r = length(off);
  let size = 0.1 + 0.16 * unitOf(mix32(s.seed ^ 0x174u));
  let dome = within(r - size, 0.03);
  let glow = lamps().colour * (2.6 * dome * burning(s, lamps()));
  let white = plaster(s, vec3f(0.48, 0.45, 0.4)) * (1.0 - 0.3 * damp(s));
  return embossed(s, glowing(white, glow), -dome, 0.006);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return unsure(s);
    }
    case FLOOR, OWNED: {
      return halfCarpet(s);
    }
    case CEILING: {
      return blank(s);
    }
    case TRIM: {
      return polished(plaster(s, vec3f(0.42, 0.39, 0.33)), 0.3);
    }
    default: {
      return stuff(s);
    }
  }
}
