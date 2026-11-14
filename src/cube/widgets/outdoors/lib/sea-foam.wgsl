// Foam, as a function of the moment alone: how thick it lies at a point is
// read from how long ago a crest passed or a wave landed there, and the lace
// it thins into is a pattern fixed to the sea, so no frame remembers another.

import package::cube::entities::island::model::swell_course::SWELL_RUNS;
import package::cube::shared::shader::hash::{mix32, unitOf, cellHash, valueNoise, fbm};
import super::sea_foam_numbers::SWELL_PERIOD;
import super::sea_shore::Shore;

/// Seconds over which the foam a breaker leaves behind thins to 1/e.
const TRAIL_LASTS = 2.2;
/// The same for the bubbles it drives under, which outlast the foam on top.
const BUBBLES_LAST = 5.0;
/// And for the foam riding a swash sheet.
const SHEET_LASTS = 3.2;
/// How many times longer than wide the swash draws the lace's cells.
const DRAWN_OUT = 1.8;
/// The still waterline's distance from the island's middle, metres, about.
const SHORE_RADIUS = 30.0;
/// How many times finer the lace is on a swash sheet than out on the surf.
const FOAM_FINER = 2.4;
/// Bubbles to a metre of foam, where it thins enough to show them apart.
const BUBBLES = 38.0;
/// Still depth, metres, by which a breaker's foam rides at full strength.
const SURF_FLOATS = 0.3;
/// How wide a breaker's roller is from front to back, metres, about.
const ROLLER_WIDE = 1.2;
/// A sheet thinner than this, metres, is its own white edge.
const FOAM_EDGE = 0.025;

