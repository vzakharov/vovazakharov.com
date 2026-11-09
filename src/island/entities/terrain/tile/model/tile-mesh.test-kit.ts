import assert from 'node:assert/strict';

import {
  cross,
  dot,
  scaled,
  sub,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import { borderLoop, type TileMesh } from './tile-mesh';

export function read(array: ArrayLike<number>, index: number): number {
  const value = array[index];
  assert.ok(value !== undefined, `index ${index} of ${array.length}`);
  return value;
}

const triple = (f: (c: 0 | 1 | 2) => number): Vec3 => [f(0), f(1), f(2)];

export const world = (mesh: TileMesh, v: number) =>
  triple((c) => read(mesh.centre, c) + read(mesh.positions, v * 3 + c));

export const normal = (mesh: TileMesh, v: number) =>
  triple((c) => read(mesh.normals, v * 3 + c));

export const middleOf = (mesh: TileMesh) => triple((c) => read(mesh.centre, c));

/** `d` less its part along `p`'s vertical: the horizontal step there. */
export const horizontal = (d: Vec3, p: Vec3) => {
  const up = unit(p);
  return sub(d, scaled(up, dot(d, up)));
};

const triangles = (mesh: TileMesh) =>
  Array.from({ length: mesh.indices.length / 3 }, (_, t) =>
    triple((c) => read(mesh.indices, t * 3 + c)),
  );

/**
 * Asserts a mesh filled at sea level: every grid normal along its vertex's
 * vertical and every skirt vertex carrying its border vertex's normal, every
 * grid face up and every skirt face away from the middle.
 */
export function assertFlatMesh(flat: TileMesh) {
  const grid = flat.grid;
  for (let v = 0; v < grid * grid; v++) {
    const p = world(flat, v);
    assert.ok(dot(normal(flat, v), unit(p)) > 1 - 1e-6, `vertex ${v}`);
  }
  for (const [n, top] of borderLoop(grid).entries()) {
    assert.deepEqual(normal(flat, grid * grid + n), normal(flat, top));
  }
  const middle = middleOf(flat);
  for (const [a, b, c] of triangles(flat)) {
    const [pa, pb, pc] = [world(flat, a), world(flat, b), world(flat, c)];
    const face = cross(sub(pb, pa), sub(pc, pa));
    const centroid = triple((i) => (pa[i] + pb[i] + pc[i]) / 3);
    const skirt = Math.max(a, b, c) >= grid * grid;
    const toward = skirt ? sub(centroid, middle) : centroid;
    assert.ok(dot(face, toward) > 0, `triangle ${a} ${b} ${c}`);
  }
}
