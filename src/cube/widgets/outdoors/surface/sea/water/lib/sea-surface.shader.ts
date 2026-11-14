// Generated from sea-surface.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { OUTDOOR_FRAME, OUTDOOR_STAGE } from '../../../../stage';
import { SEA_TABLES } from '../../state';
import { SEA_SHORE } from './sea-shore.shader';
import { SEA_SURFACE_NUMBERS } from './sea-surface-numbers';

export const SEA_SURFACE = wgsl(
  'cube/widgets/outdoors/surface/sea/water/lib/sea-surface',
  /* wgsl */ `
/// How far apart the slow surface is read for its own slope, metres.
const SWELL_STEP = 0.4;

struct SeaGrid {
  /// Which way the laid sector's middle spoke points, and its whole angle.
  yaw: f32,
  sector: f32,
}

@group(1) @binding(0) var<uniform> grid: SeaGrid;
@group(1) @binding(1) var waveSampler: sampler;
@group(1) @binding(2) var shiftMap: texture_2d_array<f32>;
@group(1) @binding(3) var slopeMap: texture_2d_array<f32>;
@group(1) @binding(4) var momentMap: texture_2d_array<f32>;

/// How far the wind's waves carry the still surface's point \`still\`, for a
/// mesh whose cells are \`cell\` metres wide there: waves a cell cannot draw
/// are left out.
fn carried(still: vec2f, cell: f32) -> vec3f {
  let quiet = calm(still);
  var shift = vec3f(0.0);
  for (var i = 0u; i < CASCADES; i++) {
    let texel = SIDES[i] / WAVE_TILE;
    let lod = max(log2(2.0 * cell / texel), 0.0);
    shift +=
      quiet[i] * textureSampleLevel(
        shiftMap,
        waveSampler,
        still / SIDES[i],
        i,
        lod,
      ).xyz;
  }
  return shift;
}

struct SeaVarying {
  @builtin(position) clip: vec4f,
  /// The point of the still sea this one was carried from.
  @location(0) still: vec2f,
  @location(1) world: vec3f,
  /// The slow surface's own slope, along x and z.
  @location(2) swell: vec2f,
  /// Clip z and w of the point brought a little toward the eye, which is the
  /// depth a thin sheet of water is drawn at so it lies over the sand's mesh.
  @location(3) lifted: vec2f,
}

/// One point of the sea's mesh, carried by the slow surface and the waves.
@vertex
fn seaVertex(@builtin(vertex_index) index: u32) -> SeaVarying {
  let ring = f32(index / (SPOKES + 1u));
  let spoke = f32(index % (SPOKES + 1u));
  let radius = SEA_HUB * (exp(SEA_GROWTH * ring) - 1.0);
  let angle = grid.yaw + (spoke / f32(SPOKES) - 0.5) * grid.sector;
  let still = frame.eye.xz + radius * vec2f(cos(angle), sin(angle));
  let cell =
    max(SEA_GROWTH * (radius + SEA_HUB), radius * grid.sector / f32(SPOKES));
  var out: SeaVarying;
  let slow = level(still);
  if (offshore(still) < 1.0) {
    let step = SWELL_STEP;
    out.swell =
      vec2f(
        level(still + vec2f(step, 0.0)) - slow,
        level(still + vec2f(0.0, step)) - slow,
      ) / step;
  }
  out.still = still;
  out.world = vec3f(still.x, slow, still.y) + carried(still, cell);
  out.clip = clipOf(out.world);
  let toEye = frame.eye.xyz - out.world;
  let far = length(toEye);
  let lift = (0.01 + 0.001 * far) / max(toEye.y / far, 0.05);
  out.lifted = clipOf(out.world + toEye / far * min(lift, 0.5 * far)).zw;
  return out;
}

/// What the waves under one pixel amount to.
struct Waves {
  /// The mean gradient of the surface's height, along x and z.
  slope: vec2f,
  /// The gradient's variance about that mean, along x and z, and their
  /// covariance: the waves the pixel is too coarse to show.
  spread: vec3f,
  /// How much the surface is squeezed sideways (negative at a sharp crest).
  squeeze: f32,
}

/// The wind's waves about \`still\`, filtered over the pixel's footprint
/// \`across\` and \`down\` the screen, each cascade let through by \`quiet\`.
fn wavesAt(still: vec2f, across: vec2f, down: vec2f, quiet: vec4f) -> Waves {
  var waves: Waves;
  for (var i = 0u; i < CASCADES; i++) {
    let at = still / SIDES[i];
    let dx = across / SIDES[i];
    let dy = down / SIDES[i];
    let slope = textureSampleGrad(slopeMap, waveSampler, at, i, dx, dy);
    let moment = textureSampleGrad(momentMap, waveSampler, at, i, dx, dy).xyz;
    let share = quiet[i];
    waves.slope += share * slope.xy;
    waves.squeeze += share * (slope.z + slope.w);
    waves.spread +=
      share
        * share
        * max(
          moment - vec3f(
            slope.x * slope.x,
            slope.y * slope.y,
            slope.x * slope.y,
          ),
          vec3f(0.0, 0.0, -1.0),
        );
  }
  return waves;
}
`,
  OUTDOOR_FRAME,
  OUTDOOR_STAGE,
  SEA_SHORE,
  SEA_SURFACE_NUMBERS,
  SEA_TABLES,
);
