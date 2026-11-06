import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Mesh } from './mesh.ts';
import { DEFAULT_PAPER, PAPERS } from './paper.ts';
import { simulator } from './simulator.ts';

/** Two triangles hinged along a–b, the y axis: c to its left, d to its right. */
const kite: Mesh = {
  paper: [
    [0, 0],
    [0, 1],
    [-1, 0.5],
    [1, 0.5],
  ],
  start: [
    [0, 0, 0],
    [0, 1, 0],
    [-1, 0.5, 0],
    [1, 0.5, 0],
  ],
  triangles: [
    [0, 1, 2],
    [1, 0, 3],
  ],
  bars: [
    [0, 1, 1],
    [0, 2, Math.hypot(1, 0.5)],
    [1, 2, Math.hypot(1, 0.5)],
    [0, 3, Math.hypot(1, 0.5)],
    [1, 3, Math.hypot(1, 0.5)],
  ],
  outline: [
    [0, 2],
    [2, 1],
    [1, 3],
    [3, 0],
  ],
  hinges: [
    { a: 0, b: 1, c: 2, d: 3, crease: true, angle: 0, start: 0, rest: 1 },
  ],
  faces: [
    { order: 0, plane: 0, facing: 1 },
    { order: 0, plane: 0, facing: 1 },
  ],
  sheets: Array.from({ length: 4 }, () => [{ order: 0, plane: 0 }]),
};
// A thick sheet, so a step may move far and the tests stay short.
const base = PAPERS[DEFAULT_PAPER];
const paper = { ...base, thickness: base.side / 50 };
const QUARTER = Math.PI / 2;

describe('simulator', () => {
  it('ramps a hinge to its goal and settles there', () => {
    const sim = simulator(kite, paper);
    const run = sim.phase([QUARTER], 200, 20_000, 1e-6);
    assert.equal(run.settled, true);
    assert.ok(Math.abs((sim.tracked[0] ?? 0) - QUARTER) < 1e-3);
    assert.ok(sim.strain() < 1e-3);
  });

  it('reports a phase stopped at its cap as unsettled', () => {
    const run = simulator(kite, paper).phase([QUARTER], 200, 10, 1e-6);
    assert.deepEqual([run.iterations, run.settled], [10, false]);
  });

  it('keeps its state from one phase to the next', () => {
    const sim = simulator(kite, paper);
    const first = sim.phase([QUARTER], 200, 20_000, 1e-6);
    const again = sim.phase([QUARTER], 1, 20_000, 1e-6);
    assert.equal(again.settled, true);
    assert.ok(again.iterations < first.iterations / 10);
    assert.ok(Math.abs((sim.tracked[0] ?? 0) - QUARTER) < 1e-3);
  });

  it('pulls a guided vertex to its target', () => {
    const sim = simulator(kite, paper);
    // Toward c turned a quarter about the hinge, which keeps every bar its
    // length.
    sim.guide({
      mask: Uint8Array.from([0, 0, 1, 0]),
      target: (_, share, out) => {
        out[0] = share - 1;
        out[1] = 0.5;
        out[2] = share;
      },
      k: 50,
      until: 4000,
    });
    const run = sim.phase([0], 2000, 4000, 1e-6);
    assert.equal(run.settled, false);
    const away = Math.hypot(
      sim.x[6] ?? 0,
      (sim.x[7] ?? 0) - 0.5,
      (sim.x[8] ?? 0) - 1,
    );
    assert.ok(away < 0.1, `c is ${away} from its target`);
  });
});
