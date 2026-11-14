// The wave field's last pass: the transformed fields laid out as the three
// maps the sea is drawn from. `shift` is where a point of the still surface
// goes (x, up, z); `slope` the height's gradient and the shift's own stretch;
// `moment` the gradient's second moments, whose mips are what keep distant
// glitter as wide as the waves under one pixel make it.

@group(0) @binding(0) var field: texture_2d_array<f32>;
@group(0) @binding(1) var shift: texture_storage_2d_array<rgba16float, write>;
@group(0) @binding(2) var slope: texture_storage_2d_array<rgba16float, write>;
@group(0) @binding(3) var moment: texture_storage_2d_array<rgba16float, write>;

@compute @workgroup_size(8, 8)
fn lay(@builtin(global_invocation_id) id: vec3u) {
  let at = vec2i(id.xy);
  let a = textureLoad(field, at, 2u * id.z, 0);
  let b = textureLoad(field, at, 2u * id.z + 1u, 0);
  textureStore(shift, at, id.z, vec4f(a.x, a.z, a.y, a.w));
  textureStore(slope, at, id.z, b);
  textureStore(moment, at, id.z, vec4f(b.x * b.x, b.y * b.y, b.x * b.y, 0.0));
}
