// The level above, halved: one bilinear tap at a texel corner of it is the
// mean of the four texels around.

@group(0) @binding(0) var above: texture_2d<f32>;
@group(0) @binding(1) var aboveSampler: sampler;

@fragment
fn halveMain(@builtin(position) pixel: vec4f) -> @location(0) vec4f {
  let uv = pixel.xy * 2.0 / vec2f(textureDimensions(above));
  return textureSampleLevel(above, aboveSampler, uv, 0.0);
}
