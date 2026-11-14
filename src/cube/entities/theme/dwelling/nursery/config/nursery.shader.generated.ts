// Generated from nursery.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, GRADE, LIGHT, STUFF } from '../../../kit';
import { HOUSEHOLD } from '../../household';

export const NURSERY_SHADER = wgsl(
  'cube/entities/theme/dwelling/nursery/config/nursery',
  /* wgsl */ `
/// The moonlight of a landing somewhere, standing in for the big light.
fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(0.2, 0.3, 0.6),
      vec3f(0.003, 0.005, 0.011),
      1,
      vec2f(0.26),
      0.0,
    );
}

/// A five-pointed star's edge: negative inside one \`size\` across at \`q\`.
fn starAway(q: vec2f, size: f32) -> f32 {
  let spoke = abs(cos(atan2(q.x, q.y) * 2.5));
  return length(q) - size * (0.42 + 0.58 * spoke * spoke * spoke);
}

/// A crescent's edge: negative inside one \`size\` across at \`q\`.
fn moonAway(q: vec2f, size: f32) -> f32 {
  return
    max(
      length(q) - size,
      size * 0.85 - length(q - vec2f(size * 0.45, size * 0.2)),
    );
}

/// What the turning lamp with word \`word\` throws along \`out\`, from itself
/// to the point: a star or a moon to each patch of its shade, each its own
/// colour, none straight beneath it.
fn thrown(out: vec3f, word: u32, time: f32) -> vec3f {
  let d = normalize(out);
  let around = atan2(d.z, d.x) / 6.2831853 + time * 0.012 + unitOf(word);
  let down = acos(clamp(-d.y, -1.0, 1.0)) / 1.5707963;
  let p = vec2f(around * 26.0, down * 10.0);
  let cell = vec2i(wrapped(i32(floor(p.x)), 26), i32(floor(p.y)));
  let roll = cellHash(cell, 0xf0u);
  let q =
    fract(p) - 0.5 - 0.3 * (vec2f(unitOf(roll), unitOf(mix32(roll))) - 0.5);
  let kind = unitOf(mix32(roll ^ 0x9u));
  let shape = select(starAway(q, 0.24), moonAway(q, 0.19), kind > 0.8);
  let hue = unitOf(mix32(roll ^ 0x5u));
  let warm = mix(vec3f(1.0, 0.72, 0.25), vec3f(1.0, 0.35, 0.5), step(0.6, hue));
  let colour = mix(warm, vec3f(0.3, 0.75, 1.0), step(0.85, hue));
  return
    colour
      * within(shape, 0.05)
      * step(kind, 0.92)
      * step(0.3, kind)
      * smoothstep(0.12, 0.3, down)
      * (1.0 - smoothstep(0.86, 0.97, down));
}

/// The point lit by the turning lamps of its room and the eight around it,
/// through what is open, as the kit's panels would light it.
fn nightLight(s: Surf, normal: vec3f) -> vec3f {
  var sum = vec3f(0.0);
  for (var south = -1; south <= 1; south++) {
    for (var east = -1; east <= 1; east++) {
      let by = vec2i(east, south);
      let level = lampsBeside(s, by, 0.0);
      if (level <= 0.0) {
        continue;
      }
      let lamp =
        vec3f(
          (f32(east) + 0.5) * ROOM.x,
          ROOM.y - 0.1,
          (f32(south) + 0.5) * ROOM.z,
        );
      let to = lamp - s.p;
      let h2 = dot(to.xz, to.xz);
      let span = 1.0 - h2 * h2 / (ROOM.x * ROOM.x * ROOM.x * ROOM.x);
      if
        (span <= 0.0 || (east != 0 && south != 0 && !reachesAcross(s, by, to)))
      {
        continue;
      }
      let place = vec2u(vec2i(s.cell) + by) & vec2u(63u);
      let word = hashOf(place.x | (place.y << 8u), 0xf1u);
      let d2 = dot(to, to);
      let facing = max(dot(normal, to / sqrt(d2)), 0.0);
      sum +=
        thrown(-to, word, s.time) * (level
          * span
          * span
          * (0.3 + 0.7 * facing)
          / (1.0 + 0.15 * d2));
    }
  }
  return sum;
}

fn starPaper(s: Surf) -> Material {
  let y = s.p.y;
  let cell = halfDrop(s.uv, vec2f(0.3, 0.3), 0xf2u);
  let turned =
    cell.xy * mat2x2f(
      cos(cell.z * 6.0),
      sin(cell.z * 6.0),
      -sin(cell.z * 6.0),
      cos(cell.z * 6.0),
    );
  let motif =
    within(
      select(starAway(turned, 0.05), moonAway(turned, 0.045), cell.z > 0.7),
      0.004,
    );
  let dotted = within(length(abs(cell.xy) - vec2f(0.15)) - 0.008, 0.004);
  var paper = plaster(s, vec3f(0.09, 0.15, 0.3));
  paper = mix(paper, vec3f(0.5, 0.42, 0.2), motif);
  paper = mix(paper, vec3f(0.4, 0.42, 0.45), dotted);

  let pitch = 0.2;
  let flag = floor(s.uv.x / pitch);
  let fx = fract(s.uv.x / pitch) - 0.5;
  let sag = 1.5 + 0.035 * cos(s.uv.x * 2.5132741);
  let hang = sag - y;
  let pennant =
    within(max(-hang, abs(fx) * 0.36 - (0.17 - hang) * 0.5), 0.004) * step(
      hang,
      0.17,
    );
  let string = band(y, sag + 0.004, 0.006);
  let dye = unitOf(cellHash(vec2i(i32(flag), 0), 0xf3u));
  let cloth =
    mix(
      mix(vec3f(0.45, 0.06, 0.05), vec3f(0.5, 0.36, 0.05), step(0.25, dye)),
      mix(vec3f(0.07, 0.3, 0.12), vec3f(0.42, 0.42, 0.4), step(0.75, dye)),
      step(0.5, dye),
    );
  paper = mix(paper, cloth, pennant);
  paper = mix(paper, vec3f(0.4, 0.38, 0.3), string);

  let width = 0.1;
  let groove =
    within(
      min(fract(s.uv.x / width), 1.0 - fract(s.uv.x / width)) * width - 0.003,
      0.003,
    );
  let dado = within(y - 0.86, 0.003);
  let cap = band(y, 0.88, 0.05);
  let wainscot =
    vec3f(0.42, 0.43, 0.42)
      * (1.0 - 0.6 * groove)
      * (0.9 + 0.1 * fbm(s.uv * vec2f(60.0, 3.0), 0xf4u, 2));
  let scribble =
    smoothstep(0.71, 0.73, fbm(s.uv * vec2f(5.0, 22.0), s.seed ^ 0xf5u, 4))
      * step(y, 0.8)
      * step(0.3, y);
  var albedo =
    mix(
      paper,
      mix(wainscot, vec3f(0.5, 0.1, 0.25), 0.7 * scribble),
      max(dado, cap),
    );
  let wall = polished(albedo, 0.05 + 0.35 * max(dado, cap));
  return
    embossed(
      s,
      wall,
      max(dado, cap) * (1.0 - groove) + cap + 0.2 * pennant,
      0.004,
    );
}

fn roadRug(s: Surf) -> Material {
  let size = 2.5;
  let q = (fract(s.uv / size) - 0.5) * size;
  let toEdge = vec2f(size * 0.5) - abs(q);
  let near = min(toEdge.x, toEdge.y);
  let far = max(toEdge.x, toEdge.y);
  let road = within(near - 0.2, 0.006);
  let dash =
    band(near, 0.0, 0.016) * step(0.5, fract(far / 0.24)) * step(0.3, far);
  let kerb = band(near, 0.2, 0.02);
  let island = within(length(toEdge) - 0.1, 0.006);
  let zebra =
    step(0.26, far) * step(far, 0.44) * step(0.5, fract(near / 0.08)) * road;

  let lot = 0.42;
  let cell = floor(q / lot + 0.5);
  let w = q - cell * lot;
  let roll = cellHash(vec2i(cell) + vec2i(floor(s.uv / size)) * 7, 0xf6u);
  let what = unitOf(roll);
  let tint = unitOf(mix32(roll));
  let body = within(boxAway(w + vec2f(0.0, 0.04), vec2f(0.09, 0.06)), 0.004);
  let roof = within(max(abs(w.x) * 0.8 + w.y - 0.1, 0.02 - w.y), 0.004);
  let door = within(boxAway(w + vec2f(0.0, 0.07), vec2f(0.018, 0.03)), 0.003);
  let pond = within(length(w * vec2f(1.0, 1.5)) - 0.12, 0.006);
  let tree = within(length(w) - 0.06, 0.006);
  var lawn = vec3f(0.045, 0.2, 0.05) * (0.85 + 0.3 * fbm(s.uv * 3.0, 0xf7u, 2));
  if (what < 0.4) {
    lawn =
      mix(
        lawn,
        mix(vec3f(0.5, 0.4, 0.1), vec3f(0.42, 0.42, 0.4), step(0.5, tint)),
        body,
      );
    lawn = mix(lawn, vec3f(0.4, 0.05, 0.04), roof);
    lawn = mix(lawn, vec3f(0.05, 0.03, 0.02), door);
  } else if (what < 0.6) {
    lawn = mix(lawn, vec3f(0.02, 0.1, 0.03), tree);
  } else if (what < 0.7) {
    lawn = mix(lawn, vec3f(0.06, 0.2, 0.45), pond);
  }
  var rug = mix(lawn, vec3f(0.1, 0.1, 0.11), road);
  rug = mix(rug, vec3f(0.45, 0.45, 0.42), max(dash, zebra));
  rug = mix(rug, vec3f(0.4, 0.33, 0.06), kerb * (1.0 - road));
  rug = mix(rug, vec3f(0.06, 0.24, 0.06), island);
  let pile = valueNoise(s.uv * 240.0, 0xf8u);
  return embossed(s, matte(carpet(s, rug) * 1.5), pile, 0.0015);
}

fn starred(s: Surf) -> Material {
  let stuck = worley(s.uv * 4.2, 0xf9u);
  let cell = halfDrop(s.uv, vec2f(0.37, 0.41), 0xfau);
  let sticker =
    within(
      starAway(
        cell.xy * mat2x2f(
          cos(cell.z * 9.0),
          sin(cell.z * 9.0),
          -sin(cell.z * 9.0),
          cos(cell.z * 9.0),
        ),
        0.02 + 0.03 * cell.z,
      ),
      0.004,
    )
      * step(0.45, cell.z)
      * step(0.25, stuck.x);
  let fade = 0.5 + 0.5 * sin(s.time * 0.05 + cell.z * 40.0);
  let white = plaster(s, vec3f(0.42, 0.43, 0.46)) * (1.0 - 0.4 * damp(s));
  let off = fromLamp(s, 1);
  let r = length(off);
  let turn = atan2(off.y, off.x) + s.time * 0.075;
  let dome = within(r - 0.13, 0.005);
  let hole = step(0.6, fract(turn * 2.5464791)) * band(r, 0.07, 0.04);
  let base = band(r, 0.14, 0.02);
  let glow =
    vec3f(1.0, 0.72, 0.3) * (dome
      * (0.5 + 5.0 * hole)
      * burning(s, lamps())) + vec3f(0.25, 1.0, 0.4)
      * (0.1 + 0.07 * fade)
      * sticker;
  var albedo = mix(white, vec3f(0.42, 0.5, 0.3), sticker);
  albedo = mix(albedo, vec3f(0.08, 0.1, 0.25), dome);
  albedo = mix(albedo, vec3f(0.4, 0.4, 0.42), base);
  return
    embossed(
      s,
      glowing(albedo, glow),
      0.3 * sticker + 2.0 * base - 1.0 * dome,
      0.004,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return starPaper(s);
    }
    case FLOOR, OWNED: {
      return roadRug(s);
    }
    case CEILING: {
      return starred(s);
    }
    case TRIM: {
      return polished(plaster(s, vec3f(0.42, 0.43, 0.42)), 0.4);
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  let normal = normalize(s.normal + m.relief);
  let lit = roomLight(s, m, lamps()) + m.albedo * nightLight(s, normal) * 1.5;
  return haze(lit, s, AIR, 30.0);
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, 0.3, 0.005) * 1.25;
  let night = tonemap(seen) * vec3f(0.92, 0.98, 1.08);
  return night * vignette(l, 0.5) + grain(l) * 0.028;
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
