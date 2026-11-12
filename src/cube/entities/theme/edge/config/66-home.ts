import { hex, linear } from '@/cube/shared/lib/colour';

import { FINISH, type FloorTheme, ordinary, STUFF, wgsl } from '../../kit';
import { PATTERN } from '../lib/pattern.shader';

const AIR = linear(hex(0x1c_10_08));

/**
 * Under everything, smaller than a quark, somebody's flat: herringbone
 * parquet, striped wallpaper, one warm lamp, and on every wall the carpet
 * that hung over a grandmother's sofa east of Berlin. The one room in the
 * building that was finished, and loved.
 */
export const HOME: FloorTheme = {
  name: 'Home',
  air: AIR,
  pillar: 0.02,
  dark: 0,
  sound: { footing: 'wood', hum: 50, air: 0, echo: 0.3 },
  decor: [
    { thing: 'sofa', perRoom: 0.8 },
    { thing: 'armchair', perRoom: 0.6 },
    { thing: 'floor-lamp', perRoom: 0.6 },
    { thing: 'tv', perRoom: 0.5 },
    { thing: 'bookshelf', perRoom: 0.6 },
    { thing: 'rug', perRoom: 0.5 },
    { thing: 'potted-plant', perRoom: 0.6 },
    { thing: 'radiator', perRoom: 0.4 },
    { thing: 'wall-clock', perRoom: 0.3 },
  ],
  shader: wgsl(
    'home',
    /* wgsl */ `
const NIGHT = vec3f(0.008, 0.01, 0.03);
const WOOL = vec3f(0.6, 0.48, 0.3);
const LIME = vec3f(0.5, 0.46, 0.38);

// What a carpet's field is dyed: madder twice, since most were red.
const GROUNDS = array<vec3f, 6>(
  vec3f(0.3, 0.012, 0.01),
  vec3f(0.3, 0.012, 0.01),
  vec3f(0.13, 0.006, 0.014),
  vec3f(0.1, 0.03, 0.012),
  vec3f(0.008, 0.012, 0.06),
  vec3f(0.012, 0.06, 0.03),
);

const DYES = array<vec3f, 5>(
  vec3f(0.5, 0.27, 0.03),
  vec3f(0.6, 0.15, 0.02),
  vec3f(0.008, 0.01, 0.03),
  vec3f(0.03, 0.13, 0.04),
  vec3f(0.1, 0.24, 0.38),
);

/// One of the dyes carpet \`roll\` was woven with: neighbouring numbers are
/// always different dyes.
fn dye(i: u32, roll: u32) -> vec3f {
  return DYES[(i + (roll >> 12u)) % 5u];
}

/// The colour at knot \`knot\` of a carpet \`size\` knots, woven the same in
/// all four quarters as the factories wove them: a narrow border, a wide
/// one, a field, a medallion or three in the middle, sometimes a quarter of
/// one in each corner. Which of each, and in what dyes, is \`roll\`'s to say,
/// so no two carpets in the building are the same.
fn woven(knot: vec2i, size: vec2i, roll: u32) -> vec3f {
  let half = size / 2;
  let a = abs(knot - half);
  let gap = half - a;
  let inward = min(gap.x, gap.y);
  let run = select(a.x, a.y, gap.x < gap.y);
  let ground = GROUNDS[roll % 6u];
  let other = GROUNDS[(roll + 3u) % 6u];
  let slant = (a.x + a.y) % 12;
  let counter = ((a.x - a.y) % 12 + 12) % 12;

  if (inward < 2) { return NIGHT; }
  if (inward < 7) {
    let deep = inward - 2;
    switch (roll >> 3u) % 3u {
      case 0u: { return select(WOOL, ground, (slant % 6) < 3); }
      case 1u: { return select(dye(0u, roll), ground, abs(run % 10 - 5) > deep); }
      default: { return select(WOOL, dye(1u, roll), (run / 3 + deep / 3) % 2 == 0); }
    }
  }
  if (inward < 9) { return NIGHT; }
  if (inward < 21) {
    let deep = inward - 9;
    switch (roll >> 5u) % 3u {
      case 0u: {
        let hook = (min(slant, 11 - slant) + min(counter, 11 - counter)) % 5;
        return select(select(dye(0u, roll), WOOL, hook == 2), other, hook < 2);
      }
      case 1u: {
        let petal = abs(run % 12 - 6) + abs(deep - 6);
        if (petal < 2) { return WOOL; }
        if (petal < 4) { return dye(0u, roll); }
        return select(other, dye(1u, roll), petal == 5);
      }
      default: {
        let band = (deep + abs(run % 12 - 6)) % 6;
        return select(select(WOOL, dye(1u, roll), band < 4), other, band < 2);
      }
    }
  }
  if (inward < 23) { return WOOL; }

  let inner = half - 23;
  let kind = (roll >> 7u) % 4u;
  var q = vec2i(a.x / 2, a.y);
  if (kind == 2u) {
    q = vec2i(min(a.x, abs(a.x - inner.x * 3 / 5)), a.y);
  }
  let square = max(q.x, q.y);
  let diamond = q.x + q.y;
  var out = diamond;
  var reach = inner.y - 9;
  switch kind {
    case 0u: { reach = inner.y - 7; }
    case 1u: { out = max(square, diamond * 7 / 10); }
    case 3u: { out = min(square, diamond * 7 / 10); }
    default: {}
  }
  if (out < 3) { return WOOL; }
  if (out < reach) {
    switch (out / 3) % 4 {
      case 0: { return other; }
      case 1: { return WOOL; }
      case 2: { return dye(0u, roll); }
      default: { return dye(1u, roll); }
    }
  }
  if (out < reach + 3) { return WOOL; }

  if (((roll >> 9u) & 1u) == 1u) {
    let corner = (inner.x - a.x) / 2 + inner.y - a.y;
    if (corner < 12) { return select(other, dye(0u, roll), (corner / 3) % 2 == 0); }
    if (corner < 14) { return WOOL; }
  }

  switch (roll >> 10u) % 3u {
    case 0u: {
      // Small flowers, a lattice of them, each a cross of five knots.
      let flower = abs(a.x % 10 - 5) + abs(a.y % 10 - 5);
      if (flower < 2) { return select(dye(0u, roll), WOOL, flower == 0); }
      return select(ground, NIGHT, (a.x & a.y & 7) == 7);
    }
    case 1u: {
      // A trellis, a knot of wool where its lines cross.
      if (slant == 0 && counter == 0) { return WOOL; }
      return select(ground, dye(0u, roll), slant == 0 || counter == 0);
    }
    default: {
      // Roses in staggered rows, two leaves to each.
      let row = a.y / 12;
      let c = vec2i((a.x + 8 * (row % 2)) % 16 - 8, a.y % 12 - 6);
      let rose = abs(c.x) + abs(c.y);
      if (rose < 1) { return WOOL; }
      if (rose < 3) { return dye(1u, roll); }
      return select(ground, DYES[3], rose == 4 && c.x * c.y > 0);
    }
  }
}

const PAPERS = array<vec3f, 3>(
  vec3f(0.5, 0.36, 0.17),
  vec3f(0.3, 0.36, 0.2),
  vec3f(0.5, 0.3, 0.24),
);

/// The wall under the carpets: striped paper of the room's own colour, a
/// tall oak skirting below it and a stepped plaster cornice under the
/// ceiling.
fn papered(s: Surf) -> Material {
  let tint = PAPERS[hashOf(s.seed, 0x67u) % 3u];
  let stripe = step(0.5, fract(s.uv.x / 0.16));
  let sprig = worley(vec2f(s.uv.x / 0.16, s.uv.y / 0.2), 97u);
  let ochre = plaster(s, tint * mix(1.0, 0.84, stripe));
  let paper = mix(tint * vec3f(0.6, 0.33, 0.35), ochre, smoothstep(0.1, 0.13, sprig.x));
  let skirting = 1.0 - smoothstep(0.12, 0.124, s.p.y);
  let up = s.p.y - (ROOM.y - 0.12);
  let cornice = smoothstep(0.0, 0.004, up);
  let oak = vec3f(0.16, 0.07, 0.025) * (0.6 + 0.6 * fbm(vec2f(s.uv.x * 2.0, s.uv.y * 60.0), 98u, 3));
  let lime = plaster(s, LIME * (0.82 + 0.06 * floor(up / 0.04)));
  let wall = polished(mix(mix(paper, oak, skirting), lime, cornice), mix(0.05, 0.45, skirting));
  let moulded = 3.0 * skirting + 2.0 * cornice * (1.0 + floor(up / 0.04));
  return embossed(s, wall, moulded + 0.2 * fbm(s.uv * 30.0, 99u, 2), 0.004);
}

/// 1 inside the ellipse at \`middle\` with radii \`radii\`, soft at its rim.
fn daub(at: vec2f, middle: vec2f, radii: vec2f) -> f32 {
  return 1.0 - smoothstep(0.92, 1.08, length((at - middle) / radii));
}

/// The official portrait that hung where a carpet did not, of a Leader
/// nobody can name: the paint at \`at\` of the Leader \`roll\` draws, x from
/// -0.76 to 0.76 across the canvas, y from -1 at its foot to 1 at its head.
fn portrayed(at: vec2f, roll: u32) -> vec3f {
  let side = abs(at.x);
  let bald = (roll & 1u) == 1u;
  let capped = ((roll >> 1u) & 3u) == 0u;
  let whiskered = ((roll >> 3u) & 3u) != 0u;
  let bearded = ((roll >> 5u) & 3u) == 0u;
  let medals = i32((roll >> 7u) % 6u);
  let brow = 0.022 + 0.012 * f32((roll >> 10u) % 4u);
  let jaw = 0.27 + 0.02 * f32((roll >> 12u) % 4u);
  let grey = f32((roll >> 14u) % 3u) * 0.5;
  let khaki = ((roll >> 16u) & 1u) == 1u;

  let skin = vec3f(0.5, 0.3, 0.2) * (0.7 + 0.5 * smoothstep(0.4, -0.3, at.x));
  let hair = mix(vec3f(0.02, 0.015, 0.012), vec3f(0.3, 0.29, 0.27), grey);
  let cloth = select(vec3f(0.02, 0.022, 0.03), vec3f(0.1, 0.09, 0.04), khaki);
  let red = vec3f(0.4, 0.01, 0.008);
  let gilt = vec3f(0.55, 0.36, 0.06);

  // A backdrop the colour of a banner in the dark, lighter behind the head.
  var paint = mix(vec3f(0.1, 0.012, 0.01), vec3f(0.035, 0.03, 0.02), smoothstep(0.0, 1.3, length(at - vec2f(0.0, 0.2))));

  paint = mix(paint, cloth, daub(at, vec2f(0.0, -1.15), vec2f(0.8, 0.62)));
  // A shirt and tie, or a tunic buttoned to the chin.
  let collar = (1.0 - smoothstep(0.0, 0.02, side - (at.y + 0.9) * 0.45)) * step(at.y, -0.5);
  paint = mix(paint, select(vec3f(0.5, 0.48, 0.42), cloth * 1.6, khaki), collar);
  paint = mix(paint, red, collar * (1.0 - smoothstep(0.03, 0.05, side)) * f32(!khaki));
  for (var i = 0; i < medals; i++) {
    let pin = vec2f(0.3 + 0.11 * f32(i % 3), -0.72 - 0.12 * f32(i / 3));
    paint = mix(paint, select(gilt, red, i % 2 == 1), daub(at, pin, vec2f(0.045)));
  }

  paint = mix(paint, skin * 0.8, daub(at, vec2f(0.0, -0.4), vec2f(0.13, 0.22)));
  paint = mix(paint, skin * 0.9, daub(at, vec2f(0.0, 0.08), vec2f(0.36, 0.14)) * step(0.27, side));
  paint = mix(paint, skin, daub(at, vec2f(0.0, 0.1 - 0.1 * step(at.y, 0.1)), vec2f(mix(jaw, 0.3, step(0.1, at.y)), 0.42)));

  // Hair over the crown, or what is left of it over the ears.
  let crown = daub(at, vec2f(0.0, 0.2), vec2f(0.33, 0.36)) * smoothstep(0.3, 0.36, at.y + 0.25 * side);
  let fringe = daub(at, vec2f(0.0, 0.2), vec2f(0.33, 0.3)) * smoothstep(0.24, 0.27, side) * step(0.1, at.y);
  paint = mix(paint, hair, select(crown, fringe, bald));

  paint = mix(paint, hair * 0.6, daub(vec2f(side, at.y), vec2f(0.13, 0.19 - 0.2 * (side - 0.13)), vec2f(0.09, brow)));
  paint = mix(paint, vec3f(0.01), daub(vec2f(side, at.y), vec2f(0.12, 0.11), vec2f(0.035, 0.022)));
  paint = mix(paint, skin * 0.6, daub(at, vec2f(0.03, -0.04), vec2f(0.035, 0.12)));
  paint = mix(paint, skin * 0.45, daub(at, vec2f(0.0, -0.2), vec2f(0.09, 0.012)));
  if (whiskered) {
    let droop = 0.3 * f32((roll >> 3u) & 3u) - 0.3;
    paint = mix(paint, hair, daub(vec2f(side, at.y + droop * side), vec2f(0.0, -0.15), vec2f(0.17, 0.04)));
  }
  if (bearded) {
    paint = mix(paint, hair, daub(at, vec2f(0.0, -0.36), vec2f(0.12, 0.17)) * step(at.y, -0.2));
  }
  if (capped) {
    paint = mix(paint, cloth * 1.4, daub(at, vec2f(0.0, 0.52), vec2f(0.42, 0.17)));
    paint = mix(paint, red, (1.0 - smoothstep(0.34, 0.36, side)) * step(abs(at.y - 0.39), 0.035));
    paint = mix(paint, vec3f(0.008), daub(at, vec2f(0.0, 0.33), vec2f(0.3, 0.04)));
    paint = mix(paint, gilt, daub(at, vec2f(0.0, 0.47), vec2f(0.04)));
  }
  // Brushwork, and the dusk every such canvas went.
  return paint * (0.8 + 0.4 * valueNoise(at * vec2f(60.0, 25.0), roll));
}

/// A Leader in a gilt frame, sixty centimetres by eighty, under glass.
fn framed(s: Surf, roll: u32) -> Material {
  let at = (vec2f(alongWall(s), s.p.y) - vec2f(ROOM.x * 0.5, 1.4)) / 0.4;
  let rim = max(abs(at.x) - 0.76, abs(at.y) - 1.0);
  if (rim > 0.14) { return papered(s); }
  if (rim > 0.0) {
    let gilt = vec3f(0.55, 0.36, 0.06) * (0.6 + 0.5 * cos(rim * 90.0));
    return embossed(s, polished(gilt, 0.5), cos(rim * 90.0), 0.004);
  }
  return polished(portrayed(at, roll), 0.5);
}

fn carpeted(s: Surf) -> Material {
  // Each wall of each room has a carpet of its own, or one in eight a
  // portrait.
  let wall = u32(s.normal.x > 0.5) + 2u * u32(s.normal.z > 0.5) + 4u * u32(abs(s.normal.x) > abs(s.normal.z));
  let roll = hashOf(s.seed, 0x68u + wall);
  // Eighty knots to the metre, hung in the middle of the wall.
  let size = vec2i(192 + 16 * i32((roll >> 14u) % 4u), 104 + 8 * i32((roll >> 16u) % 3u));
  let at = (vec2f(alongWall(s), s.p.y) - vec2f(ROOM.x * 0.5, 1.3)) / (vec2f(size) / 80.0) + 0.5;
  if ((roll >> 20u) % 8u == 0u) { return framed(s, roll >> 23u); }
  if (min(at.x, at.y) < 0.0 || max(at.x, at.y) > 1.0) {
    return papered(s);
  }
  let knots = at * vec2f(size);
  let pile = valueNoise(knots * 2.0, 100u);
  let tuft = fract(knots) - 0.5;
  let rug = matte(woven(vec2i(floor(knots)), size, roll) * (0.75 + 0.35 * pile));
  return embossed(s, rug, 1.0 - dot(tuft, tuft) * 1.5 + 2.0, 0.003);
}

/// Herringbone: blocks a tenth of a metre by four tenths, each of its own
/// plank, varnished and walked dull down the middle of the room.
fn parquet(s: Surf) -> Material {
  let at = s.uv / 0.1;
  let cell = vec2i(floor(at));
  let k = ((cell.x - cell.y) % 8 + 8) % 8;
  var block = vec2i(cell.x - k, cell.y);
  var local = vec2f(at.x - f32(block.x), fract(at.y));
  if (k >= 4) {
    block = vec2i(cell.x, cell.y + k - 4);
    local = vec2f(f32(block.y) + 1.0 - at.y, fract(at.x));
  }
  let edge = min(min(local.x, 4.0 - local.x), min(local.y, 1.0 - local.y));
  let joint = smoothstep(0.0, 0.05, edge);
  let plank = unitOf(cellHash(block, 101u + u32(k >= 4)));
  let grain = fbm(vec2f(local.x * 1.5 + plank * 30.0, local.y * 14.0), 102u, 3);
  let oak = mix(vec3f(0.3, 0.14, 0.045), vec3f(0.46, 0.25, 0.09), plank) * (0.7 + 0.5 * grain);
  let worn = fbm(s.uv * 0.8, 103u, 3);
  let wood = polished(oak * mix(0.25, 1.0, joint), 0.1 + 0.2 * worn);
  return embossed(s, wood, joint, 0.0006);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: { return carpeted(s); }
    case FLOOR, OWNED: { return parquet(s); }
    case CEILING: {
      // A plaster rose round the lamp, sixteen petals to it.
      let out = fromMiddle(s);
      let off = s.p.xz - ROOM.xz * 0.5;
      let petals = 0.5 + 0.5 * cos(atan2(off.y, off.x) * 16.0);
      let rings = 0.6 + 0.4 * cos(out * 70.0);
      let rose = (1.0 - smoothstep(0.5, 0.56, out)) * rings * mix(1.0, 0.75 + 0.25 * petals, smoothstep(0.3, 0.34, out));
      return embossed(s, glowing(plaster(s, LIME), lampGlow(s, lamps())), rose, 0.02);
    }
    // Door frames in white oil paint, coat over coat.
    case TRIM: { return polished(LIME * (0.9 + 0.2 * fbm(vec2f(s.uv.x * 40.0, s.uv.y * 3.0), 104u, 3)), 0.35); }
    default: { return stuff(s); }
  }
}
`,
    PATTERN,
    FINISH,
    STUFF,
    ordinary('home', {
      lamp: [2.5, 1.7, 0.85],
      ambient: [0.014, 0.008, 0.004],
      grid: 1,
      panel: [0.4, 0.4],
      stutter: 0,
      visibility: 45,
      exposure: 1.1,
      glow: 0.22,
      fringe: 0.003,
      vignette: 0.45,
      noise: 0.014,
    }),
  ),
};
