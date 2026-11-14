// Generated from conference-hotel.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, GRADE, LIGHT, STUFF } from '../../../kit';
import { STENCIL } from '../../stencil';

export const CONFERENCE_HOTEL_SHADER = wgsl(
  'cube/entities/theme/workplace/conference-hotel/config/conference-hotel',
  /* wgsl */ `
fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(1.5, 1.02, 0.56),
      vec3f(0.006, 0.004, 0.002),
      2,
      vec2f(0.2, 0.2),
      0.04,
    );
}

/// Where the wall lights hang: metres up, and along from either end of a wall.
const SCONCE = vec2f(1.25, 1.66);

/// From the nearer wall light to the point on its wall: x along, y up.
fn fromSconce(s: Surf) -> vec2f {
  let along = wallAlong(s);
  return vec2f(min(along, ROOM.x - along) - SCONCE.x, s.p.y - SCONCE.y);
}

fn woven(s: Surf) -> Material {
  // Tufts blur every edge of the pattern by a tuft.
  let tuft = valueNoise(s.uv * 110.0, 141u);
  let q = s.uv / 0.9;
  let c = fract(q) - 0.5;
  let r = length(c) + 0.012 * (tuft - 0.5);
  let a = atan2(c.y, c.x);
  let k = fract(q + 0.5) - 0.5;
  let rk = length(k) + 0.012 * (tuft - 0.5);
  let ak = atan2(k.y, k.x);
  let soft = clamp(fwidth(q.x) + fwidth(q.y), 0.004, 0.2);

  let vine =
    sin(q.x * 12.566 + 1.6 * sin(q.y * 12.566)) * sin(
      q.y * 12.566 + 1.6 * sin(q.x * 12.566),
    );
  let scroll = smoothstep(-soft * 6.0, soft * 6.0, vine - 0.25);
  let rosette = 1.0 - smoothstep(-soft, soft, r - 0.25 - 0.07 * cos(a * 8.0));
  let heart =
    1.0 - smoothstep(-soft, soft, r - 0.1 - 0.03 * cos(a * 8.0 + 3.1416));
  let ring =
    1.0 - smoothstep(
      0.016 - soft,
      0.016 + soft,
      abs(r - 0.4 - 0.015 * cos(a * 16.0)),
    );
  let knot = 1.0 - smoothstep(-soft, soft, rk - 0.09 - 0.05 * cos(ak * 4.0));
  let trellis =
    1.0 - smoothstep(
      0.012 - soft,
      0.012 + soft,
      abs(abs(k.x) + abs(k.y) - 0.27),
    );

  let wine = vec3f(0.1, 0.012, 0.022);
  let navy = vec3f(0.016, 0.02, 0.06);
  let gold = vec3f(0.3, 0.19, 0.055);
  let teal = vec3f(0.012, 0.075, 0.075);
  let cream = vec3f(0.33, 0.27, 0.17);
  var yarn = mix(wine, navy, scroll);
  yarn = mix(yarn, cream, max(ring, trellis));
  yarn = mix(yarn, gold, max(rosette, knot));
  yarn = mix(yarn, teal, heart);

  // Along every wall there is, a border: navy between two gold lines.
  let inset = wallInset(s);
  let border = 1.0 - smoothstep(0.42, 0.43, inset);
  let lines =
    clamp(band(inset, 0.42, 0.035) + band(inset, 0.3, 0.02), 0.0, 1.0);
  yarn = mix(mix(yarn, navy, border), gold, lines);

  let trodden = fbm(s.uv * 0.5, 142u, 3);
  let pile = yarn * (0.66 + 0.5 * tuft) * (0.8 + 0.35 * trodden);
  return embossed(s, matte(pile), tuft + 0.4 * (rosette + ring), 0.002);
}

/// 1 on a damask's figure, 0 on its ground: a leafed spade in every cell
/// of a half-drop lattice.
fn damask(at: vec2f) -> f32 {
  let column = floor(at.x);
  let c =
    vec2f(
      abs(fract(at.x) - 0.5),
      fract(at.y + 0.5 * (column - 2.0 * floor(column * 0.5))) - 0.5,
    );
  let soft = clamp(fwidth(at.x) + fwidth(at.y), 0.004, 0.25);
  let lift = c.y + 0.5;
  let spade =
    0.34
      * pow(sin(3.1416 * lift), 0.7)
      * (0.55 + 0.45 * sin(3.1416 * lift * 1.5));
  let leafed = sin(c.x * 34.0 - c.y * 16.0) * sin(c.y * 30.0 + c.x * 9.0);
  let body =
    smoothstep(-soft, soft, spade - c.x) * smoothstep(
      -soft * 4.0,
      soft * 4.0,
      leafed + 0.45,
    );
  let stem = 1.0 - smoothstep(0.012 - soft, 0.012 + soft, c.x);
  let bud =
    1.0 - smoothstep(
      -soft,
      soft,
      length(vec2f(c.x, c.y - 0.42) * vec2f(1.0, 0.7)) - 0.05,
    );
  return clamp(max(body, max(stem * step(0.0, c.y), bud)), 0.0, 1.0);
}

fn papered(s: Surf) -> Material {
  let h = s.p.y;
  let along = wallAlong(s);
  let fine = valueNoise(s.uv * 150.0, 143u);
  let age = fbm(s.uv * 0.6, s.seed ^ 0x90u, 4);

  // Paper: a satin figure on a matt ground, with the seams of its drops.
  let figure = damask(vec2f(along / 0.44, h / 0.62));
  let drop = 1.0 - smoothstep(0.0, 0.004, abs(spaced(along, 0.53)));
  let ground =
    vec3f(0.4, 0.29, 0.13) * (0.82 + 0.3 * age) * (0.95 + 0.08 * fine);
  let paper =
    mix(ground, ground * vec3f(0.74, 0.66, 0.52), figure)
      * (1.0 - 0.25 * drop)
      * (1.0 - 0.4 * damp(s));

  // Mahogany below the rail: a raised panel to every five-eighths of a metre.
  let x = fract(along / 0.625) * 0.625;
  let edge = min(min(x, 0.625 - x) - 0.075, min(h - 0.2, 0.86 - h));
  let field =
    smoothstep(0.0, 0.03, edge) * (1.0 - 0.35 * smoothstep(0.03, 0.06, edge));
  let groove = 1.0 - smoothstep(0.0, 0.006, abs(edge));
  let grain =
    fbm(vec2f(along * 50.0 + floor(along / 0.625) * 7.0, h * 1.3), 144u, 3);
  let wood =
    vec3f(0.15, 0.045, 0.022) * (0.55 + 0.75 * grain) * (1.0 - 0.6 * groove);
  let low = 1.0 - smoothstep(0.93, 0.934, h);
  let rail = band(h, 0.96, 0.07);
  let skirting = 1.0 - smoothstep(0.13, 0.134, h);

  // Plaster cornice over it all, two beads and a cove.
  let high = smoothstep(2.1, 2.104, h);
  let cove = smoothstep(2.1, 2.3, h);
  let beads = band(h, 2.125, 0.03) + band(h, 2.19, 0.02);
  let plasterwork = vec3f(0.5, 0.44, 0.33) * (0.85 + 0.2 * age);

  // The wall light: a brass plate and a frosted half-shade.
  let off = fromSconce(s);
  let plate =
    (1.0 - smoothstep(0.045, 0.05, abs(off.x))) * band(off.y, -0.1, 0.24);
  let shade =
    1.0 - smoothstep(
      0.0,
      0.008,
      length(
        vec2f(off.x, max(off.y, 0.0) * 0.6 + min(off.y, 0.0) * 1.3),
      ) - 0.085,
    );
  let brass = vec3f(0.5, 0.32, 0.08) * (0.7 + 0.4 * fine);
  let ribbed = 0.8 + 0.2 * cos(off.x * 6.2832 / 0.014);
  let glow =
    vec3f(2.6, 1.55, 0.6) * (shade
      * ribbed
      * (1.0 - smoothstep(-0.02, 0.12, off.y) * 0.5));

  var albedo = mix(mix(paper, wood, low), plasterwork, high);
  albedo =
    mix(
      albedo,
      vec3f(0.12, 0.035, 0.018) * (0.6 + 0.6 * grain),
      clamp(rail + skirting, 0.0, 1.0),
    );
  albedo = mix(mix(albedo, brass, plate), vec3f(0.5, 0.45, 0.35), shade);
  let gloss =
    mix(
      mix(mix(0.04 + 0.3 * figure, 0.55, low), 0.1, high),
      0.75,
      plate * (1.0 - shade),
    );
  let height =
    mix(0.1 * figure, field - 0.5 * groove + 0.1 * grain, low)
      + 1.5 * rail * (1.0 - smoothstep(0.0, 0.035, abs(h - 0.96)))
      + skirting
      + high * (1.5 * cove + 0.6 * beads)
      + 2.0 * plate
      + 6.0 * shade;
  return embossed(s, Material(albedo, glow, gloss, vec3f(0.0)), height, 0.006);
}

fn coffered(s: Surf) -> Material {
  let c = repeated(s.p.xz, vec2f(2.5));
  let d = max(abs(c.x), abs(c.y));
  let r = length(c);
  let age = fbm(s.uv * 0.9, s.seed ^ 0x91u, 4);
  // A beam between coffers, stepped down to each in two mouldings.
  let beam = smoothstep(1.0, 1.035, d);
  let step1 = smoothstep(0.84, 0.875, d);
  let gilt = band(d, 0.935, 0.03);
  let rose = band(r, 0.3, 0.035) + band(r, 0.2, 0.012);
  let cream =
    vec3f(0.5, 0.43, 0.31)
      * (0.8 + 0.25 * age)
      * (1.0 - 0.12 * step1 - 0.1 * beam);
  let can = 1.0 - smoothstep(0.1, 0.108, r);
  let trim = band(r, 0.125, 0.035);
  let level = lampLevel(s, vec2i(0), litOf(s), lamps().stutter);
  let glow = lamps().colour * (GLARE * can * level);
  var albedo =
    mix(cream, vec3f(0.42, 0.3, 0.12), 0.6 * gilt) * (1.0 - 0.5 * damp(s));
  albedo = mix(albedo, vec3f(0.5, 0.48, 0.42), trim);
  let height = -(0.55 * step1 + 0.45 * beam) + 0.06 * rose + 0.03 * age;
  return
    embossed(
      s,
      Material(albedo, glow, 0.25 * gilt + 0.4 * trim, vec3f(0.0)),
      height,
      0.3,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return papered(s);
    }
    case FLOOR, OWNED: {
      return woven(s);
    }
    case CEILING: {
      return coffered(s);
    }
    case TRIM: {
      // A column cased in the wainscot's mahogany, plaster above.
      let grain = fbm(vec2f(s.uv.x * 50.0, s.p.y * 1.3), 145u, 3);
      let wood = vec3f(0.15, 0.045, 0.022) * (0.55 + 0.75 * grain);
      let low = 1.0 - smoothstep(0.93, 0.934, s.p.y);
      let plasterwork =
        vec3f(0.5, 0.44, 0.33) * (0.9 + 0.15 * fbm(s.uv * 2.0, 146u, 3));
      return polished(mix(plasterwork, wood, low), mix(0.08, 0.55, low));
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  var colour = roomLight(s, m, lamps());
  if (s.kind == WALL) {
    // A wall light washes its own wall, up and down from the shade.
    let off = fromSconce(s);
    let spread = 0.16 + 0.55 * abs(off.y);
    let wash =
      exp(-off.x * off.x / (spread * spread)) / (1.0 + 7.0 * off.y * off.y);
    colour += m.albedo * vec3f(1.3, 0.78, 0.3) * (wash * cornerShade(s));
  }
  return haze(colour, s, AIR, 42.0);
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, 0.2, 0.005) * 1.1;
  return
    tonemap(seen) * vec3f(1.03, 1.0, 0.94) * vignette(l, 0.42) + grain(
      l,
    ) * 0.016;
}
`,
  CORE,
  HASH,
  FINISH,
  STUFF,
  STENCIL,
  LIGHT,
  GRADE,
);
