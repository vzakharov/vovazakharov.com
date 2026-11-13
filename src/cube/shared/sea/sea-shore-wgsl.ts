import { f32, wgsl } from '../lib/wgsl';
import { OUTDOOR_STAGE, WATER_LEVEL } from '../outside';

/**
 * Metres from the island's crest between which the swell's ordered train,
 * which `waterLevel` draws, gives way to the open sea's own random swell.
 */
export const TRAIN_ENDS = [140, 260] as const;

/**
 * Still depths, metres, over which each cascade's waves die out toward the
 * beach: a wave cannot stand in water much shallower than it is long.
 */
export const SWELL_DIES_OVER = [0.3, 3] as const;
const DIES_OVER = [SWELL_DIES_OVER, [0.05, 0.5], [0.004, 0.05]] as const;

/**
 * The sea at the shore, for the sea's own shader: \`level(xz)\`, the slow
 * surface the wind's waves ride; \`calm(xz)\`, how much of each cascade the
 * place lets through; and \`shoreAt(xz)\`, everything about the surf and the
 * swash at a point that foam and the bed's light are drawn from.
 */
export const SEA_SHORE = wgsl(
  'sea/shore',
  /* wgsl */ `
/// 0 by the island, 1 out where the open sea's own swell has taken over.
fn offshore(xz: vec2f) -> f32 {
  return smoothstep(${f32(TRAIN_ENDS[0])}, ${f32(TRAIN_ENDS[1])}, length(xz));
}

fn level(xz: vec2f) -> f32 {
  let off = offshore(xz);
  if (off >= 1.0) {
    return 0.0;
  }
  return (1.0 - off) * waterLevel(xz, frame.clock.x);
}

/// How much of each cascade water \`depth\` metres deep lets through, \`off\`
/// of the way offshore.
fn calmOver(off: f32, depth: f32) -> vec4f {
  return vec4f(
    off,
    ${DIES_OVER.map(([from, to]) => `smoothstep(${f32(from)}, ${f32(to)}, depth)`).join(',\n    ')},
  );
}

/// \`calmOver\` at \`xz\` by the still sea's depth there.
fn calm(xz: vec2f) -> vec4f {
  let off = offshore(xz);
  if (off >= 1.0) {
    return vec4f(1.0);
  }
  return calmOver(off, -islandHeight(xz));
}

/// The surf and the swash at one point, now.
struct Shore {
  /// The sand, and the slow surface, metres over the still sea.
  bed: f32,
  level: f32,
  /// The point's own time: the clock less how long the swell takes to reach it.
  tau: f32,
  /// What the island's lee leaves of a wave here, 0.3 to 1.
  shelter: f32,
  /// Turns since the last crest passed, 0 to 1.
  phase: f32,
  /// 0 an unbroken swell, 1 a bore.
  broken: f32,
  /// Unit direction the waves run here, on the ground plan.
  runs: vec2f,
  /// Seconds since the last wave landed and the one before it, and how deep
  /// each one's sheet lies here.
  since: vec2f,
  sheet: vec2f,
}

fn shoreAt(xz: vec2f) -> Shore {
  var shore: Shore;
  let t = frame.clock.x;
  shore.bed = islandHeight(xz);
  let rise = shoreRise(xz);
  let facing = shoreFacing(dot(rise, SWELL_RUNS), length(rise), shore.bed);
  let depth = shoreDepth(shore.bed);
  shore.runs = normalize(SWELL_RUNS * SWELL_PACE + shoreSlowing(depth) * rise);
  shore.shelter = sheltered(facing);
  let tongue = cuspAt(xz);
  shore.tau = t - dot(xz, SWELL_RUNS) * SWELL_PACE - shoreDelay(depth);
  let turns = turnsAt(shore.tau);
  let n = floor(turns);
  shore.phase = turns - n;
  shore.broken = brokenAt(shore.tau, shore.bed, shore.shelter);
  shore.since = shore.tau - vec2f(crestOf(n), crestOf(n - 1.0));
  shore.sheet = vec2f(
    sheetDepth(n, shore.tau, shore.bed, shore.shelter * tongue),
    sheetDepth(n - 1.0, shore.tau, shore.bed, shore.shelter * tongue),
  );
  shore.level = swellLevel(dot(xz, SWELL_RUNS), shore.bed, shore.shelter, tongue, t);
  return shore;
}
`,
  OUTDOOR_STAGE,
  WATER_LEVEL,
);
