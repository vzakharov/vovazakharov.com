// The frame's scene and its glow, as a lens reads them: the textures the
// scene pass wrote, which every floor's lens binds at the same places.

@group(1) @binding(2) var sceneTexture: texture_2d<f32>;
@group(1) @binding(3) var glowTexture: texture_2d<f32>;
@group(1) @binding(4) var lensSampler: sampler;

fn sceneAt(uv: vec2f) -> vec4f {
  return textureSampleLevel(sceneTexture, lensSampler, uv, 0.0);
}

fn glowAt(uv: vec2f) -> vec3f {
  return textureSampleLevel(glowTexture, lensSampler, uv, 0.0).rgb;
}
