/**
 * The inverse of column-major 4×4 `m`, by cofactors; throws on a singular
 * one, which no camera's view-projection is.
 */
export function inverse(m: Float32Array): Float32Array {
  const at = (column: number, row: number): number => m[column * 4 + row] ?? 0;
  /** The determinant of the 3×3 left once `column` and `row` are struck. */
  const minor = (column: number, row: number): number => {
    const columns = [0, 1, 2, 3].filter((c) => c !== column);
    const rows = [0, 1, 2, 3].filter((r) => r !== row);
    const [c0 = 0, c1 = 0, c2 = 0] = columns;
    const [r0 = 0, r1 = 0, r2 = 0] = rows;
    return (
      at(c0, r0) * (at(c1, r1) * at(c2, r2) - at(c2, r1) * at(c1, r2)) -
      at(c1, r0) * (at(c0, r1) * at(c2, r2) - at(c2, r1) * at(c0, r2)) +
      at(c2, r0) * (at(c0, r1) * at(c1, r2) - at(c1, r1) * at(c0, r2))
    );
  };
  const cofactor = (column: number, row: number): number =>
    ((column + row) % 2 === 0 ? 1 : -1) * minor(column, row);
  let determinant = 0;
  for (let column = 0; column < 4; column += 1) {
    determinant += at(column, 0) * cofactor(column, 0);
  }
  if (Math.abs(determinant) < 1e-30) {
    throw new Error('A singular matrix has no inverse');
  }
  const out = new Float32Array(16);
  // The inverse is the adjugate, the cofactors transposed, over the determinant.
  for (let column = 0; column < 4; column += 1) {
    for (let row = 0; row < 4; row += 1) {
      out[column * 4 + row] = cofactor(row, column) / determinant;
    }
  }
  return out;
}
