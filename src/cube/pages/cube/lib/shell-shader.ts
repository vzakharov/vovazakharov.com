import { type Wgsl, wgsl } from '@/cube/shared/lib/wgsl';
import { AERIAL, DAYLIGHT, OUTDOOR_STAGE, WORLD } from '@/cube/shared/outside';

/**
 * A stand-in shell: the cube's six faces, black and matte, each vertex placed
 * from its index alone — six to a face, the faces west, east, down, up, north,
 * south.
 */
const SHELL_SHADER = wgsl(
  'shell/stand-in',
  /* wgsl */ `
struct Shell {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
  @location(1) normal: vec3f,
};

@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> Shell {
  var corners = array<vec2f, 6>(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0),
    vec2f(0.0, 0.0), vec2f(1.0, 1.0), vec2f(0.0, 1.0),
  );
  let face = index / 6u;
  let far = face % 2u == 1u;
  // Swapping a face's two axes turns it to face the other way.
  let corner = select(corners[index % 6u].yx, corners[index % 6u], far);
  let side = select(0.0, 1.0, far);
  var at = vec3f(corner, side);
  var normal = vec3f(0.0, 0.0, 1.0);
  if (face / 2u == 0u) {
    at = at.zxy;
    normal = normal.zxy;
  } else if (face / 2u == 1u) {
    at = at.yzx;
    normal = normal.yzx;
  }
  let world = mix(CUBE_MIN, CUBE_MAX, at);
  return Shell(clipOf(world), world, normal * (side * 2.0 - 1.0));
}

@fragment
fn fragmentMain(in: Shell) -> Scene {
  let metres = metresTo(in.world);
  let view = normalize(in.world - frame.eye.xyz);
  let light = vec3f(0.035) * daylight(in.world, normalize(in.normal));
  return lit(aerial(light, view, metres), metres);
}
`,
  OUTDOOR_STAGE,
  AERIAL,
  DAYLIGHT,
  WORLD,
);

/** What the shell layer's shader is assembled from. */
export const SHELL_ROOTS: readonly Wgsl[] = [SHELL_SHADER];
