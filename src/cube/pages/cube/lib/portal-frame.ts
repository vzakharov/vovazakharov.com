import { DOORWAY_CUT } from '@/cube/shared/cube-boundary';
import type { Seen, Vec3 } from '@/cube/shared/lib/vec';
import type { Beyond, InRoom } from '@/cube/entities/world';

import { multiply } from './matrix';

/** Corners of the two triangles a doorway's opening is drawn as. */
const DOORWAY_VERTICES = 6;

/**
 * The view an eye seeing `seen` has of what lies `beyond` a portal, in the
 * frame those rooms are built in: the same picture, so what is drawn through
 * it lands on the screen where the doorway shows it.
 */
export function seenBeyond(
  { from, to, turn }: Beyond,
  { viewProjection, eye }: Seen,
): Seen {
  const cos = Math.cos(turn);
  const sin = Math.sin(turn);
  const east = to.u - (cos * from.u - sin * from.v);
  const south = to.v - (sin * from.u + cos * from.v);
  // Column-major: the far frame turned about the vertical, then moved.
  const placing = Float32Array.of(
    cos, 0, sin, 0,
    0, 1, 0, 0,
    -sin, 0, cos, 0,
    east, 0, south, 1,
  );
  const [x, y, z] = eye;
  const off: Vec3 = [x - east, y, z - south];
  return {
    viewProjection: multiply(viewProjection, placing),
    eye: [cos * off[0] + sin * off[2], y, -sin * off[0] + cos * off[2]],
  };
}

/**
 * The opening of a doorway whose middle is at `middle` of the eye's frame, in
 * an east wall or a south one, as the vertices of two triangles, on its
 * wall's line.
 */
export function doorwayOpening(
  { u, v }: InRoom,
  isEast: boolean,
): Float32Array<ArrayBuffer> {
  const half = (DOORWAY_CUT.to - DOORWAY_CUT.from) / 2;
  const corner = (along: number, up: number): Vec3 =>
    isEast ? [u, up, v + along] : [u + along, up, v];
  const { height } = DOORWAY_CUT;
  const [a, b, c, d] = [
    corner(-half, 0),
    corner(half, 0),
    corner(half, height),
    corner(-half, height),
  ];
  const vertices = [a, b, c, a, c, d].flat();
  if (vertices.length !== DOORWAY_VERTICES * 3) {
    throw new Error('A doorway opening is two triangles');
  }
  return Float32Array.from(vertices);
}

export { DOORWAY_VERTICES };
