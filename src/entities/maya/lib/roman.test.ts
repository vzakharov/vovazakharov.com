import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { roman } from './roman';

describe('roman', () => {
  it('writes the subtractive pairs', () => {
    assert.equal(roman(4), 'IV');
    assert.equal(roman(9), 'IX');
    assert.equal(roman(14), 'XIV');
    assert.equal(roman(40), 'XL');
    assert.equal(roman(1994), 'MCMXCIV');
  });

  it('writes the plain ones', () => {
    assert.equal(roman(1), 'I');
    assert.equal(roman(3), 'III');
    assert.equal(roman(2026), 'MMXXVI');
  });

  it('refuses what has no numeral', () => {
    assert.throws(() => roman(0));
    assert.throws(() => roman(-1));
    assert.throws(() => roman(1.5));
  });
});
