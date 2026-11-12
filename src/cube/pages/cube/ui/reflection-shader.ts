import { d, std, tgpu } from 'typegpu';

/** How many levels the scene is kept at, each half the last, for blur. */
export const BLUR_LEVELS = 6;

/** A level of the scene, read to make the one below it. */
export const halving = tgpu.bindGroupLayout({
  above: { texture: d.texture2d(d.f32) },
  aboveSampler: { sampler: 'filtering' },
});

/**
 * The level above, halved: one bilinear tap at a texel corner of it is the
 * mean of the four texels around.
 */
export const halveMain = tgpu.fragmentFn({
  in: { pixel: d.builtin.position },
  out: d.vec4f,
})(({ pixel }) => {
  'use gpu';
  const uv = pixel.xy
    .mul(2)
    .div(d.vec2f(std.textureDimensions(halving.$.above)));
  return std.textureSampleLevel(halving.$.above, halving.$.aboveSampler, uv, 0);
});

export const View = d.struct({
  viewProjection: d.mat4x4f,
  /** From clip space back to the frame the mesh is in. */
  inverse: d.mat4x4f,
  /** The eye, and how many metres one unit of the frame is. */
  eye: d.vec4f,
  /** The screen in pixels, the projection's focal length, the top blur level. */
  size: d.vec4f,
});

/** What the reflection reads: where it is seen from, and the scene's targets. */
export const reflecting = tgpu.bindGroupLayout({
  view: { uniform: View },
  scene: { texture: d.texture2d(d.f32) },
  mirror: { texture: d.texture2d(d.f32) },
  plane: { texture: d.texture2d(d.f32) },
  blurSampler: { sampler: 'filtering' },
});

/** Steps of the walk, and halvings that close in on what it passed behind. */
const WALK_STEPS = 24;
const CLOSING = 6;
/**
 * How many times its own length the walk's last halving may lie behind a face
 * it met: a face seen edge-on hides much depth in one pixel.
 */
const SLANT = 8;
/** The longest walk, in metres. */
const REACH = 14;
/**
 * How far behind what the scene shows the walk may be, past its own step, and
 * still be taken for having struck it, in metres.
 */
const THICK = 0.4;
/** The share of a distance the scene's half-float depth cannot tell apart. */
const BLUNT = 0.004;
/** Pixels the walk goes before anything can hide it. */
const LEAVING = 2;
/** What `behind` says of a point off the screen. */
const OFF = -1e9;
/**
 * Levels below the one a blur that wide would pick: a level is a box, and a
 * box blurs harder than an edge spread that wide.
 */
const SHARPEN = 1;
/**
 * Samples along the blur's long side, and the longest it runs, as a share of
 * the screen's height.
 */
const TAPS = 5;
const LONGEST = 0.15;

/**
 * Where `p` lands on the screen, 0 to 1 from the top left; z is 0 for a point
 * behind the eye.
 */
const onScreen = (p: d.v3f): d.v3f => {
  'use gpu';
  const clip = std.mul(reflecting.$.view.viewProjection, d.vec4f(p, 1));
  if (clip.w <= 1e-5) {
    return d.vec3f(0);
  }
  const ndc = clip.xy.div(clip.w);
  return d.vec3f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5, 1);
};

/** Metres from the eye to what the scene shows at `uv`. */
const sceneFar = (uv: d.v2f): number => {
  'use gpu';
  const size = reflecting.$.view.size.xy;
  const texel = std.clamp(
    d.vec2i(uv.mul(size)),
    d.vec2i(0),
    d.vec2i(size).sub(1),
  );
  return std.textureLoad(reflecting.$.scene, texel, 0).a;
};

/**
 * Where the point `t` units along the walk lands, and how many metres it lies
 * behind what the scene shows there, past what the scene's depth can tell
 * apart: negative in front, `OFF` off the screen. Within `LEAVING` pixels of
 * `origin`, where the walk set out, it is always in front: a pixel of a floor
 * seen along its length spans more depth than the walk's first steps climb,
 * so the floor there would hide the walk from itself.
 */
const behind = (start: d.v3f, ray: d.v3f, t: number, origin: d.v2f): d.v3f => {
  'use gpu';
  const q = start.add(ray.mul(t));
  const at = onScreen(q);
  if (
    at.z === 0 ||
    std.any(std.lt(at.xy, d.vec2f(0))) ||
    std.any(std.gt(at.xy, d.vec2f(1)))
  ) {
    return d.vec3f(at.xy, OFF);
  }
  if (std.length(at.xy.sub(origin).mul(reflecting.$.view.size.xy)) < LEAVING) {
    return d.vec3f(at.xy, -1);
  }
  const far =
    std.length(q.sub(reflecting.$.view.eye.xyz)) * reflecting.$.view.eye.w;
  const shown = sceneFar(at.xy);
  return d.vec3f(at.xy, far - shown - (BLUNT * shown + 0.01));
};

/**
 * The walk from `start`, seen at `origin`, along `ray`: where on the screen it
 * struck, how many units it ran, and how far to trust it, 0 where it struck
 * nothing.
 */
