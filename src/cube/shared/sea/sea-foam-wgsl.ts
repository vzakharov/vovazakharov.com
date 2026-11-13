import { f32, wgsl } from '../lib/wgsl';
import { HASH } from '../lib/wgsl-hash';
import { PERIOD } from '../outside/swell';
import { SEA_SHORE } from './sea-shore-wgsl';

/** Seconds over which the foam a breaker leaves behind thins to 1/e. */
const TRAIL_LASTS = 2.2;
/** The same for the bubbles it drives under, which outlast the foam on top. */
const BUBBLES_LAST = 5;
/** And for the foam riding a swash sheet. */
const SHEET_LASTS = 3.2;
/** How many times longer than wide the swash draws the lace's cells. */
const DRAWN_OUT = 2.4;
/** How many times finer the lace is on a swash sheet than out on the surf. */
const FINER = 2.4;
/** Bubbles to a metre of foam, where it thins enough to show them apart. */
const BUBBLES = 38;
/** Still depth, metres, by which a breaker's foam rides at full strength. */
const SURF_FLOATS = 0.3;
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
/// How far \`p\` stands from the nearest wall between cells of a unit
/// lattice with one point in each: 0 on a wall.
fn foamWalls(p: vec2f, salt: u32) -> f32 {
  let cell = vec2i(floor(p));
  var first = 8.0;
  var second = 8.0;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let other = cell + vec2i(dx, dy);
      let word = cellHash(other, salt);
      let distance = length(vec2f(other) + vec2f(unitOf(word), unitOf(mix32(word))) - p);
      if (distance < first) {
        second = first;
        first = distance;
      } else if (distance < second) {
        second = distance;
      }
    }
  }
  return second - first;
}

/// How much of a pixel foam of thickness \`dense\` covers at \`p\`, metres on
/// the sea: whole at 1 and over, then breaking into patches joined by the
/// threads that bubbles gather into along the walls between cells. On the
/// beach the water that carries it runs up and back along \`shore.runs\`,
/// and draws the cells out that way, and a sheet's thin foam
/// breaks finer than a breaker's. A pixel \`pixel\` metres of sea wide
/// shows the threads narrower than itself as their mean, not as dots.
fn lace(still: vec2f, dense: f32, shore: Shore, pixel: f32) -> f32 {
  if (dense <= 0.02) {
    return 0.0;
  }
  let ashore = smoothstep(-0.35, 0.0, shore.bed);
  let drawn = 1.0 + ${f32(DRAWN_OUT - 1)} * ashore;
  let finer = 1.0 + ${f32(FINER - 1)} * ashore;
  let p = finer
    * (still + (1.0 / drawn - 1.0) * dot(still, shore.runs) * shore.runs);
  let warp = vec2f(fbm(p * 0.9, 11u, 3), fbm(p * 0.9 + vec2f(7.7, 3.1), 14u, 3)) - 0.5;
  let fold = vec2f(valueNoise(p * 3.7, 12u), valueNoise(p * 3.7 + vec2f(2.3, 9.1), 13u)) - 0.5;
  let at = p + 0.9 * warp + 0.22 * fold;
  let patches = fbm(at * 0.7, 17u, 4);
  let blur = finer * pixel;
  let wide = 0.2 + 2.6 * blur;
  let wider = 0.4 + 9.0 * blur;
  // A thread drawn wider is drawn fainter, toward what the walls cover of
  // the sea on the whole, so the foam a far pixel shows is the near one's.
  let threads = mix(0.14, 1.0 - smoothstep(0.0, wide, foamWalls(at * 2.6, 21u)), 0.2 / wide);
  let fine = mix(0.29, 1.0 - smoothstep(0.0, wider, foamWalls(at * 9.0, 22u)), 0.4 / wider);
  let body = 0.5 * patches + 0.32 * threads + 0.18 * fine;
  let open = 1.0 - 1.15 * min(dense, 1.0);
  let cover = smoothstep(open - 0.5 * blur, open + 0.3 + 0.5 * blur, body)
    * smoothstep(0.02, 0.1, dense);
  // Where foam thins it comes apart into bubbles, the water between them
  // showing; a pixel wider than a bubble shows their mean.
  let apart = smoothstep(0.12, 0.45, foamWalls(still * ${f32(BUBBLES)}, 23u))
    * clamp(1.0 - ${f32(BUBBLES)} * pixel, 0.0, 1.0);
  return cover * (1.0 - apart * (1.0 - cover));
}

/// How much of a breaker's foam and bubbles the water at a point is deep
/// enough to carry: none where the still sea ends, all of it by
/// ${String(SURF_FLOATS)} m deep, so the surf thins into the swash with no edge.
fn surfReaches(shore: Shore) -> f32 {
  return smoothstep(0.0, ${f32(SURF_FLOATS)}, -shore.bed);
}

/// How thick the foam lies at \`still\`: the wind's whitecaps, where the
/// surface is squeezed to a point; a breaker's roller and what it leaves; and
/// the swash sheets' edges and backs. Over 1 where it is churning.
fn foamThickness(still: vec2f, shore: Shore, squeeze: f32) -> f32 {
  var dense = smoothstep(0.6, 1.1, -squeeze);
  let afloat = surfReaches(shore);
  if (afloat > 0.0 && shore.broken > 0.0) {
    // The roller's back edge is ragged: each stretch of crest lets go of
    // its foam a little sooner or later than the next.
    let ragged = shore.phase - 0.035 * fbm(still * 1.7, 31u, 3);
    let roller = max(
      smoothstep(0.93, 0.965, shore.phase),
      1.0 - smoothstep(0.0, 0.035, ragged),
    );
    let trail = 0.75 * exp(-shore.phase * ${f32(PERIOD / TRAIL_LASTS)});
    dense = max(dense, afloat * shore.broken * max(1.4 * roller, trail));
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
  return surfReaches(shore) * shore.broken
    * exp(-shore.phase * ${f32(PERIOD / BUBBLES_LAST)});
}
`,
  HASH,
  SEA_SHORE,
);
