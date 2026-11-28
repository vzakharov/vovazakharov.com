import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { maze } from './maze';
import { PORTALS } from './portal-counts';
import { siteAt, siteCount, siteIndex, sitePermutation } from './portals';

const { first, last } = PORTALS;

const floors = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const SEEDS = ['1', '8675309', '42'];

describe('a floor’s sites', () => {
  it('number every partition of level 2 and up once', () => {
    for (const n of floors(first, 8)) {
      const seen = new Set<string>();
      for (let index = 0n; index < siteCount(n); index += 1n) {
        const site = siteAt(n, index);
        assert.ok(site.level >= 2 && site.level < n);
        assert.equal(siteIndex(site), index);
        seen.add(`${site.level}/${site.x}/${site.y}/${site.arm}`);
      }
      assert.equal(BigInt(seen.size), siteCount(n));
      assert.throws(() => siteAt(n, siteCount(n)), RangeError);
    }
  });

  it('round-trip on the last floor', () => {
    for (const index of [
      0n,
      12_345n,
      siteCount(last) / 3n,
      siteCount(last) - 1n,
    ]) {
      assert.equal(siteIndex(siteAt(last, index)), index);
    }
  });

  for (const seed of SEEDS) {
    it(`seed ${seed}: the permutation is a bijection on floors 6–8`, () => {
      const rolled = maze(seed);
      for (const n of floors(first, 8)) {
        const { size, forward, inverse } = sitePermutation(rolled, n);
        assert.equal(size, siteCount(n));
        const images = new Set<bigint>();
        for (let index = 0n; index < size; index += 1n) {
          const image = forward(index);
          assert.ok(image >= 0n && image < size);
          assert.equal(inverse(image), index);
          images.add(image);
        }
        assert.equal(BigInt(images.size), size);
      }
    });
  }

  it('the permutation inverts on deep floors', () => {
    const rolled = maze('20261114');
    for (const n of [40, 65, last]) {
      const { size, forward, inverse } = sitePermutation(rolled, n);
      for (const index of [0n, 1n, size / 7n, size / 2n, size - 1n]) {
        assert.equal(inverse(forward(index)), index);
        assert.equal(forward(inverse(index)), index);
      }
    }
  });

  it('differs between worlds', () => {
    const images = SEEDS.map((seed) => {
      const { forward } = sitePermutation(maze(seed), 8);
      return Array.from({ length: 32 }, (_, i) => forward(BigInt(i))).join(',');
    });
    assert.equal(new Set(images).size, SEEDS.length);
  });
});
