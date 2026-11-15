// How bright a colour looks, for a floor that draws in grey.

fn luma(colour: vec3f) -> f32 {
  return dot(colour, vec3f(0.2126, 0.7152, 0.0722));
}
