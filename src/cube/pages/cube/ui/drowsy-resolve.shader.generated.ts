// Generated from drowsy-resolve.wgsl by `pnpm shaders:codegen`. Edit the
// source, not here — the vet run regenerates this file and fails when it had to.

import { wgsl } from '@/cube/shared/shader';

import { REFLECTION_NUMBERS } from './reflection-numbers';
import { SIGHT_LINE } from './sight-line.shader.generated';

export const DROWSY_RESOLVE = wgsl(
  'cube/pages/cube/ui/drowsy-resolve',
  /* wgsl */ `
struct Resolve {
  /// From this frame's clip space back to the frame the mesh is in.
  inverse: mat4x4f,
  /// The last frame's view-projection, as it was drawn whole.
  previous: mat4x4f,
  /// The eye, and how many metres one unit of the frame is.
  eye: vec4f,
  /// The full frame in pixels, the share, the drowsiness.
  size: vec4f,
  /// The pixel each block's fresh sample is, and whether the history holds
  /// the frame before (1) or nothing (0).
  jitter: vec4f,
}

@group(0) @binding(0) var<uniform> resolve: Resolve;
@group(0) @binding(1) var low: texture_2d<f32>;
@group(0) @binding(2) var history: texture_2d<f32>;
@group(0) @binding(3) var trusted: texture_2d<f32>;
@group(0) @binding(4) var linearSampler: sampler;

struct Resolved {
  /// The light, and in \`a\` the metres to what it shows, as the scene keeps it.
  @location(0) light: vec4f,
  @location(1) trust: vec4f,
}

/// Where \`p\` stood on the last frame's screen, 0 to 1 from the top left; z is
/// 0 for a point that was behind the eye.
fn before(p: vec3f) -> vec3f {
  let clip = resolve.previous * vec4f(p, 1.0);
  if (clip.w <= 1e-5) {
    return vec3f(0.0);
  }
  let ndc = clip.xy / clip.w;
  return vec3f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5, 1.0);
}

@fragment
fn resolveMain(@builtin(position) at: vec4f) -> Resolved {
  let share = i32(resolve.size.z);
  let drowsy = resolve.size.w;
  let jitter = vec2i(resolve.jitter.xy);
  let p = vec2i(at.xy);
  let lowSize = vec2i(textureDimensions(low));
  let block = clamp((p - jitter) / share, vec2i(0), lowSize - 1);
  let near = textureLoad(low, block, 0);
  let fresh = all(p % share == jitter);
  let lowUv = (vec2f(p - jitter) / f32(share) + 0.5) / vec2f(lowSize);
  var least = vec3f(1e9);
  var most = vec3f(-1e9);
  for (var j = -1; j <= 1; j++) {
    for (var i = -1; i <= 1; i++) {
      let around =
        textureLoad(
          low,
          clamp(block + vec2i(i, j), vec2i(0), lowSize - 1),
          0,
        ).rgb;
      least = min(least, around);
      most = max(most, around);
    }
  }

  let here = (at.xy) / resolve.size.xy;
  let metres = select(SIGHT, near.a, near.a < SIGHT);
  let sight = sightThrough(resolve.inverse, resolve.eye.xyz, here);
  let shown = resolve.eye.xyz + sight * (metres / resolve.eye.w);
  let was = before(shown);
  let front = was.z > 0.0;
  var motion = select(vec2f(0.0), here - was.xy, front);
  motion *= min(1.0, 0.25 / max(length(motion), 1e-6));

  // Where the history has nothing (the strip a turn brings in), the low pass
  // stands in, smeared along the motion like the rest of the frame.
  var smeared = vec3f(0.0);
  for (var k = 0; k < 4; k++) {
    let s = (f32(k) / 3.0 - 0.5) * (0.35 + drowsy * 1.6);
    smeared +=
      textureSampleLevel(low, linearSampler, lowUv + motion * s, 0.0).rgb;
  }
  smeared *= 0.25;

  // Trust fades out towards the old frame's edge so the strip has no seam:
  // only from the edge the motion crossed, three frames of it wide, so a
  // still view keeps its borders sharp.
  let inside = all(was.xy >= vec2f(0.0)) && all(was.xy <= vec2f(1.0));
  let crossed =
    vec2f(
      select(1.0 - was.x, was.x, motion.x > 0.0),
      select(1.0 - was.y, was.y, motion.y > 0.0),
    );
  let fade =
    smoothstep(vec2f(0.0), max(abs(motion) * 3.0, vec2f(1e-4)), crossed);
  // Clouds drift on the wind, which reprojection does not follow: held whole
  // they tear, drawn fresh alone they shake. A still sky blends both every
  // frame, so the jitter averages out and the drift lags a few frames; a
  // turning eye lets it trail like the rest.
  let sky = near.a >= SIGHT;
  let turning = smoothstep(0.0005, 0.004, length(motion));
  let still = select(0.0, 1.0 - turning, sky);
  var trust =
    select(0.0, fade.x * fade.y, front && inside && resolve.jitter.z > 0.5);
  var held = smeared;
  if (trust > 0.0) {
    // The lag: the old picture trails the turn.
    let trail = was.xy + motion * 0.55 * drowsy;
    var sum = vec3f(0.0);
    var confidence = 0.0;
    for (var k = 0; k < 4; k++) {
      let uv = trail + motion * ((f32(k) / 3.0 - 0.5) * drowsy * 1.6);
      sum += textureSampleLevel(history, linearSampler, uv, 0.0).rgb;
      confidence += textureSampleLevel(trusted, linearSampler, uv, 0.0).r;
    }
    var past = sum * 0.25;
    // History the fresh neighbourhood disowns (moving water) melts into the
    // smeared fresh view instead of dithering; history that agrees keeps its
    // sharpness.
    let stray = length(past - clamp(past, least, most));
    past = mix(past, smeared, smoothstep(0.0, 0.08, stray) * drowsy);
    past = mix(clamp(past, least, most), past, drowsy);
    trust *= confidence * 0.25;
    held = mix(smeared, past, trust * mix(1.0, 0.9, still));
  }
  let freshLight =
    mix(near.rgb, held, 0.55 * drowsy * trust + 0.5 * (1.0 - trust));
  let light = select(held, mix(freshLight, held, still), fresh);
  return
    Resolved(
      vec4f(light, near.a),
      vec4f(select(trust, 1.0, fresh), 0.0, 0.0, 1.0),
    );
}
`,
  REFLECTION_NUMBERS,
  SIGHT_LINE,
);
