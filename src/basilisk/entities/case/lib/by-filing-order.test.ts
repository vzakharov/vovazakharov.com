import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { byFilingOrder } from './by-filing-order.ts';

const filed = (number: string) => ({
  frontmatter: { case: number, date: new Date('2026-10-02') },
});

describe('byFilingOrder', () => {
  it('lists the last case filed first, past a digit boundary', () => {
    assert.deepEqual(
      [filed('BAS-0002'), filed('BAS-0010'), filed('BAS-0001')]
        .toSorted(byFilingOrder)
        .map(({ frontmatter }) => frontmatter.case),
      ['BAS-0010', 'BAS-0002', 'BAS-0001'],
    );
  });
});
