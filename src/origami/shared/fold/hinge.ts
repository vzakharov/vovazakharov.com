/**
 * The fold angle across a mesh edge and its gradient (Schenk & Guest's
 * bar-and-hinge model), over positions packed three to a vertex.
 */

/** The four vertices of a hinge: edge `a`–`b`, triangles `(a, b, c)` and
 * `(b, a, d)`, both counter-clockwise in paper. */
export type Wings = {
  readonly a: number;
  readonly b: number;
  readonly c: number;
  readonly d: number;
};

/** A fold angle in (−π, π], valley positive as seen from the paper's front,
 * and, when `gradient` is given, ∂θ/∂x for a, b, c, d written into it. */
export function dihedral(
  x: Float64Array,
  { a, b, c, d }: Wings,
  gradient?: Float64Array,
): number {
  const ax = x[3 * a] ?? 0;
  const ay = x[3 * a + 1] ?? 0;
  const az = x[3 * a + 2] ?? 0;
  const ex = (x[3 * b] ?? 0) - ax;
  const ey = (x[3 * b + 1] ?? 0) - ay;
  const ez = (x[3 * b + 2] ?? 0) - az;
  const cx = (x[3 * c] ?? 0) - ax;
  const cy = (x[3 * c + 1] ?? 0) - ay;
  const cz = (x[3 * c + 2] ?? 0) - az;
  const dx = (x[3 * d] ?? 0) - ax;
  const dy = (x[3 * d + 1] ?? 0) - ay;
  const dz = (x[3 * d + 2] ?? 0) - az;
  // n1 = e × (c − a); n2 = (a − b) × (d − b) = (d − a) × e.
  const n1x = ey * cz - ez * cy;
  const n1y = ez * cx - ex * cz;
  const n1z = ex * cy - ey * cx;
  const n2x = dy * ez - dz * ey;
  const n2y = dz * ex - dx * ez;
  const n2z = dx * ey - dy * ex;
  const e2 = ex * ex + ey * ey + ez * ez;
  const e = Math.sqrt(e2);
  const n1sq = n1x * n1x + n1y * n1y + n1z * n1z;
  const n2sq = n2x * n2x + n2y * n2y + n2z * n2z;
  const n1 = Math.sqrt(n1sq);
  const n2 = Math.sqrt(n2sq);
  // sin θ along −e, the edge from b to a.
  const sine =
    -(
      (n1y * n2z - n1z * n2y) * ex +
      (n1z * n2x - n1x * n2z) * ey +
      (n1x * n2y - n1y * n2x) * ez
    ) /
    (n1 * n2 * e);
  const cosine = (n1x * n2x + n1y * n2y + n1z * n2z) / (n1 * n2);
  if (gradient) {
    const s1 = e / n1sq;
    const s2 = e / n2sq;
    const alphaC = (cx * ex + cy * ey + cz * ez) / e2;
    const alphaD = (dx * ex + dy * ey + dz * ez) / e2;
    // c and d turn their triangles about the edge; a and b carry the rest,
    // split by where c and d stand along it.
    for (let k = 0; k < 3; k++) {
      const gc = (k === 0 ? n1x : k === 1 ? n1y : n1z) * s1;
      const gd = (k === 0 ? n2x : k === 1 ? n2y : n2z) * s2;
      gradient[k] = -(1 - alphaC) * gc - (1 - alphaD) * gd;
      gradient[3 + k] = -alphaC * gc - alphaD * gd;
      gradient[6 + k] = gc;
      gradient[9 + k] = gd;
    }
  }
  return Math.atan2(sine, cosine);
}
