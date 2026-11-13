// A floor's lens: each pixel what the theme's lens makes of the scene.

import super::lens_stage::lensOf;

@fragment
fn lensFragment(@builtin(position) at: vec4f) -> @location(0) vec4f {
  return vec4f(themeLens(lensOf(at)), 1.0);
}
