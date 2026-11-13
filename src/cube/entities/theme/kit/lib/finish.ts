import { HASH, wgsl } from '@/cube/shared/shader';

import { CORE } from './core';

/**
 * What walls, floors and ceilings are finished in. Each takes the point and
 * a colour and gives the colour back as that finish wears it; lengths are
 * metres. A finish over `s.uv` under a fixed salt runs on through doorways; one
 * salted with `s.seed` is the room's own.
 */
export const FINISH = wgsl(
  'finish',
  /* wgsl */ `
/// 1 within \`width\` metres centred on \`at\`, 0 outside.
fn band(x: f32, at: f32, width: f32) -> f32 {
  return 1.0 - smoothstep(width * 0.5, width * 0.5 + 0.004, abs(x - at));
}

/// Painted plaster: the room's own mottling under a fine roller texture.
fn plaster(s: Surf, colour: vec3f) -> vec3f {
  let mottle = fbm(s.uv * 0.8, s.seed, 4);
  let roller = valueNoise(s.uv * 55.0, 3u);
  return colour * (0.88 + 0.16 * mottle + 0.04 * roller);
}

/// Square tiles \`size\` across with \`joint\` metres between them: x is 1 on a
/// tile and 0 in a joint, y the tile's own random number in [0, 1).
fn tiling(uv: vec2f, size: f32, joint: f32, salt: u32) -> vec2f {
  let at = uv / size;
  let f = fract(at);
  let edge = min(min(f.x, 1.0 - f.x), min(f.y, 1.0 - f.y)) * size;
  return vec2f(
    smoothstep(joint * 0.5, joint * 0.5 + 0.003, edge),
    unitOf(cellHash(vec2i(floor(at)), salt)),
  );
}

/// Carpet: pile too fine to count, worn in paths that cross rooms.
fn carpet(s: Surf, colour: vec3f) -> vec3f {
  let pile = valueNoise(s.uv * 240.0, 11u);
  let wear = fbm(s.uv * 0.45, 5u, 3);
  return colour * (0.76 + 0.3 * pile) * (0.82 + 0.3 * wear);
}

/// Damp, 0 to 1: on a wall it runs down from the ceiling in the room's own
/// streaks; on a ceiling it pools in blots.
fn damp(s: Surf) -> f32 {
  if (abs(s.normal.y) > 0.5) {
    return smoothstep(0.62, 0.8, fbm(s.uv * 0.9, s.seed ^ 0x51u, 4));
  }
  let streak = fbm(vec2f(s.uv.x * 3.0, s.uv.y * 0.25), s.seed ^ 0x52u, 3);
  let fall = smoothstep(ROOM.y - 1.6, ROOM.y, s.p.y);
  return smoothstep(0.55, 0.75, streak) * fall;
}
`,
  CORE,
  HASH,
);
