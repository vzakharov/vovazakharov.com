import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { decodeNormal, decodeUniform, inverseNormal } from './decode';

const LAST = 2 ** 32 - 1;

/** Words spread over the whole range, both ends included. */
const SAMPLED = [
  0,
  1,
  2,
  3,
  1000,
  123_456_789,
  2 ** 31 - 1,
  2 ** 31,
  3_000_000_000,
  LAST - 1000,
  LAST - 1,
  LAST,
  ...Array.from({ length: 200 }, (_, k) =>
    Math.floor(((k + 0.37) / 200) * LAST),
  ),
];

describe('inverseNormal', () => {
  it("matches Python's statistics.NormalDist().inv_cdf to the bit", () => {
    const pinned: Array<[number, number]> = [
      [0.025, -1.959_963_984_540_053_8],
      [0.975, 1.959_963_984_540_053_6],
      [0.3, -0.524_400_512_708_040_7],
      [0.001, -3.090_232_306_167_813],
      [1e-10, -6.361_340_902_404_056],
      [0.07, -1.475_791_028_179_170_2],
      [0.5 / 2 ** 32, -6.337_957_754_553_789],
    ];
    for (const [p, z] of pinned) assert.equal(inverseNormal(p), z, `p = ${p}`);
  });
});

describe('decodeUniform', () => {
  it('reads the middle of each slot', () => {
    assert.equal(decodeUniform(0, 0, 2 ** 32), 0.5);
    assert.equal(decodeUniform(LAST, -1, 1), 1 - 1 / 2 ** 32);
  });
});

describe('decodeNormal', () => {
  it('is antisymmetric about the middle word', () => {
    for (const word of SAMPLED) {
      assert.equal(decodeNormal(word), -decodeNormal(LAST - word));
    }
  });

  it('rises strictly through both tails', () => {
    for (const start of [0, 2 ** 31 - 5000, LAST - 5000]) {
      let previous = decodeNormal(start);
      for (
        let word = start + 1;
        word <= Math.min(LAST, start + 10_000);
        word += 1
      ) {
        const z = decodeNormal(word);
        assert.ok(z > previous, `word ${word}`);
        previous = z;
      }
    }
    assert.ok(decodeNormal(0) < -6.3 && decodeNormal(LAST) > 6.3);
  });
});
