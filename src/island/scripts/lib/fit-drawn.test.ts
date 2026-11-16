import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  decodePinnedRow,
  encodePinnedRow,
  pinnedRow,
  pinnedSeries,
  sphereTransform,
} from '@/island/entities/terrain';

import { drawnField, drawnSeries } from './fit-drawn';

describe("#1's pinned row", () => {
  it('decodes to the fitted coefficients exactly', async () => {
    const row = await pinnedRow('1');
    assert.ok(row, '#1 is pinned');
    const fitted = encodePinnedRow(
      '1',
      drawnSeries(sphereTransform(row.degree), drawnField()),
      row.degree,
      row.bits,
    );
    assert.deepEqual(row, fitted);
    assert.deepEqual(await pinnedSeries('1'), decodePinnedRow(fitted));
  });
});
