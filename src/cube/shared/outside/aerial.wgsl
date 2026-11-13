// What the air between does to a distant outdoor surface: every one is passed
// through `aerial`, and a surface far enough off is the horizon.

import package::cube::shared::sky::clear_sky::{clearSky, airThrough};

/// `colour`, the light of a surface `metres` off along unit `viewDir` from the
/// eye, as it arrives through the air between. What the air takes it gives
/// back as the sky's own light at the horizon on that bearing.
fn aerial(colour: vec3f, viewDir: vec3f, metres: f32) -> vec3f {
  let through = airThrough(metres);
  let horizon = clearSky(vec3f(viewDir.x, 0.0, viewDir.z));
  return colour * through + horizon * (1.0 - through);
}
