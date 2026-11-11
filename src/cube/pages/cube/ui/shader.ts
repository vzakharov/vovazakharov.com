/**
 * The cube's one pipeline: a vertex is position, normal and colour; the
 * uniforms are the view-projection, the eye with the fog's density in `w`,
 * the fog's colour and the ambient light. Lambert from a fixed light over
 * the ambient, then exponential fog by distance from the eye.
 */
export const SHADER = /* wgsl */ `
struct Uniforms {
  viewProjection: mat4x4f,
  eye: vec4f,
  fog: vec4f,
  ambient: vec4f,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

struct Varying {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
  @location(2) colour: vec3f,
};

@vertex
fn vertexMain(
  @location(0) position: vec3f,
  @location(1) normal: vec3f,
  @location(2) colour: vec3f,
) -> Varying {
  var out: Varying;
  out.clip = uniforms.viewProjection * vec4f(position, 1.0);
  out.world = position;
  out.normal = normal;
  out.colour = colour;
  return out;
}

const LIGHT = vec3f(0.36, 0.8, 0.48);
const DIFFUSE = 0.62;

@fragment
fn fragmentMain(in: Varying) -> @location(0) vec4f {
  let lambert = max(dot(normalize(in.normal), normalize(LIGHT)), 0.0);
  let lit = in.colour * (uniforms.ambient.rgb + DIFFUSE * lambert);
  let distance = length(in.world - uniforms.eye.xyz);
  let clear = exp(-distance * uniforms.eye.w);
  return vec4f(mix(uniforms.fog.rgb, lit, clear), 1.0);
}
`;
