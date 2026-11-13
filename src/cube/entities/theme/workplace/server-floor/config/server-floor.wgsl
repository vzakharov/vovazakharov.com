import package::cube::entities::theme::kit::lib::core::{WALL, FLOOR, OWNED, CEILING, TRIM, Surf, toSides, Material, polished, embossed, Lens, closedAt};
import package::cube::shared::shader::hash::{mix32, hashOf, unitOf, cellHash, valueNoise, fbm, worley};
import package::cube::entities::theme::kit::lib::finish::{band, tiling};
import package::cube::entities::theme::kit::lib::stuff::stuff;
import package::cube::entities::theme::workplace::stencil::lib::stencil::wallAlong;
import package::cube::entities::theme::kit::lib::light::{Lamps, lampGlow, roomLight};
import package::cube::entities::theme::kit::lib::grade::{haze, tonemap, through, grain, vignette};

fn lamps() -> Lamps {
  return
    Lamps(
      vec3f(0.3, 0.45, 0.72),
      vec3f(0.003, 0.005, 0.01),
      2,
      vec2f(0.08, 1.5),
      0.1,
    );
}

/// The cold air under the floor, breathing: what its light is times.
fn underfloor(s: Surf) -> vec3f {
  let breath = 0.8 + 0.2 * sin(s.time * 0.9 + f32(s.cell.x + s.cell.y) * 0.7);
  return vec3f(0.03, 0.16, 0.55) * breath;
}

fn racks(s: Surf) -> Material {
  let h = s.p.y;
  let along = wallAlong(s);
  let fine = valueNoise(s.uv * 120.0, 131u);
  if (h > 2.02) {
    // Over the racks: the dark, and a yellow trough of fibre.
    let trough = band(h, 2.14, 0.12);
    let clip = band(fract(along / 0.625) * 0.625, 0.3125, 0.03);
    let yellow =
      vec3f(0.5, 0.36, 0.02) * (0.8 + 0.3 * fine) * (1.0 - 0.6 * clip);
    return
      embossed(
        s,
        polished(mix(vec3f(0.01, 0.011, 0.013), yellow, trough), 0.35 * trough),
        trough,
        0.02,
      );
  }
  let bay = along / 0.625;
  let x = fract(bay);
  let side = u32(s.normal.x * 2.0 + 3.0) + 8u * u32(s.normal.z * 2.0 + 3.0);
  let rack = hashOf(s.seed, u32(bay) + 64u * side);
  let frame =
    1.0 - smoothstep(
      0.022,
      0.028,
      min(min(x, 1.0 - x) * 0.625, min(h - 0.06, 2.02 - h)),
    );
  let grip = band(x, 0.9, 0.025) * band(h, 1.05, 0.22);

  // Behind the door's mesh, a unit to every 4.45 cm, most of them filled.
  let unit = i32(floor(h / 0.0445));
  let word = hashOf(rack, u32(unit));
  let filled = unitOf(word) < 0.72 && unitOf(rack) < 0.9;
  let lip = smoothstep(0.0, 0.006, fract(h / 0.0445) * 0.0445);
  let face =
    select(
      vec3f(0.006),
      vec3f(0.035, 0.037, 0.04) * (0.6 + 0.8 * unitOf(mix32(word))),
      filled,
    );
  let mesh =
    0.55 + 0.45 * smoothstep(
      0.2,
      0.4,
      length(fract(vec2f(along, h) / 0.009) - 0.5),
    );
  let near = 1.0 - smoothstep(0.004, 0.02, fwidth(along) + fwidth(h));
  var albedo = face * lip * mix(0.78, mesh, near);

  // Its lamps: sixteen places across, a few lit, each to its own beat.
  let place = vec2i(i32(floor(x * 16.0)), unit);
  let led = hashOf(word, u32(place.x));
  let beat = u32(s.time * (1.0 + 7.0 * unitOf(mix32(led)))) + s.hour;
  let on = unitOf(hashOf(led, beat)) < select(0.55, 1.0, (led & 3u) == 0u);
  let dot = (fract(vec2f(x * 16.0, h / 0.0445)) - 0.5) * vec2f(0.039, 0.0445);
  let lamp = 1.0 - smoothstep(0.004, 0.008, length(dot));
  let kind = unitOf(mix32(led ^ 0x51u));
  let hue =
    select(
      select(vec3f(0.1, 1.0, 0.25), vec3f(1.0, 0.5, 0.05), kind > 0.7),
      vec3f(0.15, 0.4, 1.0),
      kind > 0.86,
    );
  let alarm = (led & 0xffu) == 7u;
  let lit = filled && unitOf(led) < 0.16 && x > 0.12 && x < 0.84 && on;
  // Lamps smaller than a pixel go out rather than sparkle.
  let shown =
    f32(lit)
      * lamp
      * (1.0 - smoothstep(0.01, 0.035, fwidth(along) + fwidth(h)));
  let glow = select(hue, vec3f(1.0, 0.03, 0.02), alarm) * (5.0 * shown);

  albedo =
    mix(
      mix(albedo, vec3f(0.012, 0.012, 0.014), frame),
      vec3f(0.2, 0.21, 0.22),
      grip,
    );
  let door =
    Material(
      albedo * (0.85 + 0.3 * fine),
      glow,
      0.25 + 0.4 * frame + 0.3 * grip,
      vec3f(0.0),
    );
  return embossed(s, door, frame + 2.0 * grip - 0.5 * (1.0 - lip), 0.004);
}

