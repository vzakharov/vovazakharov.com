import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { legendreTable } from './legendre';
import { ringGrid } from './sphere-grid';

const at = (l: number, m: number) => (l * (l + 1)) / 2 + m;

const close = (actual: number, expected: number, what: string) => {
  assert.ok(
    Math.abs(actual - expected) <= 1e-13 * Math.max(1, Math.abs(expected)),
    `${what}: ${actual} vs ${expected}`,
  );
};

describe('legendreTable', () => {
  it('gives the closed forms of the low degrees', () => {
    const pi = Math.PI;
    for (const x of [-0.9, -0.3, 0, 0.42, 0.77, 1]) {
      const s = Math.sqrt(1 - x * x);
      const table = legendreTable(3, x);
      const known: Array<[number, number, number]> = [
        [0, 0, 1 / Math.sqrt(4 * pi)],
        [1, 0, Math.sqrt(3 / (4 * pi)) * x],
        [1, 1, -Math.sqrt(3 / (8 * pi)) * s],
        [2, 0, (Math.sqrt(5 / (4 * pi)) * (3 * x * x - 1)) / 2],
        [2, 1, -Math.sqrt(15 / (8 * pi)) * s * x],
        [2, 2, (Math.sqrt(15 / (2 * pi)) * s * s) / 4],
        [3, 0, (Math.sqrt(7 / (4 * pi)) * (5 * x ** 3 - 3 * x)) / 2],
        [3, 3, (-Math.sqrt(35 / (4 * pi)) * s ** 3) / 4],
      ];
      for (const [l, m, value] of known) {
        close(table[at(l, m)] ?? Number.NaN, value, `P_${l}${m}(${x})`);
      }
    }
  });

  it('is orthonormal under the ring grid’s quadrature', () => {
    const degree = 24;
    const grid = ringGrid(degree);
    const tables = Array.from(grid.x, (x) => legendreTable(degree, x));
    for (let m = 0; m <= degree; m += 5) {
      for (let l = m; l <= degree; l += 1) {
        for (let k = m; k <= degree; k += 1) {
          let sum = 0;
          for (const [ring, table] of tables.entries()) {
            sum +=
              2 *
              Math.PI *
              (grid.weights[ring] ?? 0) *
              (table[at(l, m)] ?? 0) *
              (table[at(k, m)] ?? 0);
          }
          close(sum, l === k ? 1 : 0, `<P_${l}${m}, P_${k}${m}>`);
        }
      }
    }
  });
});
