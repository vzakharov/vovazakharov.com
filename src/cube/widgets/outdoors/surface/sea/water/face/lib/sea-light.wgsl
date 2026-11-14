// How light leaves the sea toward the eye: the sky mirrored in waves, the
// sun's glitter, and what the water's own body sends back up. Light is in the
// scene's units throughout, where `SUN_LIGHT` is what a white matte face
// square to the sun shows — π times less than the sun's irradiance.

import package::cube::widgets::outdoors::stage::lib::outdoor_frame::frame;
import package::cube::widgets::outdoors::stage::lib::sky::skyRadiance;
import package::cube::shared::cube_boundary::sun::SUN_LIGHT;
import super::sea_surface::Waves;
import package::cube::widgets::outdoors::stage::lib::water_body::fresnel;
import package::cube::widgets::outdoors::stage::lib::water_optics::{ABSORB, BACKSCATTER};

/// The least cosine between a facet's normal and the eye's line it is lit at.
const TURNED = 0.02;
/// The sun's disc, as the spread of slopes that mirror some part of it.
const DISC_SPREAD = 6e-6;

/// The sky map's level whose texels are as wide as the lobe a surface with
/// slope deviation `deviation` smears a reflection over — never under 1,
/// below which the sky draws its sun's disc, which is the glitter's to draw.
fn skyLod(deviation: f32) -> f32 {
  return clamp(log2(max(4.0 * deviation, 1e-4) * 512.0 / 3.14159), 1.0, 8.0);
}

/// What a sea surface sends the eye by reflection.
struct Mirrored {
  /// The sky's light, already weighed by how much each facet reflects.
  sky: vec3f,
  /// The mean share reflected, so the rest is what enters the water.
  share: f32,
  /// The area the eye sees of a unit of sea, facets hidden by others left out.
  shown: f32,
}

/// The sky in waves of slope `waves.slope` ± `waves.spread`, seen along
/// `toEye`. Three facets stand for the spread along the line of sight: at
/// a glancing eye the ones leaning away hide behind the ones leaning in, which
/// is why a horizon neither mirrors the sky at its edge nor goes black.
fn mirrored(waves: Waves, toEye: vec3f) -> Mirrored {
  let ahead = normalize(toEye.xz + vec2f(1e-6, 0.0));
  let along =
    sqrt(
      max(
        waves.spread.x * ahead.x * ahead.x
          + waves.spread.y * ahead.y * ahead.y
          + 2.0 * waves.spread.z * ahead.x * ahead.y,
        0.0,
      ),
    );
  let lod = skyLod(sqrt(waves.spread.x + waves.spread.y));
  var out: Mirrored;
  var weight = 0.0;
  for (var i = -1; i <= 1; i++) {
    // Gauss–Hermite: the mean and one point 1.732 deviations either side.
    let lean = waves.slope - 1.7320508 * f32(i) * along * ahead;
    let leant = normalize(vec3f(-lean.x, 1.0, -lean.y));
    // A facet the eye could only see from behind is one the mesh drew too
    // smooth to hide: it shows as the nearest facet that does face the eye.
    let normal =
      normalize(leant + toEye * max(TURNED - dot(leant, toEye), 0.0));
    let facing = dot(normal, toEye);
    let area = select(1.0, 4.0, i == 0) / 6.0 * facing / normal.y;
    var bounce = reflect(-toEye, normal);
    bounce.y = abs(bounce.y);
    let share = fresnel(facing);
    out.sky += area * share * skyRadiance(bounce, lod);
    out.share += area * share;
    weight += area;
  }
  out.shown = max(weight, 1e-4);
  out.sky /= out.shown;
  out.share /= out.shown;
  return out;
}

/// The sun's glitter: the share of facets under the pixel that stand at just
/// the slope that mirrors the sun to the eye, as a Gaussian about the mean
/// slope (Cox & Munk 1954), over the area of sea the eye sees.
fn glitter(waves: Waves, toEye: vec3f, shown: f32) -> vec3f {
  let half = normalize(toEye + frame.sun.xyz);
  if (half.y <= 0.0) {
    return vec3f(0.0);
  }
  let off = -half.xz / half.y - waves.slope;
  let sx = waves.spread.x + DISC_SPREAD;
  let sz = waves.spread.y + DISC_SPREAD;
  let cross = waves.spread.z;
  let det = max(sx * sz - cross * cross, 1e-12);
  let fit =
    (sz * off.x * off.x
      - 2.0 * cross * off.x * off.y
      + sx * off.y * off.y) / det;
  let density = exp(-0.5 * fit) / (6.2831853 * sqrt(det));
  let lifted = half.y * half.y;
  let light =
    fresnel(dot(toEye, half)) * density / (4.0 * shown * lifted * lifted);
  return SUN_LIGHT * min(3.14159 * light, 1200.0);
}

/// What deep water shows of `falling`, the light a white face would show
/// under the same sky: what its own scattering returns before absorption
/// takes the rest (Gordon et al. 1975).
fn upwelling(falling: vec3f) -> vec3f {
  return falling * 0.33 * BACKSCATTER / (ABSORB + BACKSCATTER);
}
