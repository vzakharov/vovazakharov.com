import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  lengthLabel,
  rounded,
  roundLength,
  sidesPerMetre,
  visitorMetres,
} from './scale';

describe('the poster’s scale', () => {
  it('halves the visitor floor by floor from 1.6 m', () => {
    assert.equal(visitorMetres(1), 1.6);
    assert.equal(visitorMetres(2), 0.8);
    assert.equal(visitorMetres(11) * 1024, 1.6);
  });

  it('keeps the visitor the same share of a room side on every floor', () => {
    for (const n of [1, 9, 40, 67]) {
      assert.ok(Math.abs(visitorMetres(n) * sidesPerMetre(n) - 0.32) < 1e-12);
    }
  });

  it('rounds to two significant figures with no trailing zeros', () => {
    assert.equal(rounded(1.6), '1.6');
    assert.equal(rounded(20), '20');
    assert.equal(rounded(781.25), '780');
    assert.equal(rounded(0.0625), '0.063');
  });

  it('writes a length in the largest unit that leaves one of it', () => {
    assert.equal(lengthLabel(1.7), '1.7 M');
    assert.equal(lengthLabel(0.09), '9 CM');
    assert.equal(lengthLabel(0.003), '3 MM');
    assert.equal(lengthLabel(7.6e-7), '760 NM');
    assert.equal(lengthLabel(6.5e-6), '6.5 µM');
    assert.equal(lengthLabel(1.7e-15), '1.7 FM');
    assert.equal(lengthLabel(2.2e-20), '22 ZM');
    assert.equal(lengthLabel(1e-9), '1 NM');
  });

  it('marks a ruler off in the longest round length that fits', () => {
    assert.equal(roundLength(0.6), 0.5);
    assert.equal(roundLength(0.3), 0.2);
    assert.equal(roundLength(0.17), 0.1);
    assert.equal(roundLength(5), 5);
    assert.ok(Math.abs(roundLength(4.4e-9) - 2e-9) < 1e-20);
  });
});
