/**
 * Mesh edges passing through a triangle they are not part of: the count a
 * relaxed model is judged by, since paper never passes through paper.
 */
import type { Creased, PaperMesh } from './mesh.ts';
import { grid, longestEdge } from './proximity.ts';
import { cross3, dot3, sub3, type Vec3, vertexAt } from './space.ts';
import type { Triangle } from './triangulate.ts';

/**
 * Each vertex's crease lines, as keys of the line each crease lies on in
 * paper: a crease folded twice over one paper line (a strip's long crease,
 * both ends of it) shares one.
 */
export function creaseLines(mesh: Creased): Map<number, Set<string>> {
  const lines = new Map<number, Set<string>>();
  for (const h of mesh.hinges) {
    if (!h.crease) continue;
    const [px, py] = mesh.paper[h.a] ?? [0, 0];
    const [qx, qy] = mesh.paper[h.b] ?? [0, 0];
    let angle = Math.atan2(qy - py, qx - px);
    if (angle < 0) angle += Math.PI;
    if (angle >= Math.PI - 1e-9) angle = 0;
    const offset = -Math.sin(angle) * px + Math.cos(angle) * py;
    const key = `${angle.toFixed(4)}:${offset.toFixed(4)}`;
    for (const v of [h.a, h.b]) {
      const set = lines.get(v) ?? new Set<string>();
      set.add(key);
      lines.set(v, set);
    }
  }
  return lines;
}

const creaseCache = new WeakMap<PaperMesh, Map<number, Set<string>>>();

/**
 * The edges passing deeper than `within` through a triangle past its plane,
 * at their shallower end. Where several creases meet, a sheet's own thickness
 * is far finer than the mesh, so layers pressed there graze one another by a
 * fraction of it; that is touching, not passing through. Within `nested`
 * sheet thicknesses (twice `within`), an edge at a crease passing through a
 * triangle at a crease on the same paper line is nested, not crossing: real
 * creases nest one inside the other, and the mesh draws each as a wedge one
 * edge wide, so two nested wedges graze. `nested` 0 counts them all.
 */
export function crossings(
  mesh: PaperMesh,
  x: Float64Array,
  { within = 0, nested = 0 } = {},
): number {
  const { triangles, bars } = mesh;
  const cell = longestEdge(mesh);
  const near = grid(x, triangles, cell, cell);
  const at = (v: number, axis: number) => x[3 * v + axis] ?? 0;
  let lines = creaseCache.get(mesh);
  if (!lines) {
    lines = creaseLines(mesh);
    creaseCache.set(mesh, lines);
  }
  const sharing = lines;
  const shares = (a: number, b: number, corners: Triangle): boolean => {
    const mine = new Set([
      ...(sharing.get(a) ?? []),
      ...(sharing.get(b) ?? []),
    ]);
    return corners.some((c) =>
      [...(sharing.get(c) ?? [])].some((line) => mine.has(line)),
    );
  };
  const nestedDepth = nested * 2 * within;
  let found = 0;
  for (const [a, b] of bars) {
    const mid = [0, 1, 2].map((axis) => (at(a, axis) + at(b, axis)) / 2);
    const hit = near(mid[0] ?? 0, mid[1] ?? 0, mid[2] ?? 0).some((t) => {
      const corners = triangles[t];
      if (!corners || corners.includes(a) || corners.includes(b)) return false;
      const depth = pierces(x, a, b, corners);
      return depth > within && !(depth <= nestedDepth && shares(a, b, corners));
    });
    if (hit) found++;
  }
  return found;
}

/** How far segment `a`–`b` passes through the triangle's interior
 * (Möller–Trumbore): its shallower end's distance past the plane, 0 when it
 * misses or only touches. */
export function pierces(
  x: Float64Array,
  a: number,
  b: number,
  [t0, t1, t2]: Triangle,
): number {
  const eps = 1e-6;
  const d = (p: number, q: number): Vec3 =>
    sub3(vertexAt(x, p), vertexAt(x, q));
  const dir = d(b, a);
  const e1 = d(t1, t0);
  const e2 = d(t2, t0);
  const h = cross3(dir, e2);
  const det = dot3(e1, h);
  if (Math.abs(det) < 1e-18) return 0;
  const s = d(a, t0);
  const u = dot3(s, h) / det;
  const q = cross3(s, e1);
  const w = dot3(dir, q) / det;
  const t = dot3(e2, q) / det;
  if (!(u > eps && w > eps && u + w < 1 - eps && t > eps && t < 1 - eps)) {
    return 0;
  }
  const normal = cross3(e1, e2);
  const along = Math.abs(dot3(dir, normal)) / Math.hypot(...normal);
  return Math.min(t, 1 - t) * along;
}
