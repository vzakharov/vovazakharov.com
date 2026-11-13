import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hashOf, mix32, unitOf } from './hash32';
import { HASH } from './wgsl-hash';

describe('the hash twin', () => {
  it('uses the constants the WGSL does', () => {
    for (const constant of ['0x7feb352du', '0x846ca68bu', '0x9e3779b9u']) {
      assert.ok(HASH.listing.includes(constant), constant);
    }
  });

  it('gives the words an independent implementation of the WGSL gives', () => {
    assert.equal(mix32(0), 0);
    assert.equal(mix32(1), 0x68_89_90_c0);
    assert.equal(mix32(12_345), 0x91_2e_fc_f7);
    assert.equal(mix32(0xff_ff_ff_ff), 0x67_68_82_4a);
  });

  it('keeps every word an unsigned 32-bit one', () => {
    for (let n = 0; n < 1000; n += 1) {
      const word = hashOf(n * 2_654_435_761, n);
      assert.ok(Number.isInteger(word) && word >= 0 && word < 2 ** 32);
      const unit = unitOf(word);
      assert.ok(unit >= 0 && unit < 1);
    }
  });

  it('spreads words evenly: ten thousand draws fill ten bins alike', () => {
    const bins = Array.from({ length: 10 }, () => 0);
    for (let n = 0; n < 10_000; n += 1) {
      const at = Math.floor(unitOf(hashOf(7, n)) * 10);
      bins[at] = (bins[at] ?? 0) + 1;
    }
    for (const count of bins)
      assert.ok(count > 850 && count < 1150, `${count}`);
  });
});
