// Generated from cloud-body.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { CLOUD_NOISE } from './cloud-noise.shader';
import { CLOUD_NOISE_NUMBERS } from './cloud-noise-numbers';
import { CLOUDS_NUMBERS } from './clouds-numbers';

export const CLOUD_BODY = wgsl(
  'cube/widgets/outdoors/lib/cloud-body',
  /* wgsl */ `
/// How far a cloud's own noise pushes its footprint in and out, in radii².
const BILLOW_HEAP = 2.0;

/// The angle one texel of the quarter-size sky spans, in radians, about.
const SKY_TEXEL = 0.005;

/// How far the billows stood out of the body at the last point
/// \`cloudSolid\` read them.
var<private> relief: f32;

/// A billow lattice never comes round within one cloud.
const BILLOW_PERIOD = 65536;

/// A cloud's body before its billows: over 0 inside, falling about a unit a
/// radius outward. Its footprint is its own noise cut off round its middle,
/// so no two are one shape, and it stands tallest where the footprint is
/// deepest: a heap of domes on one flat base.
fn cloudBody(cloud: Cloud, field: vec3f) -> f32 {
  let up = (field.y - CLOUD_BASE) / cloud.tall;
  // Its crown leans down the wind.
  let within =
    (field.xz - cloud.centre) / cloud.radius - vec2f(0.15 * max(up, 0.0), 0.0);
  let heap =
    0.6 * cloudNoise2(
      within * 1.1 + 40.0,
      BILLOW_PERIOD,
      cloud.seed + 2u,
    ) + 0.4 * cloudNoise2(within * 2.7 + 40.0, BILLOW_PERIOD, cloud.seed + 3u);
  let foot = 0.75 - dot(within, within) + BILLOW_HEAP * (heap - 0.5);
  return foot - up * up - 3.0 * max(-up, 0.0);
}

/// A cloud's body with its billows at a point of the field, in the same
/// units: over 0 inside. Outside their reach it is the body's own, less the
/// reach, which is never under the truth. \`fine\` frays the surface.
fn cloudSolid(cloud: Cloud, field: vec3f, frayed: bool) -> f32 {
  let body = cloudBody(cloud, field);
  if (body < -BILLOW_REACH) {
    return body + BILLOW_REACH;
  }
  let up = clamp((field.y - CLOUD_BASE) / cloud.tall, 0.0, 1.0);
  // Billows are the cloud's own: as many across a small one as a broad one.
  let within =
    vec3f(
      field.x - cloud.centre.x,
      field.y - CLOUD_BASE,
      field.z - cloud.centre.y,
    ) / cloud.radius;
  let broad =
    cloudNoise(within * BILLOW_BROAD_SCALE, BILLOW_PERIOD, cloud.seed) - 0.5;
  // Folded noise: round knobs with creases between, a cauliflower's.
  let knobs =
    abs(
      2.0 * cloudNoise(
        within * BILLOW_KNOB_SCALE,
        BILLOW_PERIOD,
        cloud.seed + 1u,
      ) - 1.0,
    ) - 0.5;
  // No billow stands clear of the body it grew from.
  let held = smoothstep(-BILLOW_REACH, -0.12, body);
  let fine =
    abs(
      2.0 * cloudNoise(
        within * BILLOW_FINE_SCALE,
        BILLOW_PERIOD,
        cloud.seed + 4u,
      ) - 1.0,
    ) - 0.5;
  // The finest billows are only grain where they are narrower than a couple
  // of the sky's texels.
  let texel = cloud.off * SKY_TEXEL / cloud.radius;
  let fined = 1.0 - smoothstep(0.6, 1.4, texel * BILLOW_FINE_SCALE);
  relief =
    held * (BILLOW_BROAD * broad * (0.4 + 0.6 * up)
      + BILLOW_KNOBS * knobs
      + BILLOW_FINE * fine * fined);
  var solid = body + relief;
  if (frayed && solid > -0.12 && fined > 0.0) {
    let grain =
      cloudNoise(field * GRAIN_PER_KM, GRAIN_PERIOD, CLOUD_SALT + 3u) - 0.5;
    solid += 0.03 * grain * fined / cloud.radius;
  }
  return solid;
}

/// The water at a point \`solid\` deep in a cloud, 0 to 1: all of it a little
/// way in, none under the flat base.
fn cloudWater(cloud: Cloud, field: vec3f, solid: f32) -> f32 {
  return
    clamp(solid * cloud.radius / CLOUD_EDGE, 0.0, 1.0) * smoothstep(
      0.0,
      0.05,
      field.y - CLOUD_BASE,
    );
}

/// The cloud between a point and the sun: x its optical depth — the billows
/// just sunward of the point, then the body beyond — and y how squarely the
/// surface at the point faces the sun, −1 to 1, which a body that is near
/// enough a distance gives as its fall toward the sun.
fn towardSun(cloud: Cloud, field: vec3f, solid: f32) -> vec2f {
  let near = field + SUN_IN_FIELD * 0.09;
  let sunward = cloudSolid(cloud, near, false);
  let depth =
    cloudWater(cloud, near, sunward) * 0.18
      + clamp(
        cloudBody(cloud, field + SUN_IN_FIELD * 0.4) * 2.5,
        0.0,
        1.0,
      ) * 0.45
      + clamp(
        cloudBody(cloud, field + SUN_IN_FIELD * 1.0) * 2.5,
        0.0,
        1.0,
      ) * 0.9;
  return
    vec2f(depth * CLOUD_EXTINCTION, (solid - sunward) * cloud.radius / 0.09);
}
`,
  CLOUD_NOISE,
  CLOUD_NOISE_NUMBERS,
  CLOUDS_NUMBERS,
);
