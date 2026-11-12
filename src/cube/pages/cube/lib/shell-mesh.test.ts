import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assemble } from '@/cube/shared/lib/wgsl';
import { CUBE_BOX, DOORWAY_BOX, LADDER } from '@/cube/shared/outside';

import { SHELL_KINDS, SHELL_VERTEX_FLOATS, shellVertices } from './shell-mesh';
import { SHELL_SHADER } from './shell-shader';

type Corner = { at: number[]; facing: number[]; kind: string };

const corners = (): Corner[] => {
  const floats = [...shellVertices()];
  return Array.from(
    { length: floats.length / SHELL_VERTEX_FLOATS },
    (_, index) => {
      const vertex = floats.slice(
        index * SHELL_VERTEX_FLOATS,
        (index + 1) * SHELL_VERTEX_FLOATS,
      );
      return {
        at: vertex.slice(0, 3),
        facing: vertex.slice(3, 6),
        kind: SHELL_KINDS[vertex[8] ?? -1] ?? 'none',
      };
    },
  );
};

const MIDDLE = CUBE_BOX.min.map((low, axis) => (low + CUBE_BOX.max[axis]) / 2);

describe('the shell mesh', () => {
  it('is whole triangles of known kinds', () => {
    const all = corners();
    assert.equal(all.length % 3, 0);
    assert.ok(all.every(({ kind }) => kind !== 'none'));
  });

  it("faces every one of the cube's faces outward", () => {
    for (const { at, facing, kind } of corners()) {
      if (kind === 'side' || kind === 'top' || kind === 'underside') {
        const out = at.reduce(
          (sum, value, axis) =>
            sum + (value - (MIDDLE[axis] ?? 0)) * (facing[axis] ?? 0),
          0,
        );
        assert.ok(Math.abs(out - 2.5) < 1e-4, `${kind} ${String(out)}`);
      }
    }
  });

  it('leaves the doorway open in the east side', () => {
    const east = corners().filter(
      ({ kind, facing }) => kind === 'side' && (facing[0] ?? 0) > 0.5,
    );
    const middle = [
      (DOORWAY_BOX.min[1] + DOORWAY_BOX.max[1]) / 2,
      (DOORWAY_BOX.min[2] + DOORWAY_BOX.max[2]) / 2,
    ];
    let area = 0;
    for (let first = 0; first < east.length; first += 6) {
      const rect = east.slice(first, first + 6);
      const [ys, zs] = [1, 2].map((axis) =>
        rect.map(({ at }) => at[axis] ?? 0),
      ) as [number[], number[]];
      const [low, high, north, south] = [
        Math.min(...ys),
        Math.max(...ys),
        Math.min(...zs),
        Math.max(...zs),
      ];
      area += (high - low) * (south - north);
      assert.ok(
        !(
          middle[0] > low &&
          middle[0] < high &&
          middle[1] > north &&
          middle[1] < south
        ),
      );
    }
    const door =
      (DOORWAY_BOX.max[1] - DOORWAY_BOX.min[1]) *
      (DOORWAY_BOX.max[2] - DOORWAY_BOX.min[2]);
    assert.ok(Math.abs(area - (25 - door)) < 1e-3, String(area));
  });

  it('lines the doorway with a reveal facing into the opening', () => {
    const reveal = corners().filter(({ kind }) => kind === 'reveal');
    assert.equal(reveal.length, 18);
    const middle = DOORWAY_BOX.min.map(
      (low, axis) => (low + DOORWAY_BOX.max[axis]) / 2,
    );
    for (const { at, facing } of reveal) {
      const inward = at.reduce(
        (sum, value, axis) =>
          sum + ((middle[axis] ?? 0) - value) * (facing[axis] ?? 0),
        0,
      );
      assert.ok(inward > 0.4);
      assert.ok((at[0] ?? 0) <= CUBE_BOX.max[0] + 1e-6);
    }
  });

  it('builds the ladder as two stiles and a box a rung', () => {
    const count = (kind: string): number =>
      corners().filter((corner) => corner.kind === kind).length;
    assert.equal(count('stile'), 2 * 36);
    assert.equal(count('rung'), LADDER.rungs.length * 36);
  });
});

describe('the shell shader', () => {
  it('is assembled with the seam it draws under', () => {
    const source = assemble([SHELL_SHADER]);
    for (const name of [
      'fn cubeShadow',
      'fn skyRadiance',
      'fn aerial',
      'fn shellFace',
      'fn fragmentMain',
      'fn vertexMain',
    ]) {
      assert.ok(source.includes(name), name);
    }
  });
});
