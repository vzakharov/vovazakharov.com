// Generated from circuit-board.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';

export const CIRCUIT_BOARD_SHADER = wgsl(
  'cube/entities/theme/laboratory/circuit-board/config/circuit-board',
  /* wgsl */ `
/// Copper on the board: x is 1 on a trace or a via's ring, y on the ring
/// alone, z in the via's drilled hole. Traces run in buses, a block of board
/// to each, and change lanes on the diagonal.
fn copper(uv: vec2f, salt: u32) -> vec3f {
  let word = cellHash(vec2i(floor(uv / 1.25)), salt);
  let q = select(uv, uv.yx, (word & 1u) == 1u);
  let pitch = 0.07;
  let run = q.x / 0.62;
  let jog = floor(run) + clamp((fract(run) - 0.5) * 0.62 / pitch, 0.0, 1.0);
  let lane = q.y / pitch + jog;
  let laid = step(0.4, unitOf(hashOf(bitcast<u32>(i32(floor(lane))), word)));
  let trace = laid * (1.0 - smoothstep(0.17, 0.24, abs(fract(lane) - 0.5)));
  let via = worley(uv / 0.31, salt + 1u);
  let drilled = step(0.55, via.y);
  let ring = drilled * (1.0 - smoothstep(0.13, 0.16, via.x));
  let hole = drilled * (1.0 - smoothstep(0.05, 0.07, via.x));
  return vec3f(max(trace, ring), ring, hole);
}

const GOLD = vec3f(0.7, 0.5, 0.14);

/// The green mask, paler where \`copper\` runs under it.
fn solderMask(copper: f32) -> vec3f {
  return mix(vec3f(0.012, 0.085, 0.04), vec3f(0.03, 0.2, 0.09), copper);
}

fn streets(s: Surf) -> Material {
  let metal = copper(s.uv, 441u);
  // Silkscreen: the outline of a part never fitted, one to a cell.
  let cell = s.uv / 0.625;
  let word = cellHash(vec2i(floor(cell)), 442u);
  let size = vec2f(0.12 + 0.2 * unitOf(word), 0.1 + 0.16 * unitOf(mix32(word)));
  let box = abs(fract(cell) - 0.5) - size;
  let fitted = step(0.6, unitOf(mix32(word ^ 0x44u)));
  let outline = fitted * (1.0 - smoothstep(0.0, 0.012, abs(max(box.x, box.y))));
  let pad =
    fitted
      * step(box.y, -0.02)
      * step(abs(box.x + 0.03), 0.02)
      * step(0.3, fract(cell.y * 12.0));
  let weave = valueNoise(s.uv * 220.0, 443u);
  let mask = solderMask(metal.x) * (0.9 + 0.15 * weave);
  var albedo = mix(mask, GOLD, metal.y);
  albedo =
    mix(albedo, vec3f(0.62, 0.64, 0.6), max(outline * (1.0 - metal.y), pad));
  albedo = mix(albedo, vec3f(0.003), metal.z);
  let m =
    polished(
      albedo,
      mix(0.72, 0.85, max(metal.y, pad))
        * (1.0 - metal.z)
        * (1.0 - 0.6 * outline),
    );
  return embossed(s, m, metal.x + 2.0 * pad - 3.0 * metal.z, 0.003);
}

fn towers(s: Surf) -> Material {
  let h = s.p.y;
  let metal = copper(vec2f(s.uv.x, h), 444u);
  let mask = solderMask(metal.x);
  // Gold fingers for a skirting.
  let finger =
    (1.0 - smoothstep(0.3, 0.304, h))
      * step(0.03, h)
      * step(0.25, fract(s.uv.x / 0.09));
  // A chip to each bay, its legs along its foot and its head.
  let across = fract(s.uv.x / 1.25) * 1.25;
  let word = hashOf(bitcast<u32>(i32(floor(s.uv.x / 1.25))), s.seed ^ 0x44u);
  let half = 0.3 + 0.25 * unitOf(word);
  let top = 1.5 + 0.55 * unitOf(mix32(word));
  let box = vec2f(abs(across - 0.625) - half, max(h - top, 0.5 - h));
  let body = 1.0 - smoothstep(0.0, 0.006, max(box.x, box.y));
  let leg =
    (1.0 - smoothstep(0.0, 0.004, box.x))
      * step(0.4, fract(across / 0.05))
      * (1.0 - smoothstep(0.0, 0.004, max(h - top - 0.06, 0.44 - h)))
      * (1.0 - body);
  // Windows: a few lit, and the lit ones change with the minute.
  let pane = vec2f(across, h) / vec2f(0.075, 0.11);
  let lit =
    hashOf(
      cellHash(vec2i(floor(pane)), word),
      u32(s.time / 60.0) / 2u + s.hour,
    );
  let glass =
    body
      * step(box.x, -0.05)
      * step(box.y, -0.08)
      * step(0.25, fract(pane.x))
      * step(0.3, fract(pane.y));
  let on = glass * step(0.86, unitOf(lit));
  let mould = valueNoise(s.uv * 150.0, 445u);
  let notch =
    body * (1.0 - smoothstep(
      0.03,
      0.035,
      length(vec2f(across - 0.625 + half - 0.08, h - top + 0.08)),
    ));
  var albedo = mix(mask, GOLD, max(metal.y * (1.0 - body), finger));
  albedo = mix(albedo, vec3f(0.022, 0.022, 0.025) * (0.8 + 0.4 * mould), body);
  albedo = mix(albedo, vec3f(0.5, 0.52, 0.5), max(leg, 0.3 * notch));
  albedo = mix(albedo, vec3f(0.004), glass);
  let warm =
    mix(
      vec3f(1.0, 0.62, 0.2),
      vec3f(0.6, 0.85, 1.0),
      step(0.8, unitOf(mix32(lit))),
    );
  let gloss = mix(0.7, 0.3, body) + 0.6 * glass + 0.5 * max(leg, finger);
  let wall =
    Material(albedo, warm * 1.6 * on, clamp(gloss, 0.0, 0.95), vec3f(0.0));
  return
    embossed(
      s,
      wall,
      metal.x * (1.0 - body) + 6.0 * body + 3.0 * leg - glass + 2.0 * finger,
      0.004,
    );
}

fn underside(s: Surf) -> Material {
  let joint = worley(s.uv / 0.1, 446u);
  let soldered = step(0.7, joint.y) * (1.0 - smoothstep(0.16, 0.22, joint.x));
  let metal = copper(s.uv, 447u);
  let mask = mix(vec3f(0.008, 0.05, 0.03), vec3f(0.02, 0.12, 0.06), metal.x);
  let m =
    Material(
      mix(mask, vec3f(0.55, 0.57, 0.56), soldered),
      lampGlow(s, lamps()),
      mix(0.5, 0.9, soldered),
      vec3f(0.0),
    );
  return
    embossed(s, m, soldered * (1.0 - joint.x * 3.0) + 0.3 * metal.x, 0.012);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return towers(s);
    }
    case FLOOR, OWNED: {
      return streets(s);
    }
    case CEILING: {
      return underside(s);
    }
    case TRIM: {
      // A capacitor: a blue sleeve with its stripe, crimped near the foot.
      let stripe = band(fract(s.uv.x / 0.3) * 0.3, 0.15, 0.05);
      let sleeve = mix(vec3f(0.02, 0.04, 0.2), vec3f(0.5, 0.52, 0.55), stripe);
      return embossed(s, polished(sleeve, 0.6), band(s.p.y, 0.25, 0.03), -0.01);
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
