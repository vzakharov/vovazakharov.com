import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { PAPERS } from './paper.ts';
import { physics } from './physics.ts';

const kami = PAPERS['kami-15'];

const bookFold = {
  line: { p: [0.5, 0], q: [0.5, 1] },
  moving: [0.9, 0.5],
  direction: 'valley',
} as const;

describe('physics', () => {
  it('measures a book fold as one layer bent across the whole sheet', () => {
    const report = physics([bookFold], kami).at(0);
    assert.ok(report);
    assert.equal(report.bent, 1);
    assert.equal(report.stack, 2);
    assert.ok(Math.abs(report.width - kami.side) < 1e-6);
    assert.ok(Math.abs(report.creep - Math.PI * kami.thickness) < 1e-9);
    assert.deepEqual(report.findings, []);
  });

  it('bends every layer of a stack folded again', () => {
    const reports = physics(
      [
        bookFold,
        {
          line: { p: [0, 0.5], q: [1, 0.5] },
          moving: [0.25, 0.9],
          direction: 'valley',
        },
      ],
      kami,
    );
    const second = reports.at(1);
    assert.ok(second);
    assert.equal(second.bent, 2);
    assert.equal(second.stack, 4);
  });

  it('reads a kite fold through the corner as a tip of its full angle', () => {
    const ray = (deg: number) => ({
      p: [0, 0] as const,
      q: [
        Math.cos((deg * Math.PI) / 180),
        Math.sin((deg * Math.PI) / 180),
      ] as const,
    });
    const reports = physics(
      [
        { line: ray(22.5), moving: [0.9, 0.05], direction: 'valley' },
        { line: ray(67.5), moving: [0.05, 0.9], direction: 'valley' },
      ],
      kami,
    );
    const kite = reports.at(1);
    assert.ok(kite);
    assert.ok(Math.abs((kite.tip?.degrees ?? 0) - 45) < 1e-6);
  });
});
