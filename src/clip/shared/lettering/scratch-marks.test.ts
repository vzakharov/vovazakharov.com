import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { layOut } from './layout';
import { pressureAt, ribbon, scratchesOf, stretchOf } from './scratch-marks';

describe('scratchesOf', () => {
  const layout = layOut('ХОРОШО', { letterHeight: 100 });

  it('goes over every stroke three or four times, one pass fresh', () => {
    const scratches = scratchesOf(layout, 100, 3);
    assert.equal(scratches.length, layout.strokes.length);
    for (const { passes } of scratches) {
      assert.ok(passes.length === 3 || passes.length === 4);
      assert.equal(passes.filter(({ stillWet }) => stillWet).length, 1);
    }
  });

  it('is fixed by its seed', () => {
    assert.deepEqual(scratchesOf(layout, 100, 3), scratchesOf(layout, 100, 3));
    assert.notDeepEqual(
      scratchesOf(layout, 100, 3),
      scratchesOf(layout, 100, 4),
    );
  });

  it('drips only from near-vertical strokes', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      for (const [n, { drip }] of scratchesOf(layout, 100, seed).entries()) {
        if (!drip) continue;
        const points = layout.strokes[n]?.points ?? [];
        const [[ax, ay] = [0, 0]] = points;
        const [bx, by] = points.at(-1) ?? [ax, ay];
        assert.ok(Math.abs(by - ay) > 2 * Math.abs(bx - ax));
      }
    }
  });
});

describe('stretchOf', () => {
  const line = [
    [0, 0],
    [100, 0],
  ] as const;

  it('cuts a stretch out of the middle', () => {
    assert.deepEqual(stretchOf(line, 20, 70), [
      [20, 0],
      [70, 0],
    ]);
  });

  it('runs on straight past either end', () => {
    assert.deepEqual(stretchOf(line, -10, 115), [
      [-10, 0],
      [0, 0],
      [100, 0],
      [115, 0],
    ]);
  });
});

describe('pressureAt', () => {
  it('tapers to its thinnest at both ends and at the tip being written', () => {
    const middle = pressureAt(1, 50, 100, 100, 100);
    for (const thin of [
      pressureAt(1, 0, 100, 100, 100),
      pressureAt(1, 100, 100, 100, 100),
      pressureAt(1, 40, 100, 40, 100),
    ]) {
      assert.ok(thin < middle);
      assert.ok(thin > 0);
    }
  });

  it('stays in (0, 1]', () => {
    for (let along = 0; along <= 300; along += 7) {
      const p = pressureAt(9, along, 300, 300, 100);
      assert.ok(p > 0 && p <= 1);
    }
  });
});

describe('ribbon', () => {
  it('outlines a line at the width it is given, up one side and back the other', () => {
    const outline = ribbon(
      [
        [0, 0],
        [10, 0],
      ],
      () => 2,
    );
    assert.deepEqual(outline, [
      [0, 2],
      [10, 2],
      [10, -2],
      [0, -2],
    ]);
  });
});
