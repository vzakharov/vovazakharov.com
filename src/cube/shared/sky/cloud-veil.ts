import { f32, wgsl } from '../shader/wgsl';
import { CLOUDS } from './cloud-field';
import { CLOUDS_WGSL } from './clouds';

/**
 * The cumulus layer as `cloudGlance` holds it: the height its clouds are seen
 * at, in kilometres, and the share of a ray straight up through it that meets
 * one — the share of the sea the clouds stand over, about.
 */
const GLANCE = {
  height: CLOUDS.base + 1,
  thick:
    (CLOUDS.chance *
      Math.PI *
      ((CLOUDS.radius.least + CLOUDS.radius.most) / 2) ** 2 *
      0.5) /
    CLOUDS.cell ** 2,
} as const;

/**
 * The cumulus without a march, for a mirror that would not show the
 * difference, each rgb their light and a the share of what is behind them
 * that shows:
 *
 * - `cloudGlance(dir) -> vec4f`, as a haze of the cover they make, in a dozen
 *   operations;
 * - `cloudVeil(dir) -> vec4f`, each cloud where it stands, lit as a whole.
 */
export const CLOUD_VEIL = wgsl(
  'sky/cloud-veil',
  /* wgsl */ `
/// The cumulus along \`dir\` as the share of the sky they hide, for a mirror
/// too rough to tell one cloud from the next: thicker toward the horizon,
/// where a ray is longest in their layer, and lost in the air far off. rgb
/// their light, a the share of what is behind them that shows.
fn cloudGlance(dir: vec3f) -> vec4f {
  let y = max(dir.y, 0.02);
  let hidden = 0.7 * (1.0 - exp(-${f32(GLANCE.thick)} / y));
  let air = airBetween(${f32(GLANCE.height)} / y, ${f32(GLANCE.height)});
  // Looking away from the sun a cloud shows its lit flank, toward it its shade.
  let lit = 0.22 - 0.12 * dot(dir, SUN_DIR);
  let shown = sunThrough(${f32(GLANCE.height)}) * lit + SKY_FILL * 0.6 + HORIZON_FILL * 0.1;
  let cover = hidden * max(air.r, max(air.g, air.b));
  return vec4f(shown * cover, 1.0 - cover);
}

fn cloudVeil(dir: vec3f) -> vec4f {
  var seen = vec4f(0.0, 0.0, 0.0, 1.0);
  if (dir.y <= 0.004) { return seen; }
  let eye = frame.eye.xyz / 1000.0;
  let fog = clearSky(dir);
  let phase = cloudPhase(dot(dir, SUN_DIR));
  let start = inField(eye).xz;
  let over = vec2f(dot(dir.xz, WIND_AXIS), dot(dir.xz, WIND_SIDE));
  var last = vec2i(1 << 30);
  for (var i = 0; i < 4; i++) {
    let level = CLOUD_BASE + 0.15 + 0.6 * f32(i);
    let reached = reachOf(dir.y, level);
    if (reached > CLOUD_REACH) { continue; }
    let cell = vec2i(floor(inField(eye + dir * reached).xz / CLOUD_CELL));
    if (all(cell == last)) { continue; }
    last = cell;
    let cloud = cloudIn(cell);
    if (cloud.radius <= 0.0) { continue; }
    // Where the ray passes the cloud's middle is where it is deepest in it.
    let away = max(dot(cloud.centre - start, over) / max(dot(over, over), 1e-6), 0.0);
    let field = inField(eye + dir * away);
    let h = field.y;
    let body = cloudBody(cloud, field);
    let cover = smoothstep(-0.05, 0.25, body);
    // A flank is lit where the body thins toward the sun.
    let sunward = cloudBody(cloud, field + SUN_IN_FIELD * 0.5 * cloud.radius);
    let depth = 14.0 * clamp(0.5 + sunward, 0.0, 1.0);
    let rise = clamp((h - CLOUD_BASE) / cloud.tall, 0.0, 1.0);
    let shown = cloudLight(h, vec2f(depth, body - sunward), phase, rise, 0.2, 0.2);
    let air = airBetween(away, h);
    seen = vec4f(seen.rgb + seen.a * cover * (shown * air + fog * (1.0 - air)), seen.a * (1.0 - cover));
  }
  return seen;
}
`,
  CLOUDS_WGSL,
);
