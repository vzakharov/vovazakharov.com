import { SKY_METRES } from '@/cube/shared/outside';

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
const CLOSING = 6;
/// How many times its own length the walk's last halving may lie behind a
/// face it met: a face seen edge-on hides much depth in one pixel.
const SLANT = 8.0;
/// The longest walk, in metres.
const REACH = 14.0;
/// How far behind what the scene shows the walk may be, past its own step,
/// and still be taken for having struck it, in metres.
const THICK = 0.4;
/// The share of a distance the scene's half-float depth cannot tell apart.
const BLUNT = 0.004;
/// Pixels the walk goes before anything can hide it.
const LEAVING = 2.0;
/// The farthest the scene's depth is read as: what the sky is written at,
/// which no face is beyond, so a pixel holding infinity reads as the sky.
const SIGHT = ${String(SKY_METRES)};
/// What \`behind\` says of a point off the screen.
const OFF = -1e9;
/// Levels below the one a blur that wide would pick: a level is a box, and
/// a box blurs harder than an edge spread that wide.
const SHARPEN = 1.0;
/// Samples along the blur's long side, and the longest it runs, as a share
/// of the screen's height.
const TAPS = 5;
const LONGEST = 0.15;
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

/// Metres from the eye to what the scene shows at \`texel\`, \`SIGHT\` where
/// it holds infinity or no number, which would spread through every sum.
fn metresAt(texel: vec2i) -> f32 {
  let metres = textureLoad(scene, texel, 0).a;
  return select(SIGHT, metres, metres < SIGHT);
}

/// Metres from the eye to what the scene shows at \`uv\`.
fn sceneFar(uv: vec2f) -> f32 {
  return metresAt(clamp(vec2i(uv * view.size.xy), vec2i(0), vec2i(view.size.xy) - 1));
}

/// Where the point \`t\` units along the walk lands, and how many metres it
/// lies behind what the scene shows there, past what the scene's depth can
/// tell apart: negative in front, \`OFF\` off the screen. Within \`LEAVING\`
/// pixels of \`origin\`, where the walk set out, it is always in front: a
/// pixel of a floor seen along its length spans more depth than the walk's
/// first steps climb, so the floor there would hide the walk from itself.
fn behind(start: vec3f, ray: vec3f, t: f32, origin: vec2f) -> vec3f {
  let q = start + ray * t;
  let at = onScreen(q);
  if (at.z == 0.0 || any(at.xy < vec2f(0.0)) || any(at.xy > vec2f(1.0))) {
    return vec3f(at.xy, OFF);
  }
  if (length((at.xy - origin) * view.size.xy) < LEAVING) {
    return vec3f(at.xy, -1.0);
  }
  let far = length(q - view.eye.xyz) * view.eye.w;
  let shown = sceneFar(at.xy);
  return vec3f(at.xy, far - shown - (BLUNT * shown + 0.01));
}

/// The walk from \`start\`, seen at \`origin\`, along \`ray\`: where on the
/// screen it struck, how many units it ran, and how far to trust it, 0 where
/// it struck nothing.
fn walk(start: vec3f, ray: vec3f, origin: vec2f) -> vec4f {
  let reach = REACH / view.eye.w;
  var before = 0.0;
  for (var i = 1; i <= STEPS; i++) {
    // Steps lengthen with the walk: short beside the surface it leaves, as
    // long as a far wall's detail on the screen at its end.
    let share = f32(i) / f32(STEPS);
    let t = reach * share * share;
    let out = behind(start, ray, t, origin);
    if (out.z == OFF) {
      return vec4f(0.0);
    }
    if (out.z > 0.0) {
      var near = before;
      var far = t;
      var at = out.xy;
      var past = out.z;
      for (var k = 0; k < CLOSING; k++) {
        let mid = 0.5 * (near + far);
        let probe = behind(start, ray, mid, origin);
        if (probe.z > 0.0) {
          far = mid;
          at = probe.xy;
          past = probe.z;
        } else {
          near = mid;
        }
      }
      // Closed in on a face it met, the walk ends just behind it; still far
      // behind what is shown, it passed behind something standing in front.
      if (past > (far - near) * view.eye.w * SLANT + THICK) {
        return vec4f(0.0);
      }
      let edge = min(min(at.x, 1.0 - at.x), min(at.y, 1.0 - at.y));
      let trust = smoothstep(0.0, 0.08, edge) * (1.0 - smoothstep(0.6, 1.0, far / reach));
      return vec4f(at, far, trust);
    }
    before = t;
  }
  return vec4f(0.0);
}

/// The way from the eye through \`uv\` on the screen, unit length.
fn sightAt(uv: vec2f) -> vec3f {
  let along = view.inverse * vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, 0.5, 1.0);
  return normalize(along.xyz / along.w - view.eye.xyz);
}

/// What the scene shows at \`texel\`, as a point of the frame.
fn shownAt(texel: vec2i) -> vec3f {
  let at = clamp(texel, vec2i(0), vec2i(view.size.xy) - 1);
  let uv = (vec2f(at) + 0.5) / view.size.xy;
  return view.eye.xyz + sightAt(uv) * (metresAt(at) / view.eye.w);
}

/// Metres the face shown at \`texel\` runs across one pixel along \`axis\`,
/// taken toward the neighbour on the same face, the nearer of the two.
fn stride(texel: vec2i, axis: vec2i) -> f32 {
  let p = shownAt(texel);
  let ahead = length(shownAt(texel + axis) - p);
  let back = length(shownAt(texel - axis) - p);
  return max(min(ahead, back) * view.eye.w, 1e-4);
}

/// The scene at \`uv\` blurred \`soft\` metres across the face it shows there,
/// as a rough mirror shows it: a face seen aslant blurs along its slant in
/// fewer pixels than across, so the blur is a level as sharp as its short
/// side, drawn out by taps along its long one.
fn blurred(uv: vec2f, soft: f32) -> vec3f {
  let texel = vec2i(uv * view.size.xy);
  let spread = soft / vec2f(stride(texel, vec2i(1, 0)), stride(texel, vec2i(0, 1)));
  let short = min(spread.x, spread.y);
  let long = min(max(spread.x, spread.y), LONGEST * view.size.y);
  // No sharper than the gap between taps, so they run together.
  let level = clamp(log2(max(max(short, long / f32(TAPS)), 1.0)) - SHARPEN, 0.0, view.size.w);
  let way = select(vec2f(0.0, 1.0), vec2f(1.0, 0.0), spread.x > spread.y) * long / view.size.xy;
  var sum = vec3f(0.0);
  for (var j = 0; j < TAPS; j++) {
    let off = (f32(j) / f32(TAPS - 1) - 0.5) * way;
    sum += textureSampleLevel(scene, blurSampler, uv + off, level).rgb;
  }
  return sum / f32(TAPS);
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
  let sight = sightAt(uv);
  let start = view.eye.xyz + sight * (metresAt(texel) / view.eye.w);
  let struck = walk(start, reflect(sight, normalize(facing.xyz)), uv);
  var shown = left.rgb;
  if (struck.w > 0.0) {
    shown = mix(left.rgb, blurred(struck.xy, facing.w * struck.z * view.eye.w), struck.w);
  }
  return vec4f(lit.rgb + left.a * shown, lit.a);
}
`;
