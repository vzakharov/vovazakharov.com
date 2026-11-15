// The water's body as the frame's sun lights it, for every layer: it needs
// none of the sea's own bindings, so the sky's backdrop and the sand take it.

import super::outdoor_frame::frame;
import package::cube::shared::cube_boundary::sun::{SUN_LIGHT, SKY_FILL};
import package::nature::shared::water::water_optics::ATTENUATE;
import package::nature::shared::water::water_light::{DROWNED, fresnel};

/// The sun's light let in per unit of level surface.
fn sunEntering() -> vec3f {
  return SUN_LIGHT * frame.sun.y * (1.0 - fresnel(frame.sun.y));
}

/// The body in the open sun: the colour a ray running on through water
/// comes to, whatever lies at its end.
fn drownedBody() -> vec3f {
  return DROWNED * (sunEntering() + SKY_FILL);
}

/// `colour` seen through `metres` of water, whose scattering blurs a thing
/// out of sight long before it is dark.
fn throughWater(colour: vec3f, metres: f32) -> vec3f {
  let keeps = exp(-ATTENUATE * max(metres, 0.0));
  return colour * keeps + drownedBody() * (vec3f(1.0) - keeps);
}

/// The metres of the segment from `a` to `b` that lie under the still sea.
fn underStill(a: vec3f, b: vec3f) -> f32 {
  let low = min(a.y, b.y);
  let high = max(a.y, b.y);
  return clamp(-low / max(high - low, 1e-4), 0.0, 1.0) * length(b - a);
}
