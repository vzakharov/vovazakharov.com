import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  decodePinnedRow,
  encodePinnedRow,
  pinnedRow,
  pinnedSeries,
} from './pinned-row';

/** A series up to `degree` whose degrees span many orders of magnitude. */
function falling(degree: number): Float64Array {
  const series = new Float64Array((degree + 1) ** 2);
  for (const [slot] of series.entries()) {
    const l = Math.floor(Math.sqrt(slot));
    series[slot] = Math.sin(slot * 1.7 + 0.3) * 10 ** -l;
  }
  return series;
}

describe('encodePinnedRow / decodePinnedRow', () => {
  it('decodes a quantized series to itself exactly, at any width', () => {
    for (const bits of [2, 3, 7, 8, 11, 16, 23, 32]) {
      const once = decodePinnedRow(encodePinnedRow('5', falling(9), 9, bits));
      const twice = decodePinnedRow(encodePinnedRow('5', once, 9, bits));
      assert.deepEqual(twice, once, `${String(bits)} bits`);
    }
  });

  it('keeps each degree within half a step of its own scale', () => {
    const series = falling(9);
    const row = encodePinnedRow('5', series, 9, 12);
    const decoded = decodePinnedRow(row);
    for (const [slot, value] of series.entries()) {
      const scale = row.scales[Math.floor(Math.sqrt(slot))] ?? 0;
      assert.ok(Math.abs((decoded[slot] ?? 0) - value) <= scale / 2 + 1e-300);
    }
  });

  it('packs the words at exactly `bits` each', () => {
    const row = encodePinnedRow('5', falling(9), 9, 7);
    assert.equal(atob(row.words).length, Math.ceil((100 * 7) / 8));
  });

  it('refuses a row whose words end early or whose scales miscount', () => {
    const row = encodePinnedRow('5', falling(3), 3, 8);
    assert.throws(() => decodePinnedRow({ ...row, words: btoa('ab') }));
    assert.throws(() => decodePinnedRow({ ...row, scales: [1] }));
    assert.throws(() => encodePinnedRow('5', falling(3), 4, 8));
  });
});

describe('pinnedSeries', () => {
  it('reads every unpinned number from the hash', async () => {
    assert.equal(await pinnedSeries('2'), undefined);
  });

  for (const world of ['0', '1']) {
    it(`loads #${world} as a full series of its row`, async () => {
      const series = await pinnedSeries(world);
      const row = await pinnedRow(world);
      assert.ok(series && row);
      assert.equal(row.scales.length, row.degree + 1);
      assert.equal(
        atob(row.words).length,
        Math.ceil((series.length * row.bits) / 8),
      );
      assert.equal(series.length, (row.degree + 1) ** 2);
      assert.ok(series.every((value) => Number.isFinite(value)));
    });
  }

  it('re-encodes #0, whose data is never committed, to its row exactly', async () => {
    const row = await pinnedRow('0');
    assert.ok(row);
    const again = encodePinnedRow(
      '0',
      decodePinnedRow(row),
      row.degree,
      row.bits,
    );
    assert.deepEqual(again, row);
  });
});
