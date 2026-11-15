// Generated from cloud-veil.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { SUN } from '@/cube/shared/cube-boundary';
import { wgsl } from '@/cube/shared/shader';

import { CLEAR_SKY } from './clear-sky.shader.generated';
import { CLOUD_BODY } from './cloud-body.shader.generated';
import { CLOUD_NOISE } from './cloud-noise.shader.generated';
import { CLOUD_NOISE_NUMBERS } from './cloud-noise-numbers';
import { CLOUD_VEIL_NUMBERS } from './cloud-veil-numbers';
import { CLOUDS_WGSL } from './clouds-wgsl.shader.generated';
import { OUTDOOR_FRAME } from './outdoor-frame';

export const CLOUD_VEIL = wgsl(
  'cube/widgets/outdoors/stage/lib/cloud-veil',
  /* wgsl */ `
/// The cumulus along \`dir\` as the share of the sky they hide, for a mirror
/// too rough to tell one cloud from the next: thicker toward the horizon,
/// where a ray is longest in their layer, and lost in the air far off. rgb
/// their light, a the share of what is behind them that shows.
fn cloudGlance(dir: vec3f) -> vec4f {
  let y = max(dir.y, 0.02);
  let hidden = 0.7 * (1.0 - exp(-CLOUD_GLANCE_THICK / y));
  let air = airBetween(CLOUD_GLANCE_HEIGHT / y, CLOUD_GLANCE_HEIGHT);
  // Looking away from the sun a cloud shows its lit flank, toward it its shade.
  let lit = 0.22 - 0.12 * dot(dir, SUN_DIR);
  let shown =
    sunThrough(CLOUD_GLANCE_HEIGHT) * lit + SKY_FILL * 0.6 + HORIZON_FILL * 0.1;
  let cover = hidden * max(air.r, max(air.g, air.b));
  return vec4f(shown * cover, 1.0 - cover);
}

/// Each cumulus along \`dir\` where it stands, lit as a whole. rgb their light,
/// a the share of what is behind them that shows.
fn cloudVeil(dir: vec3f) -> vec4f {
  var seen = vec4f(0.0, 0.0, 0.0, 1.0);
  if (dir.y <= 0.004) {
    return seen;
  }
  let eye = frame.eye.xyz / 1000.0;
  let fog = clearSky(dir);
  let phase = cloudPhase(dot(dir, SUN_DIR));
  let start = inField(eye).xz;
  let over = vec2f(dot(dir.xz, WIND_AXIS), dot(dir.xz, WIND_SIDE));
  var last = vec2i(1 << 30);
  for (var i = 0; i < 4; i++) {
    let level = CLOUD_BASE + 0.15 + 0.6 * f32(i);
    let reached = reachOf(dir.y, level);
    if (reached > CLOUD_REACH) {
      continue;
    }
    let cell = vec2i(floor(inField(eye + dir * reached).xz / CLOUD_CELL));
    if (all(cell == last)) {
      continue;
    }
    last = cell;
    let cloud = cloudIn(cell);
    if (cloud.radius <= 0.0) {
      continue;
    }
    // Where the ray passes the cloud's middle is where it is deepest in it.
    let away =
      max(dot(cloud.centre - start, over) / max(dot(over, over), 1e-6), 0.0);
    let field = inField(eye + dir * away);
    let h = field.y;
    let body = cloudBody(cloud, field);
    let cover = smoothstep(-0.05, 0.25, body);
    // A flank is lit where the body thins toward the sun.
    let sunward = cloudBody(cloud, field + SUN_IN_FIELD * 0.5 * cloud.radius);
    let depth = 14.0 * clamp(0.5 + sunward, 0.0, 1.0);
    let rise = clamp((h - CLOUD_BASE) / cloud.tall, 0.0, 1.0);
    let shown =
      cloudLight(h, vec2f(depth, body - sunward), phase, rise, 0.2, 0.2);
    let air = airBetween(away, h);
    seen =
      vec4f(
        seen.rgb + seen.a * cover * (shown * air + fog * (1.0 - air)),
        seen.a * (1.0 - cover),
      );
  }
  return seen;
}
`,
  OUTDOOR_FRAME,
  SUN,
  CLEAR_SKY,
  CLOUD_NOISE,
  CLOUD_NOISE_NUMBERS,
  CLOUD_VEIL_NUMBERS,
  CLOUD_BODY,
  CLOUDS_WGSL,
);
