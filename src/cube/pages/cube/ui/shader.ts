/**
 * The cube's two pipelines, sharing their uniforms — the view-projection and
 * the ambient light — and their light: Lambert from a fixed light over the
 * ambient. The room's vertex is position, normal and colour; a sign's is
 * position, normal and a coordinate into its floor's board texture.
 */
export const SHADER = /* wgsl */ `
struct Uniforms {
  viewProjection: mat4x4f,
  ambient: vec4f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var board: texture_2d<f32>;
@group(0) @binding(2) var boardSampler: sampler;

struct Varying {
  @builtin(position) clip: vec4f,
  @location(0) normal: vec3f,
  @location(1) colour: vec3f,
};

struct SignVarying {
  @builtin(position) clip: vec4f,
  @location(0) normal: vec3f,
  @location(1) uv: vec2f,
};

const LIGHT = vec3f(0.36, 0.8, 0.48);
const DIFFUSE = 0.62;

fn lit(normal: vec3f, colour: vec3f) -> vec4f {
  let lambert = max(dot(normalize(normal), normalize(LIGHT)), 0.0);
  return vec4f(colour * (uniforms.ambient.rgb + DIFFUSE * lambert), 1.0);
}

@vertex
fn vertexMain(
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) colour: vec3f,
) -> Varying {
  var out: Varying;
  out.clip = uniforms.viewProjection * vec4f(position, 1.0);
  out.normal = normal;
  out.colour = colour;
  return out;
}

@fragment
fn fragmentMain(in: Varying) -> @location(0) vec4f {
  return lit(in.normal, in.colour);
}

@vertex
fn signVertex(
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) uv: vec2f,
) -> SignVarying {
  var out: SignVarying;
  out.clip = uniforms.viewProjection * vec4f(position, 1.0);
  out.normal = normal;
  out.uv = uv;
  return out;
}

@fragment
fn signFragment(in: SignVarying) -> @location(0) vec4f {
  return lit(in.normal, textureSample(board, boardSampler, in.uv).rgb);
}
`;
