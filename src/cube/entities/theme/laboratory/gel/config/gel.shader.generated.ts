// Generated from gel.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE, FINISH, LIGHT, STUFF } from '../../../kit';

export const GEL_SHADER = wgsl(
  'cube/entities/theme/laboratory/gel/config/gel',
  /* wgsl */ `
const ULTRAVIOLET = vec3f(0.16, 0.03, 0.6);
const STAIN = vec3f(1.0, 0.3, 0.1);

fn transilluminator(s: Surf) -> Material {
  // Tubes forty centimetres apart under frosted glass.
  let tube = 1.0 - abs(fract(s.uv.y / 0.4) - 0.5) * 2.0;
  let frost = fbm(s.uv * 30.0, 481u, 3);
  let scratch =
    1.0 - smoothstep(
      0.0,
      0.006,
      abs(fbm(s.uv * vec2f(1.2, 14.0), 482u, 3) - 0.5),
    );
  let frame = 1.0 - tiling(s.uv, 1.25, 0.03, 483u).x;
  let glow =
    ULTRAVIOLET
      * (0.25 + 1.1 * tube * tube * tube)
      * (0.8 + 0.3 * frost)
      * (1.0 - frame);
  let m =
    Material(
      mix(vec3f(0.02, 0.01, 0.05), vec3f(0.01), frame),
      glow * (1.0 + 2.0 * scratch),
      0.8 - 0.4 * scratch,
      vec3f(0.0),
    );
  return embossed(s, m, frame - scratch, 0.002);
}

fn lanes(s: Surf) -> Material {
  let h = s.p.y;
  let lane = s.uv.x / 0.3;
  let across = fract(lane) - 0.5;
  let word = hashOf(bitcast<u32>(i32(floor(lane))), s.seed ^ 0x48u);
  let inLane = 1.0 - smoothstep(0.3, 0.36, abs(across));
  // Every fifth lane is the ladder: a band at every rung.
  let ladder = (bitcast<u32>(i32(floor(lane))) % 5u) == 0u;
  let run = (h + 0.1 * across * across) / 0.075;
  let rung = hashOf(bitcast<u32>(i32(floor(run))), word);
  let stopped =
    select(step(0.72, unitOf(rung)), f32(u32(floor(run)) % 2u), ladder);
  let thick = 0.12 + 0.3 * unitOf(mix32(rung));
  let within = step(0.3, h) * step(h, 1.95);
  let stripe =
    stopped
      * within
      * inLane
      * (1.0 - smoothstep(thick * 0.5, thick, abs(fract(run) - 0.5)));
  let smear =
    within
      * inLane
      * 0.06
      * unitOf(word)
      * (0.5 + fbm(vec2f(lane * 3.0, h * 2.0), 484u, 2));
  let well = (1.0 - smoothstep(0.3, 0.32, abs(across))) * band(h, 2.06, 0.07);
  let cloud = fbm(s.uv * 2.0, 485u, 3);
  let slab = vec3f(0.03, 0.015, 0.07) * (0.6 + 0.8 * cloud);
  let glow =
    STAIN * (2.2
      * stripe
      * (0.4 + 0.6 * unitOf(mix32(rung ^ 0x9u))) + smear) + ULTRAVIOLET
      * (0.05 + 0.2 * exp(-h * 2.0))
      * (0.6 + 0.6 * cloud);
  let wall =
    Material(
      mix(slab, vec3f(0.004), well),
      glow * (1.0 - well),
      0.7,
      vec3f(0.0),
    );
  return embossed(s, wall, cloud - 4.0 * well, 0.004);
}

fn hood(s: Surf) -> Material {
  let rib = tiling(s.uv, 0.625, 0.02, 486u);
  let black =
    vec3f(0.02, 0.016, 0.03) * (0.6 + 0.5 * fbm(s.uv * 24.0, 487u, 3)) * rib.x;
  return embossed(s, glowing(black, lampGlow(s, lamps())), rib.x, 0.006);
}

fn themeMaterial(s: Surf) -> Material {
  switch s.kind {
    case WALL: {
      return lanes(s);
    }
    case FLOOR, OWNED: {
      return transilluminator(s);
    }
    case CEILING: {
      return hood(s);
    }
    case TRIM: {
      // The orange shield a reader looks through.
      return Material(vec3f(0.3, 0.1, 0.01), STAIN * 0.12, 0.9, vec3f(0.0));
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
