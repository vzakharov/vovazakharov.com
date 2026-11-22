import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Vec3 } from '@/island/shared/globe';

import { anchorOf, LAND_OCTAVES, LATTICE_WRAP } from './land-octaves';

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

describe('LAND_OCTAVES', () => {
  it('turns every lattice by a rotation', () => {
    for (const { rows } of LAND_OCTAVES) {
      for (const [i, a] of rows.entries()) {
        for (const [j, b] of rows.entries()) {
          assert.ok(Math.abs(dot(a, b) - (i === j ? 1 : 0)) < 1e-12);
        }
      }
    }
  });

  it('runs coarsest first, no cell a whole multiple of a finer one', () => {
    for (const [i, { cell }] of LAND_OCTAVES.entries()) {
      for (const finer of LAND_OCTAVES.slice(i + 1)) {
        const ratio = cell / finer.cell;
        assert.ok(ratio > 1);
        assert.ok(Math.abs(ratio - Math.round(ratio)) > 0.02);
      }
    }
  });
});

describe('anchorOf', () => {
  const eye: Vec3 = [6_371_002.3, -2_113_456.7, 512_345.6];

  it('stays inside the wrap', () => {
    for (const octave of LAND_OCTAVES) {
      for (const cells of anchorOf(eye, octave)) {
        assert.ok(cells >= 0 && cells < LATTICE_WRAP);
      }
    }
  });

  it('moves by a step in cells as the eye steps in metres, exactly', () => {
    const step: Vec3 = [0.25, 0, 0];
    for (const octave of LAND_OCTAVES) {
      const from = anchorOf(eye, octave);
      const to = anchorOf([eye[0] + step[0], eye[1], eye[2]], octave);
      for (const [axis, row] of octave.rows.entries()) {
        const moved = (to[axis] ?? 0) - (from[axis] ?? 0);
        const expected = dot(row, step) / octave.cell;
        const off = Math.abs(moved - expected) % LATTICE_WRAP;
        assert.ok(Math.min(off, LATTICE_WRAP - off) < 1e-6);
      }
    }
  });
});
