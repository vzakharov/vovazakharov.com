import { CASCADES, TILE } from '../model/cascade';

/**
 * The sea's mesh: rings about the point under the eye, each a little wider
 * than the last, so the triangles are centimetres at the eye and reach the
 * far plane in `RINGS` steps. Only the sector the eye faces is laid.
 */
export const RINGS = 512;
export const SPOKES = 640;
/** Metres: the radius at which rings stop growing by a fixed step. */
const CORE = 0.5;
const REACH = 20_000;
const GROWTH = Math.log(REACH / CORE + 1) / (RINGS - 1);

const SIDES = CASCADES.map(({ side }) => side.toFixed(1)).join(', ');

/**
 * The sea's own bindings (group 1) and the surface read from the wave maps:
 * where a still point is carried to, and the slope statistics under a pixel.
 * It leans on the scene's piece for \`frame\` and on the shore's for
 * \`calm(xz)\`, how much of each cascade's waves the depth lets through.
 */
export const SEA_SURFACE = /* wgsl */ `
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

const CASCADES = ${String(CASCADES.length)}u;
const SIDES = array<f32, ${String(CASCADES.length)}>(${SIDES});
const SPOKES = ${String(SPOKES)}u;

/// Where the still surface's point \`still\` is now, for a mesh whose cells
/// are \`cell\` metres wide there: waves a cell cannot draw are left out.
fn carried(still: vec2f, cell: f32) -> vec3f {
  let quiet = calm(still);
  var shift = vec3f(0.0);
  for (var i = 0u; i < CASCADES; i++) {
    let texel = SIDES[i] / ${String(TILE)}.0;
    let lod = max(log2(2.0 * cell / texel), 0.0);
    shift += quiet[i]
      * textureSampleLevel(shiftMap, waveSampler, still / SIDES[i], i, lod).xyz;
  }
  return vec3f(still.x, level(still), still.y) + shift;
}

struct SeaVarying {
  @builtin(position) clip: vec4f,
  @location(0) still: vec2f,
  @location(1) world: vec3f,
}

@vertex
fn seaVertex(@builtin(vertex_index) index: u32) -> SeaVarying {
  let ring = f32(index / (SPOKES + 1u));
  let spoke = f32(index % (SPOKES + 1u));
  let radius = ${CORE.toFixed(2)} * (exp(${GROWTH.toFixed(6)} * ring) - 1.0);
  let angle = grid.yaw + (spoke / f32(SPOKES) - 0.5) * grid.sector;
  let still = frame.eye.xz + radius * vec2f(cos(angle), sin(angle));
  let cell = max(
    ${GROWTH.toFixed(6)} * (radius + ${CORE.toFixed(2)}),
    radius * grid.sector / f32(SPOKES),
  );
  var out: SeaVarying;
  out.still = still;
  out.world = carried(still, cell);
  out.clip = frame.viewProjection * vec4f(out.world, 1.0);
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

/// The waves about \`still\`, filtered over the pixel's footprint \`across\`
/// and \`down\` the screen.
fn wavesAt(still: vec2f, across: vec2f, down: vec2f) -> Waves {
  let quiet = calm(still);
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
    waves.spread += share * share * max(
      moment - vec3f(slope.x * slope.x, slope.y * slope.y, slope.x * slope.y),
      vec3f(0.0, 0.0, -1.0),
    );
  }
  return waves;
}
`;
