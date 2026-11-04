import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { occasionStamp } from './occasion.ts';

describe('occasionStamp', () => {
  it('prints the day before the month', () => {
    assert.equal(occasionStamp(new Date('2026-11-19')), '19.11');
  });

  it('pads a single-digit day', () => {
    assert.equal(occasionStamp(new Date('2026-12-01')), '01.12');
  });
});