const walk = (start: d.v3f, ray: d.v3f, origin: d.v2f): d.v4f => {
  'use gpu';
  const reach = REACH / reflecting.$.view.eye.w;
  let before = d.f32(0);
  for (let i = 1; i <= WALK_STEPS; i++) {
    // Steps lengthen with the walk: short beside the surface it leaves, as
    // long as a far wall's detail on the screen at its end.
    const share = d.f32(i) / d.f32(WALK_STEPS);
    const t = reach * share * share;
    const out = behind(start, ray, t, origin);
    if (out.z === OFF) {
      return d.vec4f(0);
    }
    if (out.z > 0) {
      let near = before;
      let far = t;
      let at = out.xy;
      let past = out.z;
      for (let k = 0; k < CLOSING; k++) {
        const mid = 0.5 * (near + far);
        const probe = behind(start, ray, mid, origin);
        if (probe.z > 0) {
          far = mid;
          at = probe.xy;
          past = probe.z;
        } else {
          near = mid;
        }
      }
      // Closed in on a face it met, the walk ends just behind it; still far
      // behind what is shown, it passed behind something standing in front.
      if (past > (far - near) * reflecting.$.view.eye.w * SLANT + THICK) {
        return d.vec4f(0);
      }
      const edge = std.min(std.min(at.x, 1 - at.x), std.min(at.y, 1 - at.y));
      const trust =
        std.smoothstep(0, 0.08, edge) *
        (1 - std.smoothstep(0.6, 1, far / reach));
      return d.vec4f(at, far, trust);
    }
    before = t;
  }
  return d.vec4f(0);
};

/** The way from the eye through `uv` on the screen, unit length. */
const sightAt = (uv: d.v2f): d.v3f => {
  'use gpu';
  const along = std.mul(
    reflecting.$.view.inverse,
    d.vec4f(uv.x * 2 - 1, 1 - uv.y * 2, 0.5, 1),
  );
  return std.normalize(along.xyz.div(along.w).sub(reflecting.$.view.eye.xyz));
};

/** What the scene shows at `texel`, as a point of the frame. */
const shownAt = (texel: d.v2i): d.v3f => {
  'use gpu';
  const size = reflecting.$.view.size.xy;
  const eye = reflecting.$.view.eye;
  const at = std.clamp(texel, d.vec2i(0), d.vec2i(size).sub(1));
  const uv = d.vec2f(at).add(0.5).div(size);
  const far = std.textureLoad(reflecting.$.scene, at, 0).a;
  return eye.xyz.add(sightAt(uv).mul(far / eye.w));
};

/**
 * Metres the face shown at `texel` runs across one pixel along `axis`, taken
 * toward the neighbour on the same face, the nearer of the two.
 */
const stride = (texel: d.v2i, axis: d.v2i): number => {
  'use gpu';
  const p = shownAt(texel);
  const ahead = std.length(shownAt(texel.add(axis)).sub(p));
  const back = std.length(shownAt(texel.sub(axis)).sub(p));
  return std.max(std.min(ahead, back) * reflecting.$.view.eye.w, 1e-4);
};

/**
 * The scene at `uv` blurred `soft` metres across the face it shows there, as
 * a rough mirror shows it: a face seen aslant blurs along its slant in fewer
 * pixels than across, so the blur is a level as sharp as its short side,
 * drawn out by taps along its long one.
 */
const blurred = (uv: d.v2f, soft: number): d.v3f => {
  'use gpu';
  const size = reflecting.$.view.size;
  const texel = d.vec2i(uv.mul(size.xy));
  const spread = d
    .vec2f(soft)
    .div(d.vec2f(stride(texel, d.vec2i(1, 0)), stride(texel, d.vec2i(0, 1))));
  const short = std.min(spread.x, spread.y);
  const long = std.min(std.max(spread.x, spread.y), LONGEST * size.y);
  // No sharper than the gap between taps, so they run together.
  const level = std.clamp(
    std.log2(std.max(std.max(short, long / d.f32(TAPS)), 1)) - SHARPEN,
    0,
    size.w,
  );
  const way = std
    .select(d.vec2f(0, 1), d.vec2f(1, 0), spread.x > spread.y)
    .mul(long)
    .div(size.xy);
  let sum = d.vec3f(0);
  for (let j = 0; j < TAPS; j++) {
    const off = way.mul(d.f32(j) / d.f32(TAPS - 1) - 0.5);
    sum = sum.add(
      std.textureSampleLevel(
        reflecting.$.scene,
        reflecting.$.blurSampler,
        uv.add(off),
        level,
      ).rgb,
    );
  }
  return sum.div(d.f32(TAPS));
};

/**
 * The frame's mirrors filled in. Each pixel the scene left a mirror at walks
 * the reflection out through the scene's own depth until it passes behind
 * what the scene shows, and takes the light there, blurred as far as the
 * surface is rough. Where the walk leaves the screen, runs out or is hidden,
 * the lamps' light the scene left stands in, faded in over the screen's edge
 * and the walk's last stretch so neither shows a seam.
 */
export const reflectionMain = tgpu.fragmentFn({
  in: { pixel: d.builtin.position },
  out: d.vec4f,
})(({ pixel }) => {
  'use gpu';
  const eye = reflecting.$.view.eye;
  const texel = d.vec2i(pixel.xy);
  const lit = std.textureLoad(reflecting.$.scene, texel, 0);
  const left = std.textureLoad(reflecting.$.mirror, texel, 0);
  if (left.a <= 0) {
    return lit;
  }
  const facing = std.textureLoad(reflecting.$.plane, texel, 0);
  const uv = pixel.xy.div(reflecting.$.view.size.xy);
  const sight = sightAt(uv);
  const start = eye.xyz.add(sight.mul(lit.a / eye.w));
  const struck = walk(start, std.reflect(sight, std.normalize(facing.xyz)), uv);
  let shown = left.rgb;
  if (struck.w > 0) {
    shown = std.mix(
      left.rgb,
      blurred(struck.xy, facing.w * struck.z * eye.w),
      struck.w,
    );
  }
  return d.vec4f(lit.rgb.add(shown.mul(left.a)), lit.a);
});
