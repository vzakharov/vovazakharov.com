import { cross3, dot3, moved, scaled, type Vec3 } from '../lib/vec';
import { f32, vecf, wgsl } from '../shader/wgsl';
import { CUBE_BOX } from './frame';
import { SUN_DIR } from './sun';

/** How sharp a shadow's edge is where it starts, in metres. */
export const SHADOW_CRISP = 0.003;

/** How far behind the thing that casts it a shadow is whole, in metres. */
export const SHADOW_BEHIND = 0.05;

const CUBE_HALF = scaled(moved(CUBE_BOX.max, CUBE_BOX.min, -1), 0.5);

/** The middle of the cube, in the world frame. */
export const CUBE_CENTRE = moved(CUBE_BOX.min, CUBE_HALF);

const AXES: Vec3[] = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

/**
 * The cube's outline as the sun sees it, a hexagon: for each pair of its
 * sides, the way they face across the sun's rays and how far from the cube's
 * middle they stand.
 */
export const CUBE_OUTLINE = AXES.map((axis) => {
  const [x, y, z] = cross3(axis, SUN_DIR);
  const long = Math.hypot(x, y, z);
  const facing: Vec3 = [x / long, y / long, z / long];
  return {
    facing,
    reach: dot3(CUBE_HALF, [
      Math.abs(facing[0]),
      Math.abs(facing[1]),
      Math.abs(facing[2]),
    ]),
  };
});

const CUBE_OUTLINE_WGSL = CUBE_OUTLINE.map(({ facing, reach }) =>
  vecf([...facing, reach]),
).join(',\n  ');

/** `SHADOW_CRISP`, `SHADOW_BEHIND` and `CUBE_OUTLINE` as the WGSL constants the shadow reads. */
export const CUBE_SHADOW_NUMBERS = wgsl(
  'outside/cube-shadow-numbers',
  /* wgsl */ `
const SHADOW_CRISP = ${f32(SHADOW_CRISP)};
const SHADOW_BEHIND = ${f32(SHADOW_BEHIND)};
/// The cube's outline as the sun sees it: the way each pair of its sides
/// faces across the rays, and how far from the cube's middle they stand.
const CUBE_OUTLINE = array<vec4f, 3>(
  ${CUBE_OUTLINE_WGSL}
);
`,
);
