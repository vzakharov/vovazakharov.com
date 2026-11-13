// `stairwell.ts` adds this floor's light and lens, `lamps()` among them.

import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, toNearestSide, Material, matte, polished, glowing, embossed, spaced, litOf};
import package::cube::shared::shader::hash::{hashOf, unitOf, cellHash, valueNoise, fbm};
import package::cube::entities::theme::kit::lib::finish::{band, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::workplace::stencil::lib::stencil::{wallAlong, stencilDigit};
import package::cube::entities::theme::kit::lib::light::{lampLevel, GLARE};

fn studded(s: Surf) -> Material {
  let at = s.uv / 0.05;
  // Studs finer than a pixel are left out rather than left to shimmer.
  let fine = 1.0 - smoothstep(0.3, 1.1, fwidth(at.x) + fwidth(at.y));
  let stud = (1.0 - smoothstep(0.24, 0.33, length(fract(at) - 0.5))) * fine;
  let grime = fbm(s.uv * 0.9, 61u, 4);
  let dust = smoothstep(0.35, 0.8, fbm(s.uv * 3.1, 62u, 4));
  let rubber =
    vec3f(0.03, 0.042, 0.04) * (0.7 + 0.6 * grime) * (1.0 + 0.9 * stud);
  let trodden =
    mix(rubber, vec3f(0.12, 0.115, 0.1), 0.3 * dust * (1.0 - 0.6 * stud));
  // Every room's edge is a step's edge: a ribbed yellow nosing, worn through.
  let edge = toNearestSide(s);
  let worn = smoothstep(0.38, 0.5, fbm(s.uv * 5.0, 63u, 3));
  let rib = 0.5 + 0.5 * cos(edge * 6.2832 / 0.014);
  let nosing = band(edge, 0.085, 0.09) * worn;
  let yellow = vec3f(0.5, 0.36, 0.03) * (0.55 + 0.45 * rib);
  let floor = polished(mix(trodden, yellow, nosing), mix(0.28, 0.08, dust));
  return embossed(s, floor, stud + 0.4 * nosing * rib + 0.6 * grime, 0.004);
}

fn boardMarked(s: Surf) -> Material {
  let h = s.p.y;
  let along = wallAlong(s);
  let board = h / 0.14;
  let row = i32(floor(board));
  let plank = vec2i(i32(floor(s.uv.x / 2.4 + f32(row) * 0.37)), row);
  let tone = unitOf(cellHash(plank, 71u));
  let grain = fbm(vec2f(s.uv.x * 2.5 + tone * 9.0, h * 80.0), 72u, 3);
  let seam = smoothstep(0.0, 0.07, min(fract(board), 1.0 - fract(board)));
  let pour = fbm(s.uv * 0.7, s.seed ^ 0x73u, 4);
  let raw =
    vec3f(0.2, 0.2, 0.185)
      * (0.6 + 0.2 * tone + 0.22 * grain + 0.4 * pour)
      * (0.82 + 0.18 * seam);
  // The formwork's tie holes, plugged and stained below.
  let tie = vec2f(spaced(s.uv.x, 1.2), spaced(h - 0.3, 0.7));
  let hole = 1.0 - smoothstep(0.016, 0.026, length(tie));
  let weep =
    (1.0 - smoothstep(0.0, 0.03, abs(tie.x)))
      * smoothstep(0.0, -0.3, tie.y)
      * step(tie.y, 0.0);
  let concrete =
    raw * (1.0 - 0.75 * hole) * (1.0 - 0.3 * weep) * (1.0 - 0.45 * damp(s));

  let low = 1.0 - smoothstep(1.1, 1.104, h);
  let roller = fbm(s.uv * 20.0, 74u, 3);
  let chipped =
    step(
      0.84,
      fbm(s.uv * 4.0, s.seed ^ 0x75u, 3) + 0.22 * valueNoise(s.uv * 50.0, 76u),
    );
  let scuffed =
    1.0 - 0.4
      * smoothstep(0.5, 0.2, h)
      * fbm(vec2f(s.uv.x * 1.5, h * 30.0), 77u, 3);
  let grey = vec3f(0.11, 0.15, 0.16) * (0.9 + 0.2 * roller) * scuffed;
  let dado = mix(grey, concrete, chipped);
  let red = vec3f(0.36, 0.03, 0.02) * (0.85 + 0.3 * roller);
  let line = band(h, 1.15, 0.06) * (1.0 - chipped);

  // The floor's number, off to the left where no notice hangs; now and
  // then a room is sure it is some other floor.
  let roll = hashOf(s.seed, 0x78u);
  let number = select(4u, (roll >> 4u) % 10u, roll % 9u == 0u);
  let fade = smoothstep(0.3, 0.5, fbm(s.uv * 9.0, 79u, 3) + 0.25 * grain);
  let figure = stencilDigit(vec2f(along - 0.6, h - 1.36) / 0.32, number) * fade;

  let albedo =
    mix(
      mix(mix(concrete, dado, low), red, line),
      vec3f(0.025, 0.025, 0.03),
      0.85 * figure,
    );
  let wall = polished(albedo, 0.03 + 0.5 * low * (1.0 - chipped) + 0.3 * line);
  let height =
    0.5 * seam + 0.25 * grain - 1.5 * hole + low * (0.5 * roller - chipped);
  return embossed(s, wall, height, 0.004);
}

fn soffit(s: Surf) -> Material {
  // The flight above from below: long treads, short risers.
  let ramp = fract(s.uv.y / 0.3);
  let riser = smoothstep(0.76, 0.8, ramp);
  let saw = select(ramp / 0.78, (1.0 - ramp) / 0.22, ramp > 0.78);
  let off = s.p.xz - ROOM.xz * 0.5;
  let r = length(off);
  // The lamp sits on a flat pad cast into the flight.
  let pad = smoothstep(0.24, 0.4, r);
  let mottle = fbm(s.uv * 3.0, 81u, 4);
  let concrete =
    vec3f(0.21, 0.21, 0.195)
      * (0.65 + 0.5 * mottle)
      * (1.0 - 0.4 * riser * pad)
      * (1.0 - 0.55 * damp(s));
  let glass = 1.0 - smoothstep(0.15, 0.165, r);
  let bezel = band(r, 0.19, 0.045);
  let cage =
    clamp(
      band(off.x, 0.0, 0.014) + band(off.y, 0.0, 0.014) + band(r, 0.085, 0.014),
      0.0,
      1.0,
    );
  let prism = 0.75 + 0.25 * cos(r * 6.2832 / 0.022);
  let level = lampLevel(s, vec2i(0), litOf(s), lamps().stutter);
  let glow =
    lamps().colour * (GLARE * glass * (1.0 - 0.85 * cage) * prism * level);
  let albedo =
    mix(
      mix(concrete, vec3f(0.3, 0.32, 0.28), glass),
      vec3f(0.015),
      clamp(bezel + cage * glass, 0.0, 1.0),
    );
  return embossed(s, glowing(albedo, glow), saw * pad + 0.05 * mottle, 0.16);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return boardMarked(s);
    }
    case FLOOR, OWNED: {
      return studded(s);
    }
    case CEILING: {
      return soffit(s);
    }
    case TRIM: {
      let pour = fbm(s.uv * vec2f(6.0, 1.2), 82u, 4);
      return matte(vec3f(0.3, 0.3, 0.28) * (0.65 + 0.5 * pour));
    }
    default: {
      return stuff(s);
    }
  }
}