fn accessFloor(s: Surf) -> Material {
  let tile = tiling(s.uv, 0.625, 0.007, 132u);
  let chips = worley(s.uv * 60.0, 133u);
  let scratch =
    smoothstep(
      0.7,
      0.85,
      fbm(
        vec2f(s.uv.x * 3.0 + s.uv.y * 2.0, s.uv.y * 60.0 - s.uv.x * 40.0),
        134u,
        3,
      ),
    );
  let laminate =
    vec3f(0.17, 0.175, 0.185)
      * (0.8 + 0.1 * tile.y + 0.25 * step(0.3, chips.x) * chips.y)
      * (1.0 - 0.25 * scratch);
  let cold = underfloor(s);
  // One tile in seven is a grille; one in a hundred was lifted and never put back.
  let grille = step(tile.y, 0.14);
  let lifted = step(0.99, tile.y);
  let hole = 1.0 - smoothstep(0.26, 0.36, length(fract(s.uv / 0.03125) - 0.5));
  let near = 1.0 - smoothstep(0.012, 0.05, fwidth(s.uv.x) + fwidth(s.uv.y));
  let open = max(grille * mix(0.35, hole, near), lifted) * tile.x;
  let albedo = mix(vec3f(0.01), laminate, tile.x) * (1.0 - open);
  let depth = fbm(s.uv * 3.0, 135u, 3);
  let glow =
    cold
      * open
      * mix(0.9, 0.25 + 0.5 * depth, lifted) + cold * (0.5 * (1.0 - tile.x));
  let floorTile =
    Material(albedo, glow, 0.62 * tile.x * (1.0 - open), vec3f(0.0));
  return
    embossed(
      s,
      floorTile,
      tile.x * (1.0 + 0.3 * tile.y) - open - 0.2 * scratch,
      0.003,
    );
}

fn cableTrays(s: Surf) -> Material {
  let dust = fbm(s.uv * 2.0, 136u, 3);
  var albedo = vec3f(0.016, 0.018, 0.024) * (0.6 + 0.8 * dust);
  var height = 0.0;
  // A ladder tray down the middle, and what lies in it.
  let across = s.p.x - 2.5;
  let within = 1.0 - smoothstep(0.2, 0.204, abs(across));
  let strand = floor(across / 0.024);
  let word = cellHash(vec2i(i32(strand), i32(s.cell.x)), 137u);
  let sag = 0.012 * sin(s.uv.y * 2.3 + unitOf(word) * 6.0);
  let core = abs(fract((across + sag) / 0.024) - 0.5) * 2.0;
  let kind = unitOf(mix32(word));
  let jacket =
    select(
      select(vec3f(0.02, 0.02, 0.024), vec3f(0.02, 0.06, 0.22), kind > 0.6),
      vec3f(0.4, 0.3, 0.02),
      kind > 0.85,
    );
  let cable = jacket * 0.5 * (0.25 + 0.75 * sqrt(max(1.0 - core * core, 0.0)));
  let rung = band(fract(s.uv.y / 0.3) * 0.3, 0.15, 0.03);
  let rail = band(abs(across), 0.2, 0.025);
  let steel = vec3f(0.22, 0.23, 0.24);
  let ladder = clamp(rail + rung * within, 0.0, 1.0);
  albedo = mix(mix(albedo, cable, within), steel * (0.7 + 0.5 * dust), ladder);
  height = mix(height, 0.5 + 0.3 * (1.0 - core), within) + ladder;
  return
    embossed(
      s,
      Material(albedo, lampGlow(s, lamps()), 0.2 * within, vec3f(0.0)),
      height,
      0.03,
    );
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return racks(s);
    }
    case FLOOR, OWNED: {
      return accessFloor(s);
    }
    case CEILING: {
      return cableTrays(s);
    }
    case TRIM: {
      return
        polished(
          vec3f(0.2, 0.21, 0.22) * (0.8 + 0.3 * valueNoise(s.uv * 90.0, 138u)),
          0.3,
        );
    }
    default: {
      return stuff(s);
    }
  }
}

fn themeLight(s: Surf, m: Material) -> vec3f {
  var colour = roomLight(s, m, lamps());
  let normal = normalize(s.normal + m.relief);
  // The floor's glow reaches whatever stands on it, less the higher it is,
  // and the racks' lamps wash the floor at their feet.
  let rising =
    (0.35 + 0.65 * max(-normal.y, 0.0))
      * exp(-s.p.y / 0.55)
      * step(normal.y, 0.5);
  colour += m.albedo * underfloor(s) * (1.2 * rising);
  if (s.normal.y > 0.5) {
    let toSide = toSides(s);
    var wash = 0.0;
    for (var side = 0u; side < 4u; side++) {
      if (closedAt(s, side)) {
        wash += exp(-toSide[side] / 0.45);
      }
    }
    let flicker =
      0.75 + 0.25 * valueNoise(vec2f(s.time * 3.0, f32(s.seed & 255u)), 139u);
    colour += m.albedo * vec3f(0.02, 0.11, 0.05) * (wash * flicker);
  }
  return haze(colour, s, AIR, 24.0);
}

fn themeLens(l: Lens) -> vec3f {
  let seen = through(l, 0.34, 0.008) * 1.35;
  // The shutter rolls against the lamps' flicker: a dim bar climbs the frame.
  let bar = 0.93 + 0.07 * sin((l.uv.y * 2.5 + l.time * 0.6) * 6.2832);
  let graded = tonemap(seen * bar) * vec3f(0.92, 1.0, 1.1);
  let line = 0.985 + 0.015 * sin(l.pixel.y * 3.1416);
  return graded * line * vignette(l, 0.5) + grain(l) * 0.03;
}
