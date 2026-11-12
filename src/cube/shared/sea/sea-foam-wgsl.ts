import { f32, wgsl } from '../lib/wgsl';
import { HASH } from '../lib/wgsl-hash';
import { PERIOD } from '../outside/swell';
import { SEA_SHORE } from './sea-shore-wgsl';

/** Seconds over which the foam a breaker leaves behind thins to 1/e. */
const TRAIL_LASTS = 2.8;
/** The same for the bubbles it drives under, which outlast the foam on top. */
const BUBBLES_LAST = 5;
/** And for the foam riding a swash sheet. */
const SHEET_LASTS = 2.2;
/** A sheet thinner than this, metres, is its own white edge. */
const EDGE = 0.025;

/**
 * Foam, as a function of the moment alone: how thick it lies at a point is
 * read from how long ago a crest passed or a wave landed there, and the lace
 * it thins into is a pattern fixed to the sea, so no frame remembers another.
 */
export const SEA_FOAM = wgsl(
  'sea/foam',
  /* wgsl */ `
/// How much of a pixel foam of thickness \`dense\` covers at \`p\`, metres on
/// the sea: whole at 1 and over, and thinning into a web whose holes open.
fn lace(p: vec2f, dense: f32) -> f32 {
  if (dense <= 0.02) {
    return 0.0;
  }
  let warp = vec2f(valueNoise(p * 1.3, 11u), valueNoise(p * 1.3 + vec2f(7.7, 3.1), 12u)) - 0.5;
  let web = 0.6 * worley(p * 2.3 + 1.2 * warp, 21u).x
    + 0.4 * worley(p * 8.5 + 3.0 * warp, 22u).x;
  let open = mix(0.72, -0.2, min(dense, 1.0));
  return smoothstep(open, open + 0.2, web) * smoothstep(0.02, 0.12, dense);
}

/// How thick the foam lies at \`still\`: the wind's whitecaps, where the
/// surface is squeezed to a point; a breaker's roller and what it leaves; and
/// the swash sheets' edges and backs. Over 1 where it is churning.
fn foamThickness(shore: Shore, squeeze: f32) -> f32 {
  var dense = smoothstep(0.6, 1.1, -squeeze);
  if (shore.bed < 0.0 && shore.broken > 0.0) {
    let roller = max(
      smoothstep(0.9, 0.965, shore.phase),
      1.0 - smoothstep(0.0, 0.07, shore.phase),
    );
    let trail = exp(-shore.phase * ${f32(PERIOD / TRAIL_LASTS)});
    dense = max(dense, shore.broken * max(1.4 * roller, trail));
  }
  for (var i = 0; i < 2; i++) {
    let sheet = shore.sheet[i];
    if (sheet > 0.0) {
      let since = shore.since[i];
      let edge = (1.0 - smoothstep(0.0, ${f32(EDGE)}, sheet))
        * (0.35 + exp(-since / ${f32(SHEET_LASTS)}));
      let back = 0.9 * exp(-since / ${f32(SHEET_LASTS)});
      dense = max(dense, max(edge, back) * smoothstep(0.0, 0.004, sheet));
    }
  }
  return dense;
}

/// The share of the water under a breaker's wake that is bubbles.
fn bubbles(shore: Shore) -> f32 {
  if (shore.bed >= 0.0) {
    return 0.0;
  }
  return shore.broken * exp(-shore.phase * ${f32(PERIOD / BUBBLES_LAST)});
}
`,
  HASH,
  SEA_SHORE,
);
