import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, ROOM, Surf, alongWall, Material, matte, polished, glowing, embossed, Lens};
import package::cube::shared::shader::hash::{mix32, unitOf, valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::{band, plaster, carpet, damp};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::kit::lib::light::{Lamps, roomLight};
import package::cube::entities::theme::dwelling::household::lib::household::{wallWord, boxAway, within, fromLamp, burning, halfDrop};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, through, grain, vignette};
import package::cube::entities::theme::kit::lib::scene::sceneAt;

fn lamps() -> Lamps {
  return
    Lamps(vec3f(4.6, 3.3, 2.0), vec3f(0.012, 0.009, 0.007), 1, vec2f(0.4), 0.0);
}

fn rosePaper(s: Surf) -> Material {
  let y = s.p.y;
  let cell = halfDrop(s.uv, vec2f(0.4, 0.5), 0xa0u);
  let q = cell.xy;
  let r = length(q);
  let turn = atan2(q.y, q.x) + cell.z * 6.0;
  let bloom = within(r - 0.12 - 0.012 * cos(turn * 5.0), 0.004);
  let petal = 0.5 + 0.5 * sin(turn * 3.0 + r * 110.0);
  let heart = within(r - 0.03, 0.012);
  let leafA =
    length((q - vec2f(0.15, -0.07)) * mat2x2f(0.8, 0.6, -1.5, 2.0)) - 0.075;
  let leafB =
    length((q + vec2f(0.14, -0.1)) * mat2x2f(0.8, -0.6, 1.5, 2.0)) - 0.075;
  let leaf = within(min(leafA, leafB), 0.004) * (1.0 - bloom);
  let bud = within(length(abs(q) - vec2f(0.2, 0.25)) - 0.026, 0.004);
  let pin = band(fract(s.uv.x / 0.02) * 0.02, 0.01, 0.002);

  var paper = vec3f(0.47, 0.4, 0.27) * (1.0 - 0.07 * pin);
  paper = mix(paper, vec3f(0.12, 0.2, 0.09) * (0.8 + 0.4 * petal), leaf);
  paper =
    mix(
      paper,
      mix(vec3f(0.42, 0.1, 0.11), vec3f(0.56, 0.27, 0.24), petal),
      bloom,
    );
  paper = mix(paper, vec3f(0.25, 0.04, 0.05), heart * bloom);
  paper = mix(paper, vec3f(0.5, 0.33, 0.12), bud);

  let wall = wallWord(s);
  let middle = vec2f(1.2 + 2.6 * unitOf(wall), 1.42);
  let size =
    vec2f(
      0.2 + 0.25 * unitOf(mix32(wall)),
      0.16 + 0.2 * unitOf(mix32(wall ^ 0x7u)),
    );
  let hung = boxAway(vec2f(alongWall(s), y) - middle, size);
  let kept = within(hung, 0.006) * step(unitOf(mix32(wall ^ 0x1fu)), 0.7);
  let smoke =
    0.62
      + 0.14 * fbm(s.uv * 1.3, s.seed ^ 0xa1u, 3)
      - 0.16 * smoothstep(0.4, ROOM.y, y);
  let outline = band(hung, 0.012, 0.02) * (1.0 - kept);
  paper *=
    mix(
      vec3f(smoke, smoke * 0.94, smoke * 0.78),
      vec3f(1.06),
      kept,
    ) * (1.0 - 0.2 * outline);
  paper = plaster(s, paper);

  let rail = band(y, 1.99, 0.045);
  let frieze = within(2.012 - y, 0.003);
  let skirting = within(y - 0.2, 0.004);
  let wood =
    vec3f(0.11, 0.05, 0.022) * (0.6 + 0.7 * fbm(
      vec2f(s.uv.x * 3.0, y * 90.0),
      0xa2u,
      3,
    ));
  var albedo = mix(paper, plaster(s, vec3f(0.42, 0.35, 0.22)), frieze);
  albedo = mix(albedo, wood, max(rail, skirting));
  let trim = max(rail, skirting);
  let lift = 0.3 * bloom * petal + 0.2 * leaf + 0.1 * pin;
  return
    embossed(
      s,
      polished(albedo, mix(0.05, 0.45, trim)),
      lift * (1.0 - trim) + 6.0 * trim,
      0.003,
    );
}

