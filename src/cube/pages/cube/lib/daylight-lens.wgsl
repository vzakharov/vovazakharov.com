// The lens an eye outdoors sees through: the scene and a little of its glow,
// exposed, through the film's curve, mixed with what floor 1's lens makes of
// the same scene, between eyelids — two soft-edged arcs closing from above and
// below, the gap between them widest in the middle.

import super::lens_stage::{uniforms, lensOf};
import package::cube::entities::theme::kit::lib::grade::{filmic, through};

/// How far the film parts red from blue, as `through` takes it: a quarter
/// of a pixel at the frame's lower edge, where the outdoors is sparks and
/// grain a pixel wide that a wider parting would colour.
const FRINGE = 0.0005;

/// Where the outside's film leaves the room's curve, in exposed light, and
/// how slowly it nears white past there: daylight runs from sunlit sand to a
/// sky forty times brighter beside the sun, and the room's shoulder prints
/// all of that range white.
const KNEE = 1.0;
const TAIL = 0.6;

/// Exposed light to display colour: the room's film up to `KNEE`, then a
/// tail that keeps telling brighter from bright up to the sun's disc.
fn daylightFilm(colour: vec3f) -> vec3f {
  let x = max(colour, vec3f(0.0));
  let knee = vec3f(KNEE);
  let top = filmic(knee);
  let tail = 1.0 - (1.0 - top) * pow(knee / max(x, knee), vec3f(TAIL));
  return pow(select(filmic(min(x, knee)), tail, x > knee), vec3f(1.0 / 2.2));
}

/// How much of the pixel at `uv` shows between eyelids `open` of the way open.
fn betweenLids(uv: vec2f, open: f32) -> f32 {
  let across = uv.x - 0.5;
  let gap = open * (0.76 - 0.9 * across * across);
  let soft = 0.02 + 0.14 * (1.0 - open);
  return 1.0 - smoothstep(gap - soft, gap + soft * 0.25, abs(uv.y - 0.5));
}

@fragment
fn lensFragment(@builtin(position) at: vec4f) -> @location(0) vec4f {
  let l = lensOf(at);
  let film = daylightFilm(through(l, 0.03, FRINGE) * uniforms.lens.x);
  let seen = mix(film, themeLens(l), uniforms.lens.z);
  return vec4f(seen * betweenLids(l.uv, uniforms.lens.y), 1.0);
}
