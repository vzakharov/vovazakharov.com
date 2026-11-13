import { type Wgsl, wgsl } from '@/cube/shared/lib/wgsl';
import {
  AERIAL,
  ISLAND_HEIGHT,
  OUTDOOR_STAGE,
  SKY,
  WATER_LEVEL,
} from '@/cube/shared/outside';

/**
 * A stand-in sea: the flat surface at `waterLevel`, found along each pixel's
 * ray and given that point's depth, showing the sky map mirrored over a body
 * that darkens with the water's depth.
 */
const SEA_SHADER = wgsl(
  'sea/stand-in',
  /* wgsl */ `
struct Sea {
  @location(0) light: vec4f,
  @location(1) mirror: vec4f,
  @location(2) plane: vec4f,
  @builtin(frag_depth) depth: f32,
};

@fragment
fn fragmentMain(@builtin(position) at: vec4f) -> Sea {
  let ray = rayThrough(at.xy);
  let eye = frame.eye.xyz;
  if (ray.y > -1e-5) {
    discard;
  }
  let still = eye - ray * (eye.y / ray.y);
  let level = waterLevel(still.xz, frame.clock.x);
  let metres = (level - eye.y) / ray.y;
  let p = eye + ray * metres;
  let deep = level - islandHeight(p.xz);
  if (metres <= 0.0 || deep < 0.0) {
    discard;
  }
  let up = vec3f(0.0, 1.0, 0.0);
  let glancing = pow(1.0 - max(-ray.y, 0.0), 5.0);
  let mirrored = skyRadiance(reflect(ray, up), 0.0);
  let body = mix(vec3f(0.5, 0.55, 0.42), vec3f(0.03, 0.12, 0.16), 1.0 - exp(-0.7 * deep));
  let light = mix(body, mirrored, 0.02 + 0.98 * glancing);
  let clip = clipOf(p);
  return Sea(
    vec4f(aerial(light, ray, metres), metres),
    vec4f(0.0),
    vec4f(0.0),
    clip.z / clip.w,
  );
}
`,
  OUTDOOR_STAGE,
  SKY,
  AERIAL,
  ISLAND_HEIGHT,
  WATER_LEVEL,
);

/** What the sea layer's shader is assembled from. */
export const SEA_ROOTS: readonly Wgsl[] = [SEA_SHADER];
