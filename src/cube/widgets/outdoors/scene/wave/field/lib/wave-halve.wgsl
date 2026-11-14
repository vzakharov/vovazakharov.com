// A wave map's next mip: each texel the mean of the four under it.

@group(0) @binding(0) var source: texture_2d_array<f32>;
@group(0) @binding(1) var to: texture_storage_2d_array<rgba16float, write>;

@compute @workgroup_size(8, 8)
fn halve(@builtin(global_invocation_id) id: vec3u) {
  let at = vec2i(id.xy) * 2;
  let sum =
    textureLoad(source, at, id.z, 0)
      + textureLoad(source, at + vec2i(1, 0), id.z, 0)
      + textureLoad(source, at + vec2i(0, 1), id.z, 0)
      + textureLoad(source, at + vec2i(1, 1), id.z, 0);
  textureStore(to, vec2i(id.xy), id.z, sum * 0.25);
}
