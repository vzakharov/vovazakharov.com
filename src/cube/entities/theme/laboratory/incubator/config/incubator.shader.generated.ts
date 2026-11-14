// Generated from incubator.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, GRADE, LIGHT, LUMA, SCENE, STUFF } from '../../../kit';

export const INCUBATOR_SHADER = wgsl(
  'cube/entities/theme/laboratory/incubator/config/incubator',
  /* wgsl */ `
/// A material that is only a temperature: 0 the coldest thing in the frame,
/// 1 the hottest.
fn warm(heat: f32) -> Material {
  return matte(vec3f(clamp(heat, 0.0, 1.0)));
}

/// 1 inside an ellipse of half-axes \`size\` about \`middle\`, soft-edged as
/// warmth is.
fn blot(at: vec2f, middle: vec2f, size: vec2f) -> f32 {
  return 1.0 - smoothstep(0.6, 1.1, length((at - middle) / size));
}

/// The warmth a walker left on the floor: one walks each row of rooms from
/// west to east, a pace every seventy centimetres, and a print fades in
/// twenty seconds.
fn footprints(s: Surf) -> f32 {
  let speed = 0.9;
  let lap = 16.0;
  let path = 2.5 + 0.9 * sin(s.uv.x * 0.45) + 0.3 * sin(s.uv.x * 1.7);
  let pace = floor(s.uv.x / 0.7);
  let foot = f32(i32(pace) & 1) * 2.0 - 1.0;
  let at = vec2f(fract(s.uv.x / 0.7) * 0.7, s.p.z - path - 0.11 * foot);
  let sole =
    blot(at, vec2f(0.4, 0.0), vec2f(0.1, 0.05)) + blot(
      at,
      vec2f(0.24, 0.0),
      vec2f(0.055, 0.04),
    );
  let walker = fract(s.time * speed / lap) * lap;
  let behind = fract((walker - (pace + 0.5) * 0.7) / lap) * lap;
  return clamp(sole, 0.0, 1.0) * exp(-behind / (speed * 20.0));
}

fn warmFloor(s: Surf) -> Material {
  let slab = 0.2 + 0.1 * fbm(s.uv * 0.6, 501u, 3);
  let joist = 0.04 * (1.0 - smoothstep(0.02, 0.06, abs(spaced(s.uv.y, 0.6))));
  return warm(slab - joist + 0.6 * footprints(s));
}

/// A hand laid flat on the wall and taken away.
fn handprint(at: vec2f) -> f32 {
  var hand = blot(at, vec2f(0.0, 0.0), vec2f(0.05, 0.055));
  for (var finger = 0; finger < 4; finger++) {
    let x = (f32(finger) - 1.5) * 0.026;
    hand +=
      blot(
        at,
        vec2f(x, 0.095 - 0.012 * abs(f32(finger) - 1.6)),
        vec2f(0.011, 0.045),
      );
  }
  hand += blot(at, vec2f(-0.065, 0.02), vec2f(0.014, 0.035));
  return clamp(hand, 0.0, 1.0);
}

fn coiledWall(s: Surf) -> Material {
  let h = s.p.y;
  let plasterHeat =
    0.24 + 0.08 * fbm(s.uv * 1.3, s.seed ^ 0x50u, 3) + 0.05 * h / ROOM.y;
  // Hot water goes in at the top run and comes back cooler along the bottom.
  let run = (h - 0.25) / 0.22;
  let coil =
    step(0.0, run) * step(run, 6.0) * exp(-pow((fract(run) - 0.5) * 9.0, 2.0));
  let spent = 0.45 + 0.4 * clamp(run / 6.0, 0.0, 1.0);
  let stud = 0.05 * exp(-pow((fract(s.uv.x / 0.6) - 0.5) * 22.0, 2.0));
  let bay = floor(s.uv.x / 1.25);
  let word = hashOf(bitcast<u32>(i32(bay)), s.seed ^ 0x51u);
  let age = fract(s.time / 90.0 + unitOf(word));
  let touched =
    step(0.7, unitOf(mix32(word)))
      * handprint(
        vec2f(fract(s.uv.x / 1.25) * 1.25 - 0.3 - 0.6 * unitOf(word), h - 1.3),
      )
      * (1.0 - age);
  return warm(plasterHeat + coil * spent * 0.5 - stud + 0.55 * touched);
}

fn warmCeiling(s: Surf) -> Material {
  let duct =
    0.25
      * exp(-pow((fract(s.uv.x / 2.5) - 0.5) * 9.0, 2.0))
      * (0.7 + 0.3 * sin(s.uv.y * 3.0 - s.time * 1.5));
  let m = warm(0.3 + 0.06 * fbm(s.uv * 0.9, 502u, 3) + duct);
  return glowing(m.albedo, lampGlow(s, lamps()));
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return coiledWall(s);
    }
    case FLOOR, OWNED: {
      return warmFloor(s);
    }
    case CEILING: {
      return warmCeiling(s);
    }
    case TRIM: {
      return warm(0.2);
    }
    case METAL, GLASS, PLATE: {
      return warm(0.12 + 0.5 * s.paint.r);
    }
    case SCREEN, SKIN: {
      return warm(0.85);
    }
    default: {
      let m = stuff(s);
      return warm(0.22 + 0.25 * luma(m.albedo) + luma(m.emission));
    }
  }
}

fn lamps() -> Lamps {
  return Lamps(vec3f(0.14), vec3f(0.0), 2, vec2f(1.2, 0.2), 0.0);
}

/// Heat, not light: a thing is as bright as it is warm, a little warmer
/// under a working lamp and a little cooler in a corner, and the air between
/// is as warm as the room.
fn themeLight(s: Surf, m: Material) -> vec3f {
  let reach = lampReach(s, s.normal, 0.0, lamps());
  let heat =
    m.albedo.r + 0.07 * reach.z - 0.06 * (1.0 - cornerShade(s)) + m.emission.r;
  return haze(vec3f(heat), s, vec3f(0.27), 60.0);
}

/// The iron palette of a thermal camera: black through indigo, magenta,
/// orange and yellow to white as \`heat\` goes 0 to 1.
fn iron(heat: f32) -> vec3f {
  let t = clamp(heat, 0.0, 1.0);
  var colour =
    mix(
      vec3f(0.0, 0.0, 0.03),
      vec3f(0.12, 0.0, 0.42),
      smoothstep(0.0, 0.22, t),
    );
  colour = mix(colour, vec3f(0.7, 0.05, 0.45), smoothstep(0.22, 0.45, t));
  colour = mix(colour, vec3f(1.0, 0.5, 0.04), smoothstep(0.45, 0.68, t));
  colour = mix(colour, vec3f(1.0, 0.92, 0.3), smoothstep(0.68, 0.88, t));
  return mix(colour, vec3f(1.0), smoothstep(0.88, 1.0, t));
}

/// The frame as a thermal camera shows it: few pixels, heat as the iron
/// palette, a crosshair, and the palette down the side as the key.
fn themeLens(l: Lens) -> vec3f {
  let cells = vec2f(320.0, 320.0 * l.size.y / l.size.x);
  let coarse = (floor(l.uv * cells) + 0.5) / cells;
  let heat =
    (sceneAt(coarse).r + 0.5 * glowAt(coarse).r - 0.21) * 1.9 + grain(
      l,
    ) * 0.012;
  var colour = iron(heat);
  let aspect = l.size.x / l.size.y;
  let off = (l.uv - 0.5) * vec2f(aspect, 1.0);
  let reticle =
    step(abs(length(off) - 0.03), 0.0015) + step(
      min(abs(off.x), abs(off.y)),
      0.0012,
    )
      * step(0.045, max(abs(off.x), abs(off.y)))
      * step(max(abs(off.x), abs(off.y)), 0.075);
  let key = step(abs(l.uv.x - 0.965), 0.008) * step(abs(l.uv.y - 0.5), 0.3);
  colour = mix(colour, iron(1.0 - (l.uv.y - 0.2) / 0.6), key);
  let rim =
    step(abs(l.uv.x - 0.965), 0.0095) * step(abs(l.uv.y - 0.5), 0.303) - key;
  return
    mix(colour, vec3f(0.9), clamp(reticle + rim, 0.0, 1.0)) * vignette(l, 0.2);
}
`,
  HASH,
  CORE,
  STUFF,
  LIGHT,
  GRADE,
  LUMA,
  SCENE,
);
