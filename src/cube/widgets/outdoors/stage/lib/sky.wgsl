// The sky's light along a direction, gathered over a lobe as wide as the
// caller asks: a mirror's at lod 0, doubling with each unit, a quarter of the
// sphere at 8.

import super::clear_sky::{clearSky, skyGlance};
import super::clouds_wgsl::cirrusAlong;
import super::cloud_veil::{cloudVeil, cloudGlance};
import super::sun_glow::{aureole, sunDisc, sunHalo};
import package::cube::shared::outside::sun::SKY_FILL;

/// The sky a mirror shows: the fitted air, the glow round the sun, the ice
/// cloud and each cumulus where it stands, lit as a whole rather than
/// marched. The sun's own disc is in it at lod 0 and gone by a half.
fn skyMirrored(dir: vec3f, lod: f32) -> vec3f {
  let clouds = cloudVeil(dir);
  let air = clearSky(dir);
  let cirrus = cirrusAlong(dir, air);
  var behind = cirrus.rgb + cirrus.a * (air + aureole(dir));
  if (lod < 0.5) {
    behind +=
      sunDisc(dir, 0.0005) * cirrus.a * (1.0 - smoothstep(0.0, 0.5, lod));
  }
  return behind * clouds.a + clouds.rgb;
}

/// The sky as a few dozen operations: the air smoothed, the sun's halo, the
/// clouds as the cover they make toward the horizon, all drawn toward the
/// whole sky's mean as the lobe widens from lod 1 to the widest, 8.
fn skyGathered(dir: vec3f, lod: f32) -> vec3f {
  let clouds = cloudGlance(dir);
  let sky = (skyGlance(dir) + sunHalo(dir)) * clouds.a + clouds.rgb;
  let wide = clamp((lod - 1.0) / 7.0, 0.0, 1.0);
  return mix(sky, SKY_FILL, 0.7 * wide * wide);
}

/// The sky's light along unit `dir` at this instant over a lobe of `lod`:
/// mirrored under 1, gathered from 1 up, and the two mixed between a half
/// and 1, so a face whose roughness crosses there shows no seam.
fn skyRadiance(dir: vec3f, lod: f32) -> vec3f {
  if (lod >= 1.0) {
    return skyGathered(dir, lod);
  }
  let mirrored = skyMirrored(dir, lod);
  if (lod <= 0.5) {
    return mirrored;
  }
  return mix(mirrored, skyGathered(dir, lod), smoothstep(0.5, 1.0, lod));
}
