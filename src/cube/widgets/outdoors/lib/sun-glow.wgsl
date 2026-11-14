// The sun as the eye meets it: the glow close round it, that glow's broad lobe
// alone, and the disc itself.

import package::cube::shared::outside::sun::SUN_DIR;
import super::clear_sky::{PI, sunSeen};
import super::clear_sky_fit::SUN_IRRADIANCE;
import super::sun_glow_numbers::{GLARE_G, GLARE_SHARE, AUREOLE_G, AUREOLE_SHARE, KASTEN_A, KASTEN_B, KASTEN_C, HAZE_OVERHEAD, SUN_HALO};

/// The sun's angular radius, radians.
const SUN_RADIUS = 0.2666 * PI / 180.0;

/// What the disc shows at its middle, in the scene's units. The sun itself is
/// some forty-six thousand times a face it lights; a half float and the bloom
/// both want less, and past this the eye could not tell.
const DISC_LIGHT = 600.0;

fn henyey(c: f32, g: f32) -> f32 {
  return (1.0 - g * g) / (4.0 * PI * pow(1.0 + g * g - 2.0 * g * c, 1.5));
}

/// The haze's optical depth for scattering from the eye out along a ray
/// `lift` radians over the horizon, by Kasten and Young's air mass.
fn hazeDepth(lift: f32) -> vec3f {
  let degrees = max(lift, 0.0) * 180.0 / PI;
  let mass =
    1.0 / (sin(max(lift, 0.0)) + KASTEN_A * pow(degrees + KASTEN_B, KASTEN_C));
  return HAZE_OVERHEAD * mass;
}

/// The haze's forward lobes, scattered once. Near the sun the way to a
/// droplet and on to the eye is one straight line, so the light is the sun's
/// own through the whole air along `dir`.
fn aureole(dir: vec3f) -> vec3f {
  let c = dot(dir, SUN_DIR);
  let lobes =
    GLARE_SHARE * henyey(c, GLARE_G) + AUREOLE_SHARE * henyey(c, AUREOLE_G);
  let lift = asin(clamp(dir.y, -1.0, 1.0));
  let glow = SUN_IRRADIANCE * lobes * sunSeen(dir) * hazeDepth(lift);
  // Nothing round the disc outshines the disc.
  return glow / (1.0 + max(glow.r, max(glow.g, glow.b)) / (DISC_LIGHT * 0.5));
}

/// The aureole's broad lobe alone at the price of one power, for a mirror too
/// rough to show the rest.
fn sunHalo(dir: vec3f) -> vec3f {
  return SUN_HALO * henyey(dot(dir, SUN_DIR), AUREOLE_G);
}

/// The disc, `edge` a pixel's width in radians: darker and redder to the
/// limb, redder again toward the horizon, where its light has more air to
/// cross.
fn sunDisc(dir: vec3f, edge: f32) -> vec3f {
  let away = acos(clamp(dot(dir, SUN_DIR), -1.0, 1.0));
  let inside = 1.0 - smoothstep(SUN_RADIUS - edge, SUN_RADIUS + edge, away);
  if (inside <= 0.0) {
    return vec3f(0.0);
  }
  let across = clamp(away / SUN_RADIUS, 0.0, 1.0);
  let limb =
    pow(vec3f(sqrt(1.0 - across * across * 0.98)), vec3f(0.40, 0.50, 0.65));
  let reaching = sunSeen(dir);
  return DISC_LIGHT * limb * reaching / max(sunSeen(SUN_DIR).r, 1e-6) * inside;
}