/// How far `p` stands from the nearest wall between cells of a unit
/// lattice with one point in each: 0 on a wall.
fn foamWalls(p: vec2f, salt: u32) -> f32 {
  let cell = vec2i(floor(p));
  var first = 8.0;
  var second = 8.0;
  for (var dy = -1; dy <= 1; dy++) {
    for (var dx = -1; dx <= 1; dx++) {
      let other = cell + vec2i(dx, dy);
      let word = cellHash(other, salt);
      let distance =
        length(vec2f(other) + vec2f(unitOf(word), unitOf(mix32(word))) - p);
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

/// How much of a pixel foam of thickness `dense` covers at `p` on the
/// lace's own plan: whole at 1 and over, then breaking into patches joined
/// by the threads that bubbles gather into along the walls between cells. A
/// pixel `blur` of that plan wide shows the threads and patches narrower
/// than itself as their mean, not as dots.
fn laceAt(p: vec2f, dense: f32, blur: f32) -> f32 {
  let warp =
    vec2f(fbm(p * 0.9, 11u, 3), fbm(p * 0.9 + vec2f(7.7, 3.1), 14u, 3)) - 0.5;
  let fold =
    vec2f(
      valueNoise(p * 3.7, 12u),
      valueNoise(p * 3.7 + vec2f(2.3, 9.1), 13u),
    ) - 0.5;
  let at = p + 0.9 * warp + 0.22 * fold;
  let patches =
    mix(0.5, fbm(at * 0.7, 17u, 4), 1.0 - smoothstep(0.7, 2.8, blur));
  let wide = 0.2 + 2.6 * blur;
  let wider = 0.4 + 9.0 * blur;
  // A thread drawn wider is drawn fainter, toward what the walls cover of
  // the sea on the whole, so the foam a far pixel shows is the near one's.
  // No wall runs whole round its cell: a thread swells, thins and breaks
  // off along its length, and its edge is frayed.
  let run = fbm(at * 1.9, 19u, 3);
  let strand = wide * mix(0.3, 1.15, run);
  let threads =
    smoothstep(0.36, 0.6, run) * mix(
      0.14,
      1.0 - smoothstep(0.0, strand, foamWalls(at * 2.6, 21u)),
      0.2 / wide,
    );
  let frayed =
    (fbm(p * 13.0, 24u, 2) - 0.5) * clamp(1.0 - 13.0 * blur, 0.0, 1.0);
  let fine =
    mix(
      0.29,
      1.0 - smoothstep(0.0, wider, foamWalls(at * 9.0, 22u)),
      0.4 / wider,
    );
  let body = 0.5 * patches + 0.36 * threads + 0.18 * fine + 0.07 * frayed;
  let open = 1.0 - 1.15 * min(dense, 1.0);
  let soft = 0.5 * min(blur, 1.0);
  return
    smoothstep(open - soft, open + 0.3 + soft, body) * smoothstep(
      0.02,
      0.1,
      dense,
    );
}

/// The lace at `still`, metres on the sea, in a pixel `pixel` metres
/// wide. Out on the surf its plan is the sea's own; on the beach the water
/// that carries it runs up and back, drawing the cells out up the sand, and a
/// sheet's thin foam breaks finer. The beach's plan is laid round the island
/// — metres along the shore by metres out from it — and joins itself on one
/// line in the island's lee.
fn lace(still: vec2f, dense: f32, shore: Shore, pixel: f32) -> f32 {
  if (dense <= 0.02) {
    return 0.0;
  }
  let ashore = smoothstep(-0.35, 0.0, shore.bed);
  var cover = 0.0;
  if (ashore < 1.0) {
    cover = laceAt(still, dense, pixel);
  }
  if (ashore > 0.0) {
    let out = max(length(still), 1.0);
    let round =
      atan2(
        still.x * SWELL_RUNS.y - still.y * SWELL_RUNS.x,
        -dot(still, SWELL_RUNS),
      );
    let beach =
      FOAM_FINER
        * SHORE_RADIUS
        * vec2f(log(out / SHORE_RADIUS) / DRAWN_OUT, round);
    cover =
      mix(
        cover,
        laceAt(beach, dense, FOAM_FINER * SHORE_RADIUS * pixel / out),
        ashore,
      );
  }
  // Where foam thins it comes apart into bubbles, the water between them
  // showing; a pixel wider than a bubble shows their mean.
  let apart =
    smoothstep(0.12, 0.45, foamWalls(still * BUBBLES, 23u)) * clamp(
      1.0 - BUBBLES * pixel,
      0.0,
      1.0,
    );
  return cover * (1.0 - apart * (1.0 - cover));
}

/// How much of a breaker's foam and bubbles the water at a point is deep
/// enough to carry: none where the still sea ends, all of it by
/// `SURF_FLOATS` metres deep, so the surf thins into the swash with no edge.
fn surfReaches(shore: Shore) -> f32 {
  return smoothstep(0.0, SURF_FLOATS, -shore.bed);
}

/// How thick the foam lies at `still`: the wind's whitecaps, where the
/// surface is squeezed to a point; a breaker's roller and what it leaves; and
/// the swash sheets' edges and backs. Over 1 where it is churning. A pixel
/// `pixel` metres wide shows a roller narrower than itself as its share
/// of the pixel.
fn foamThickness(still: vec2f, shore: Shore, squeeze: f32, pixel: f32) -> f32 {
  var dense = smoothstep(0.6, 1.1, -squeeze);
  let afloat = surfReaches(shore);
  if (afloat > 0.0 && shore.broken > 0.0) {
    // The roller's back edge is ragged: each stretch of crest lets go of
    // its foam a little sooner or later than the next.
    let ragged =
      shore.phase - 0.035 * mix(
        0.5,
        fbm(still * 1.7, 31u, 3),
        clamp(1.5 - 2.0 * pixel, 0.0, 1.0),
      );
    let roller =
      max(
        smoothstep(0.93, 0.965, shore.phase),
        1.0 - smoothstep(0.0, 0.035, ragged),
      );
    let trail = 0.75 * exp(-shore.phase * (SWELL_PERIOD / TRAIL_LASTS));
    let share = clamp(ROLLER_WIDE / pixel, 0.4, 1.0);
    dense =
      max(dense, afloat * shore.broken * max(1.4 * share * roller, trail));
  }
  for (var i = 0; i < 2; i++) {
    let sheet = shore.sheet[i];
    if (sheet > 0.0) {
      let since = shore.since[i];
      let edge =
        (1.0 - smoothstep(0.0, FOAM_EDGE, sheet)) * (0.35 + exp(
          -since / SHEET_LASTS,
        ));
      let back = 0.9 * exp(-since / SHEET_LASTS);
      dense = max(dense, max(edge, back) * smoothstep(0.0, 0.004, sheet));
    }
  }
  return dense;
}

/// The share of the water under a breaker's wake that is bubbles.
fn bubbles(shore: Shore) -> f32 {
  return
    surfReaches(shore)
      * shore.broken
      * exp(-shore.phase * (SWELL_PERIOD / BUBBLES_LAST));
}
