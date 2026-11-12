import type { Vec3 } from '../lib/vec';
import { f32, wgsl } from '../lib/wgsl';
import { CUBE_BOX, WORLD } from './frame';
import { SUN, SUN_DIR } from './sun';

/** The shadow's edge, in metres of sun ray: at the cube, and per metre off it. */
const EDGE = 0.05;
const EDGE_GROWS = 0.03;

const smoothstep = (from: number, to: number, x: number): number => {
  const t = Math.min(Math.max((x - from) / (to - from), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * How much of the sun reaches `p` in the world frame: 1 in the sun, 0 in the
 * shadow of the cube and its ladder, the edge softer the farther the shadow
 * has run.
 */
export function cubeShadow(p: Vec3): number {
  let enters = 0;
  let leaves = Infinity;
  for (const axis of [0, 1, 2] as const) {
    const a = (CUBE_BOX.min[axis] - p[axis]) / SUN_DIR[axis];
    const b = (CUBE_BOX.max[axis] - p[axis]) / SUN_DIR[axis];
    enters = Math.max(enters, Math.min(a, b));
    leaves = Math.min(leaves, Math.max(a, b));
  }
  return 1 - smoothstep(0, EDGE + EDGE_GROWS * enters, leaves - enters);
}

/** `cubeShadow(p: vec3f) -> f32`, the twin of the function above. */
export const CUBE_SHADOW = wgsl(
  'outside/cube-shadow',
  /* wgsl */ `
fn cubeShadow(p: vec3f) -> f32 {
  let a = (CUBE_MIN - p) / SUN_DIR;
  let b = (CUBE_MAX - p) / SUN_DIR;
  let near = min(a, b);
  let far = max(a, b);
  let enters = max(max(near.x, near.y), max(near.z, 0.0));
  let leaves = min(far.x, min(far.y, far.z));
  return 1.0 - smoothstep(0.0, ${f32(EDGE)} + ${f32(EDGE_GROWS)} * enters, leaves - enters);
}
`,
  WORLD,
  SUN,
);
