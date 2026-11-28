// Generated from sea-shading.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/gpu/shared/shader';

import { SHORE_LEVEL } from '@/nature/shared/shore';

import { ISLAND_SEA } from './island-sea.shader.generated';
import { SEA_NUMBERS } from './sea-numbers';

export const SEA_SHADING = wgsl(
  'island/pages/island/lib/sea-shading',
  /* wgsl */ `
/// The sea's colour toward an eye at the origin: \`world\` is the fragment less
/// the eye, \`eye\` the eye from the planet's centre, \`place\` the fragment
/// modulo the ripples' period, \`field\` modulo the slow fields' and \`grain\`
/// the world's shift of their lattice, \`bed\` the floor's height under it, \`under\`
/// the colour of the water's body over that floor, unlit; \`mirrored\` the
/// sky a still sea would show the eye there and \`overhead\` the zenith's.
/// The air between is the caller's to add.
fn seaColour(
  place: vec3f,
  field: vec3f,
  grain: vec3f,
  world: vec3f,
  eye: vec3f,
  sun: vec3f,
  bed: f32,
  under: vec3f,
  footprint: f32,
  seconds: f32,
  mirrored: vec3f,
  overhead: vec3f,
  swell: vec2f,
  bands: f32,
) -> vec3f {
  let level = seaSwellAt(world, bed, swell);
  // Dry sand, which \`seaLies\` discards: its colour is never seen.
  if (bed > 0.0 && level - bed <= SEA_SHEET_THINNEST) {
    return vec3f(0.0);
  }
  let up = normalize(eye + world);
  let range = length(world);
  let toEye = -world / max(range, 1e-3);
  let wind = windAt(up);
  // Shallows and lee water lie smoother: the bed takes the short waves' fetch.
  let depth = max(-bed, 0.0);
  let calm = 0.35 + 0.65 * smoothstep(0.0, 4.0, depth);
  let rippled =
    ripplesAt(
      place,
      seaGroups(field, grain),
      up,
      wind * calm,
      footprint,
      seconds,
      bands,
    );
  // The swell's own slope along its run, while a pixel is finer than a wave.
  let swellSeen = 1.0 - smoothstep(1.0, 6.0, footprint);
  let run = SEA_SWELL_AXIS - up * dot(SEA_SWELL_AXIS, up);
  let along = run / max(length(run), 1e-4);
  let ahead = seaSwellAt(world + along * 0.4, bed, swell);
  let swellSlope = along * (swellSeen * (ahead - level) / 0.4);
  let normal = normalize(up - rippled.slope - swellSlope);

  let facing = max(dot(normal, toEye), 0.0);
  let rough = sqrt(rippled.hidden);
  // A rough sea never mirrors at the horizon: its hidden slopes face the eye.
  let mirror =
    seaFresnel(
      sqrt(facing * facing + 2.0 * rough * rough + 1e-4) * 0.98 + rough,
    );
  var bounced = reflect(-toEye, normal);
  bounced = normalize(bounced + up * max(0.02 - dot(bounced, up), 0.0) * 2.0);
  // The sky in the water: between what a still sea would mirror and the zenith's.
  let still = max(dot(reflect(-toEye, up), up), 0.03);
  let raised =
    clamp((dot(bounced, up) - still) / max(1.0 - still, 1e-3), 0.0, 1.0);
  let sky = mix(mirrored, overhead, sqrt(raised));

  // The sun's glint, a Beckmann lobe as wide as the slopes the pixel hides.
  let half = normalize(toEye + sun);
  let tilt = max(dot(normal, half), 1e-3);
  let spread = 2.0 * rippled.hidden + 0.0008;
  let lobe =
    exp((tilt * tilt - 1.0) / (tilt * tilt * spread)) / (3.14159
      * spread
      * tilt
      * tilt
      * tilt
      * tilt);
  let sunUp = smoothstep(-0.02, 0.1, dot(sun, up));
  let height = dot(sun, up);
  let kept = pow(SEA_EYE_SET / max(height, SEA_EYE_SET), 1.0 - SEA_CLIMB_KEPT);
  let glint =
    vec3f(1.0, 0.9, 0.72) * (sunUp
      * kept
      * seaFresnel(dot(toEye, half))
      * min(lobe, 400.0)
      * 0.5
      / max(4.0 * facing, 0.2));

  // Foam where the water thins out over the beach, broken by the ripples.
  let lace =
    0.5 + 0.5 * sin(
      dot(place, vec3f(2.1, 1.3, 1.7)) + 3.0
        * rippled.slope.x
        / max(rough, 0.05),
    );
  let tau = seaTau(world, bed, swell);
  let broken =
    brokenAt(tau, min(bed, -0.02), 1.0)
      * smoothstep(-0.05, 0.25, level)
      * swellSeen;
  // The sheet on the sand is all froth at its thin tip.
  let sheet = smoothstep(0.012, 0.0, level - bed) * step(0.0, bed);
  let line = smoothstep(0.12, 0.0, depth) * (1.0 - swellSeen);
  let foam =
    clamp(
      max(max(broken, sheet), line) * (0.45 + 0.55 * lace),
      0.0,
      1.0,
    ) * smoothstep(400.0, 40.0, footprint * 100.0);
  let light =
    SEA_SUNLIGHT * (max(height, 0.0) * kept) + mix(
      SEA_NIGHT_SKYLIGHT,
      SEA_DAY_SKYLIGHT,
      smoothstep(-0.1, 0.2, height),
    );
  let body = mix(under, vec3f(0.9, 0.93, 0.94), foam) * light;

  return mix(body, sky, mirror * (1.0 - foam)) + glint * (1.0 - foam);
}
`,
  ISLAND_SEA,
  SEA_NUMBERS,
  SHORE_LEVEL,
);
