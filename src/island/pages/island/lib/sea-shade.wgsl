// The sea's colour: a TSL `wgslFn`'s source, so the module holds this one
// function, the rest of the sea reached from `island-sea.wgsl`.

import super::island_sea::seaColour;

/// `seaColour`, under the name a material's colour calls.
fn seaShade(
  place: vec3f,
  field: vec3f,
  grain: vec3f,
  world: vec3f,
  eye: vec3f,
  sun: vec3f,
  bed: f32,
  under: vec3f,
  footprint: f32,
  seconds: f32,
  mirrored: vec3f,
  overhead: vec3f,
  swell: vec2f,
  bands: f32,
) -> vec3f {
  return
    seaColour(
      place,
      field,
      grain,
      world,
      eye,
      sun,
      bed,
      under,
      footprint,
      seconds,
      mirrored,
      overhead,
      swell,
      bands,
    );
}
