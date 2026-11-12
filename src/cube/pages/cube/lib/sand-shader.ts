import { type Wgsl, wgsl } from '@/cube/shared/lib/wgsl';
import {
  AERIAL,
  DAYLIGHT,
  ISLAND_HEIGHT,
  OUTDOOR_STAGE,
  WATER_LEVEL,
} from '@/cube/shared/outside';

/**
 * Stand-in sand: a grid of the ground plan lifted to `islandHeight`, matte in
 * the daylight, darker where the water has just been.
 */
const SAND_SHADER = wgsl(
  'sand/stand-in',
  /* wgsl */ `
struct Sand {
  @builtin(position) clip: vec4f,
  @location(0) world: vec3f,
};

@vertex
fn vertexMain(@location(0) xz: vec2f) -> Sand {
  let world = vec3f(xz.x, islandHeight(xz), xz.y);
  return Sand(clipOf(world), world);
}

@fragment
fn fragmentMain(in: Sand) -> Scene {
  let xz = in.world.xz;
  let step = 0.25;
  let height = islandHeight(xz);
  let normal = normalize(vec3f(
    height - islandHeight(xz + vec2f(step, 0.0)),
    step,
    height - islandHeight(xz + vec2f(0.0, step)),
  ));
  let wet = smoothstep(0.25, 0.0, height - waterLevel(xz, frame.clock.x));
  let sand = mix(vec3f(0.62, 0.52, 0.38), vec3f(0.3, 0.24, 0.17), wet);
  let metres = metresTo(in.world);
  let view = normalize(in.world - frame.eye.xyz);
  return lit(aerial(sand * daylight(in.world, normal), view, metres), metres);
}
`,
  OUTDOOR_STAGE,
  AERIAL,
  DAYLIGHT,
  ISLAND_HEIGHT,
  WATER_LEVEL,
);

/** What the sand layer's shader is assembled from. */
export const SAND_ROOTS: readonly Wgsl[] = [SAND_SHADER];