fn swirlCarpet(s: Surf) -> Material {
  let cell = halfDrop(s.uv, vec2f(0.5, 0.5), 0xa3u);
  let q = cell.xy;
  let r = length(q);
  let turn = atan2(q.y, q.x) * select(-1.0, 1.0, cell.z > 0.5);
  let arm = fract(turn / 3.14159 + r * 9.0);
  let coil = within(r - 0.2, 0.01);
  let lattice =
    within(abs(abs(q.x) + abs(q.y) - 0.27) - 0.014, 0.006) * (1.0 - coil);
  var wool = vec3f(0.075, 0.035, 0.02);
  wool = mix(wool, vec3f(0.36, 0.13, 0.025), coil * step(arm, 0.42));
  wool = mix(wool, vec3f(0.4, 0.27, 0.06), coil * step(arm, 0.14));
  wool = mix(wool, vec3f(0.13, 0.14, 0.04), lattice);
  wool = mix(wool, vec3f(0.3, 0.07, 0.03), within(r - 0.035, 0.008));
  let trodden = 0.75 + 0.35 * fbm(s.uv * 0.5, 0xa4u, 3);
  let pile = valueNoise(s.uv * 260.0, 0xa5u);
  return
    embossed(
      s,
      matte(carpet(s, wool) * trodden * 1.15),
      pile + 0.6 * coil * step(arm, 0.42),
      0.002,
    );
}

fn combed(s: Surf) -> Material {
  let p = s.uv / 0.3;
  let row = floor(p.y * 2.0);
  let upper =
    vec2f(floor(p.x - 0.5 * fract((row + 1.0) * 0.5) * 2.0 + 0.5), row + 1.0);
  let lower = vec2f(floor(p.x - 0.5 * fract(row * 0.5) * 2.0 + 0.5), row);
  let upperAt = vec2f(upper.x + fract((row + 1.0) * 0.5), upper.y * 0.5);
  let lowerAt = vec2f(lower.x + fract(row * 0.5), lower.y * 0.5);
  let near = distance(p, upperAt);
  let fan = select(distance(p, lowerAt), near, near < 0.56);
  let comb = 0.5 + 0.5 * cos(fan * 42.0);
  let off = fromLamp(s, 1);
  let r = length(off);
  let scallop = 0.2 + 0.014 * cos(atan2(off.y, off.x) * 22.0);
  let shade = within(r - scallop, 0.006);
  let tassel = band(r, scallop - 0.012, 0.016);
  let cloth = 0.6 + 0.4 * smoothstep(0.2, 0.0, r);
  let glow =
    lamps().colour
      * vec3f(1.0, 0.82, 0.7)
      * (2.6 * shade * cloth * burning(s, lamps()));
  let white =
    vec3f(0.47, 0.41, 0.29)
      * (0.9 + 0.1 * fbm(s.uv * 2.0, s.seed ^ 0xa6u, 3))
      * (1.0 - 0.5 * damp(s));
  let albedo =
    mix(
      white,
      mix(vec3f(0.5, 0.3, 0.22), vec3f(0.4, 0.26, 0.08), tassel),
      shade,
    );
  return
    embossed(
      s,
      glowing(albedo, glow),
      comb * (1.0 - shade) - 3.0 * shade,
      0.004,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return rosePaper(s);
    }
    case FLOOR, OWNED: {
      return swirlCarpet(s);
    }
    case CEILING: {
      return combed(s);
    }
    case TRIM: {
      return
        polished(
          vec3f(0.11, 0.05, 0.022) * (0.7 + 0.5 * fbm(
            vec2f(s.uv.x * 60.0, s.uv.y * 2.0),
            0xa2u,
            3,
          )),
          0.4,
        );
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  return haze(roomLight(s, m, lamps()), s, AIR, 40.0);
}

/// The frame as a colour print forty years in an album: out of focus by a
/// hair, its blacks gone brown and its cyan gone altogether, struck by light
/// down one edge, specked where the emulsion lifted.
fn themeLens(l: Lens) -> vec3f {
  let px = 2.2 / l.size;
  var seen = through(l, 0.34, 0.01) * 0.4;
  seen +=
    0.15 * (sceneAt(l.uv + px).rgb
      + sceneAt(l.uv - px).rgb
      + sceneAt(l.uv + vec2f(px.x, -px.y)).rgb
      + sceneAt(l.uv - vec2f(px.x, -px.y)).rgb);
  let film = tonemap(seen * 1.1);
  let luma = dot(film, vec3f(0.3, 0.59, 0.11));
  var print = mix(vec3f(luma), film, 0.88);
  print = print * vec3f(0.92, 0.84, 0.68) + vec3f(0.1, 0.065, 0.05);
  let leak = smoothstep(0.72, 1.08, l.uv.x + 0.07 * sin(l.uv.y * 5.0));
  print += vec3f(0.5, 0.17, 0.03) * leak * leak;
  let at = l.uv * vec2f(l.size.x / l.size.y, 1.0);
  let speck = worley(at * 26.0, 0xa7u);
  let lifted = step(speck.x, 0.035) * step(0.965, speck.y);
  let hair =
    band(at.x + 0.02 * sin(at.y * 9.0), 0.31, 0.0015) * step(
      0.55,
      fract(at.y * 1.7),
    );
  print = mix(print, vec3f(0.86, 0.8, 0.68), max(lifted, 0.3 * hair));
  return print * vignette(l, 0.5) + grain(l) * 0.03;
}
