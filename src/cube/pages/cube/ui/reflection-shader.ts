/** How many levels the scene is kept at, each half the last, for blur. */
export const BLUR_LEVELS = 6;

/** Floats of `View` below: two matrices and two vectors. */
export const VIEW_FLOATS = 16 + 16 + 4 + 4;

/** One triangle that covers the screen. */
const COVER = /* wgsl */ `
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let corner = vec2f(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4f(corner * 2.0 - 1.0, 0.0, 1.0);
}
`;

/**
 * The level above, halved: one bilinear tap at a texel corner of it is the
 * mean of the four texels around.
 */
export const HALVE_SHADER = /* wgsl */ `
@group(0) @binding(0) var above: texture_2d<f32>;
@group(0) @binding(1) var aboveSampler: sampler;
${COVER}
@fragment
fn halveMain(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let uv = pixel.xy * 2.0 / vec2f(textureDimensions(above));
  return textureSampleLevel(above, aboveSampler, uv, 0.0);
}
`;

/**
 * The frame's mirrors filled in. Each pixel the scene left a mirror at walks
 * the reflection out through the scene's own depth until it passes behind
 * what the scene shows, and takes the light there, blurred as far as the
 * surface is rough. Where the walk leaves the screen, runs out or is hidden,
 * the lamps' light the scene left stands in, faded in over the screen's edge
 * and the walk's last stretch so neither shows a seam.
 */
export const REFLECTION_SHADER = /* wgsl */ `
struct View {
  viewProjection: mat4x4f,
  /// From clip space back to the frame the mesh is in.
  inverse: mat4x4f,
  /// The eye, and how many metres one unit of the frame is.
  eye: vec4f,
  /// The screen in pixels, the projection's focal length, the top blur level.
  size: vec4f,
};

@group(0) @binding(0) var<uniform> view: View;
@group(0) @binding(1) var scene: texture_2d<f32>;
@group(0) @binding(2) var mirror: texture_2d<f32>;
@group(0) @binding(3) var plane: texture_2d<f32>;
@group(0) @binding(4) var blurSampler: sampler;

/// Steps of the walk, and halvings that close in on what it passed behind.
const STEPS = 24;
const CLOSING = 5;
/// The longest walk, in metres.
const REACH = 14.0;
/// How far behind what the scene shows the walk may be, past its own step,
/// and still be taken for having struck it, in metres.
const THICK = 0.4;
/// What \`behind\` says of a point off the screen.
const OFF = -1e9;
${COVER}
/// Where \`p\` lands on the screen, 0 to 1 from the top left; z is 0 for a
/// point behind the eye.
fn onScreen(p: vec3f) -> vec3f {
  let clip = view.viewProjection * vec4f(p, 1.0);
  if (clip.w <= 1e-5) {
    return vec3f(0.0);
  }
  let ndc = clip.xy / clip.w;
  return vec3f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5, 1.0);
}

/// Metres from the eye to what the scene shows at \`uv\`.
fn sceneFar(uv: vec2f) -> f32 {
  let texel = clamp(vec2i(uv * view.size.xy), vec2i(0), vec2i(view.size.xy) - 1);
  return textureLoad(scene, texel, 0).a;
}

/// Where the point \`t\` units along the walk lands, and how many metres it
/// lies behind what the scene shows there: negative in front, \`OFF\` off
/// the screen.
fn behind(start: vec3f, ray: vec3f, t: f32) -> vec3f {
  let q = start + ray * t;
  let at = onScreen(q);
  if (at.z == 0.0 || any(at.xy < vec2f(0.0)) || any(at.xy > vec2f(1.0))) {
    return vec3f(at.xy, OFF);
  }
  return vec3f(at.xy, length(q - view.eye.xyz) * view.eye.w - sceneFar(at.xy));
}

/// The walk from \`start\` along \`ray\`: where on the screen it struck, how
/// many units it ran, and how far to trust it, 0 where it struck nothing.
fn walk(start: vec3f, ray: vec3f) -> vec4f {
  let reach = REACH / view.eye.w;
  var before = 0.0;
  for (var i = 1; i <= STEPS; i++) {
    // Steps lengthen with the walk: short beside the surface it leaves, as
    // long as a far wall's detail on the screen at its end.
    let share = f32(i) / f32(STEPS);
    let t = reach * share * share;
    let out = behind(start, ray, t);
    if (out.z == OFF) {
      return vec4f(0.0);
    }
    if (out.z > 0.0) {
      if (out.z > (t - before) * view.eye.w + THICK) {
        return vec4f(0.0);
      }
      var near = before;
      var far = t;
      var at = out.xy;
      for (var k = 0; k < CLOSING; k++) {
        let mid = 0.5 * (near + far);
        let probe = behind(start, ray, mid);
        if (probe.z > 0.0) {
          far = mid;
          at = probe.xy;
        } else {
          near = mid;
        }
      }
      let edge = min(min(at.x, 1.0 - at.x), min(at.y, 1.0 - at.y));
      let trust = smoothstep(0.0, 0.08, edge) * (1.0 - smoothstep(0.6, 1.0, far / reach));
      return vec4f(at, far, trust);
    }
    before = t;
  }
  return vec4f(0.0);
}

@fragment
fn reflectionMain(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let texel = vec2i(pixel.xy);
  let lit = textureLoad(scene, texel, 0);
  let left = textureLoad(mirror, texel, 0);
  if (left.a <= 0.0) {
    return lit;
  }
  let facing = textureLoad(plane, texel, 0);
  let uv = pixel.xy / view.size.xy;
  let along = view.inverse * vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.5, 1.0);
  let sight = normalize(along.xyz / along.w - view.eye.xyz);
  let start = view.eye.xyz + sight * (lit.a / view.eye.w);
  let struck = walk(start, reflect(sight, normalize(facing.xyz)));
  var shown = left.rgb;
  if (struck.w > 0.0) {
    // The blur a rough surface gives the reflection, in pixels where it lands.
    let soft = facing.w * struck.z * view.eye.w;
    let wide = soft / max(sceneFar(struck.xy), 0.05) * view.size.z * 0.5 * view.size.y;
    let level = clamp(log2(max(wide, 1.0)), 0.0, view.size.w);
    let seen = textureSampleLevel(scene, blurSampler, struck.xy, level).rgb;
    shown = mix(left.rgb, seen, struck.w);
  }
  return vec4f(lit.rgb + left.a * shown, lit.a);
}
`;
