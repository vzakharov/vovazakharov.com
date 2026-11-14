// Generated from drawing.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, GRADE, LIGHT, SCENE, STUFF } from '../../../kit';
import { HOUSEHOLD } from '../../household';

export const DRAWING_SHADER = wgsl(
  'cube/entities/theme/dwelling/drawing/config/drawing',
  /* wgsl */ `
const SUGAR = vec3f(0.62, 0.57, 0.45);

fn lamps() -> Lamps {
  return Lamps(vec3f(1.0), vec3f(0.0), 1, vec2f(0.4), 0.0);
}

/// \`colour\` scribbled over the paper in strokes leaning \`lean\` radians,
/// the paper's tooth showing through wherever the wax skipped.
fn wax(uv: vec2f, colour: vec3f, lean: f32, salt: u32) -> vec3f {
  let along = vec2f(cos(lean), sin(lean));
  let stroke =
    fbm(
      vec2f(dot(uv, vec2f(-along.y, along.x)) * 26.0, dot(uv, along) * 1.4),
      salt,
      3,
    );
  let tooth = valueNoise(uv * 230.0, salt + 5u);
  let cover = smoothstep(0.2, 0.55, stroke + 0.4 * tooth - 0.12);
  return mix(SUGAR, colour, cover * (0.8 + 0.2 * tooth));
}

/// A line drawn by hand along where \`away\` is nought, \`width\` thick.
fn drawn(uv: vec2f, away: f32, width: f32) -> f32 {
  let wobble = 0.012 * (fbm(uv * 4.0, 0x140u, 2) - 0.5);
  return
    band(away + wobble, 0.0, width) * (0.65 + 0.35 * valueNoise(
      uv * 230.0,
      0x141u,
    ));
}

fn houseWall(s: Surf) -> Material {
  let y = s.p.y;
  let at = vec2f(alongWall(s), y);
  let slot = floor(at.x / 1.66);
  let x = at.x - (slot + 0.5) * 1.66;
  let roll = hashOf(wallWord(s), u32(slot) + 0x142u);
  let what = unitOf(roll);
  let lean = 0.6 + 0.5 * unitOf(mix32(s.seed));
  var crayon = wax(s.uv, vec3f(0.6, 0.42, 0.06), lean, 0x143u);
  var ink = 0.0;

  if (what < 0.55) {
    let pane = boxAway(vec2f(x, y - 1.3), vec2f(0.36, 0.33));
    crayon =
      mix(
        crayon,
        wax(s.uv, vec3f(0.12, 0.3, 0.6), -0.5, 0x144u),
        within(pane, 0.004),
      );
    let drape = max(pane, 0.22 - abs(x) - 0.5 * (y - 1.0));
    crayon =
      mix(
        crayon,
        wax(s.uv, vec3f(0.55, 0.08, 0.1), 1.4, 0x145u),
        within(drape, 0.004) * step(what, 0.3),
      );
    let bars = min(abs(x), abs(y - 1.3));
    ink =
      max(
        drawn(s.uv, pane, 0.014),
        drawn(s.uv, bars, 0.01) * within(pane, 0.004),
      );
  } else if (what < 0.8) {
    let leaf = boxAway(vec2f(x, y - 0.8), vec2f(0.34, 0.86));
    crayon =
      mix(
        crayon,
        wax(s.uv, vec3f(0.3, 0.13, 0.04), 1.57, 0x146u),
        within(leaf, 0.004),
      );
    let knob = length(vec2f(x - 0.22, y - 0.85)) - 0.035;
    crayon = mix(crayon, vec3f(0.6, 0.5, 0.05), within(knob, 0.004));
    ink = max(drawn(s.uv, leaf, 0.014), drawn(s.uv, knob, 0.008));
  }

  let bed = floor(at.x / 0.36);
  let fx = at.x - (bed + 0.5) * 0.36;
  let tall = 0.2 + 0.22 * unitOf(hashOf(wallWord(s), u32(bed) + 0x147u));
  let stem = drawn(s.uv, abs(fx + 0.03 * sin(y * 20.0)), 0.012) * step(y, tall);
  let bloom = length(vec2f(fx, y - tall)) - 0.06;
  let petal = vec3f(0.6, 0.07, 0.1 + 0.4 * unitOf(hashOf(u32(bed), 0x148u)));
  let grass = within(y - 0.07 - abs(spaced(at.x, 0.05)), 0.004);
  crayon = mix(crayon, vec3f(0.07, 0.33, 0.06), max(stem, grass));
  crayon = mix(crayon, wax(s.uv, petal, 0.3, 0x149u), within(bloom, 0.004));
  crayon = mix(crayon, vec3f(0.62, 0.5, 0.05), within(bloom + 0.04, 0.004));
  ink = max(ink, drawn(s.uv, bloom, 0.008));
  return matte(mix(crayon, vec3f(0.03, 0.025, 0.03), ink));
}

fn planked(s: Surf) -> Material {
  let crayon = wax(s.uv, vec3f(0.42, 0.2, 0.05), 0.08, 0x14au);
  let row = (fract(s.uv.y / 0.5) - 0.5) * 0.5;
  let butt = (fract(s.uv.x / 1.7 + 0.37 * floor(s.uv.y / 0.5)) - 0.5) * 1.7;
  let ink = max(drawn(s.uv, row, 0.012), drawn(s.uv, butt, 0.01));
  return matte(mix(crayon, vec3f(0.03, 0.025, 0.03), ink));
}

fn sky(s: Surf) -> Material {
  let puff = fbm(s.uv * 0.9, s.seed ^ 0x14bu, 3) - 0.56;
  var crayon = wax(s.uv, vec3f(0.2, 0.42, 0.7), 0.9, 0x14cu);
  crayon = mix(crayon, mix(SUGAR, vec3f(0.7), 0.6), within(-puff, 0.01));
  var ink = drawn(s.uv, puff, 0.012);
  let off = fromLamp(s, 1);
  let r = length(off);
  let ray = abs(fract(atan2(off.y, off.x) * 1.9098593) - 0.5);
  let up = litOf(s);
  let disc = within(r - 0.3, 0.006);
  let rays = within(ray * r - 0.025, 0.01) * step(0.38, r) * step(r, 0.75) * up;
  let sun = mix(vec3f(0.5, 0.5, 0.56), vec3f(0.75, 0.55, 0.04), up);
  crayon = mix(crayon, wax(s.uv, sun, 0.4, 0x14du), max(disc, rays));
  let smile =
    max(
      abs(length(off - vec2f(0.0, -0.02)) - 0.16) - 0.008,
      -off.y - 0.02 + 0.09,
    );
  let eyes = length(vec2f(abs(off.x) - 0.09, off.y + 0.08)) - 0.022;
  ink =
    max(
      ink,
      max(
        drawn(s.uv, r - 0.3, 0.012),
        max(within(smile, 0.004), within(eyes, 0.004)) * up,
      ),
    );
  return matte(mix(crayon, vec3f(0.03, 0.025, 0.03), ink));
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return houseWall(s);
    }
    case FLOOR, OWNED: {
      return planked(s);
    }
    case CEILING: {
      return sky(s);
    }
    case TRIM: {
      return matte(wax(s.uv, vec3f(0.5, 0.1, 0.08), 1.5, 0x14eu));
    }
    default: {
      let made = stuff(s);
      return
        matte(
          wax(s.uv * 3.0, made.albedo * 1.6 + made.emission * 0.3, 0.7, 0x14fu),
        );
    }
  }
}

/// Nothing here is lit: a face is its crayon, by day where the suns around
/// it are up and by a blue night where they are not, the one turning into
/// the other across a room's width so no line shows at an open side.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let day = smoothstep(0.0, 0.3, lampReach(s, s.normal, 0.0, lamps()).z);
  let face = 0.86 + 0.14 * abs(s.normal.y) + 0.08 * s.normal.x;
  return m.albedo * face * mix(vec3f(0.16, 0.2, 0.42), vec3f(1.0), day);
}

/// The frame as a drawing: the scene's flat colour on paper, and a black
/// wax line wherever the picture turns a corner or one thing stands in front
/// of another, redrawn six times a second by a hand that never repeats itself.
fn themeLens(l: Lens) -> vec3f {
  let take = f32(u32(l.time * 6.0) % 16u);
  let wobble =
    vec2f(
      valueNoise(l.uv * 11.0 + take * 3.1, 0x150u),
      valueNoise(l.uv * 11.0 - take * 2.3, 0x151u),
    ) - 0.5;
  let uv = l.uv + wobble * 0.007;
  let px = vec2f(l.size.y / l.size.x, 1.0) * 0.0035;
  let here = sceneAt(uv);
  let z = 1.0 / max(here.a, 0.05);
  let east = 1.0 / max(sceneAt(uv + vec2f(px.x, 0.0)).a, 0.05);
  let west = 1.0 / max(sceneAt(uv - vec2f(px.x, 0.0)).a, 0.05);
  let north = 1.0 / max(sceneAt(uv - vec2f(0.0, px.y)).a, 0.05);
  let south = 1.0 / max(sceneAt(uv + vec2f(0.0, px.y)).a, 0.05);
  let bend = (abs(east + west - 2.0 * z) + abs(north + south - 2.0 * z)) / z;
  let tooth = valueNoise(l.pixel * 0.45, 0x152u);
  let line = smoothstep(0.012, 0.035, bend) * (0.7 + 0.3 * tooth);
  let page = pow(clamp(here.rgb, vec3f(0.0), vec3f(1.0)), vec3f(1.0 / 2.2));
  let drawing = mix(page, vec3f(0.07, 0.06, 0.07), line);
  return drawing * (0.94 + 0.06 * tooth) * vignette(l, 0.18);
}
`,
  CORE,
  HASH,
  FINISH,
  STUFF,
  LIGHT,
  HOUSEHOLD,
  GRADE,
  SCENE,
);
