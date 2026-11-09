import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { assertWorldNumber, murmur3, pathHash, worldHash } from './hash';

const bytes = (text: string) => new TextEncoder().encode(text);

describe('murmur3', () => {
  it('matches the reference MurmurHash3_x86_32 vectors', () => {
    assert.equal(murmur3(bytes(''), 0), 0);
    assert.equal(murmur3(bytes(''), 1), 0x51_4e_28_b7);
    assert.equal(murmur3(bytes('hello'), 0), 0x24_8b_fa_47);
    assert.equal(
      murmur3(
        bytes('The quick brown fox jumps over the lazy dog'),
        0x97_47_b2_8c,
      ),
      0x2f_a8_26_cd,
    );
  });
});

describe('worldHash', () => {
  it('gives the pinned words', () => {
    const pinned = {
      '1': [
        0x84_4c_e5_5b, 0xc9_90_e7_cb, 0xba_b0_94_41, 0x8c_0d_ab_a1,
        0x50_59_b8_4d,
      ],
      '2': [
        0x8a_1d_b7_ea, 0xbb_1d_32_71, 0xe6_20_e2_d5, 0x03_5d_f1_13,
        0x51_53_8f_f1,
      ],
      '12345678901234567890123456789': [
        0x51_35_33_ed, 0x60_dc_de_ec, 0x76_d3_a7_5c, 0x6d_4f_6b_23,
        0xc0_3d_bd_f1,
      ],
    };
    for (const [world, words] of Object.entries(pinned)) {
      const hash = worldHash(world);
      assert.deepEqual(
        [0, 1, 5, 66_055, 2 ** 32 - 1].map((i) => hash(i)),
        words,
        world,
      );
    }
  });

  it('is MurmurHash3 of the key words and the counter, little-endian', () => {
    const digits = bytes('42');
    const message = new DataView(new ArrayBuffer(12));
    message.setUint32(0, murmur3(digits, 0x97_47_b2_8c), true);
    message.setUint32(4, murmur3(digits, 0x5b_d1_e9_95), true);
    message.setUint32(8, 777, true);
    assert.equal(
      worldHash('42')(777),
      murmur3(new Uint8Array(message.buffer), 0),
    );
  });

  it('spreads its bits: each output bit set about half the time', () => {
    const hash = worldHash('3');
    const ones = Array.from({ length: 32 }, () => 0);
    const samples = 20_000;
    for (let i = 0; i < samples; i += 1) {
      const word = hash(i);
      for (let b = 0; b < 32; b += 1)
        ones[b] = (ones[b] ?? 0) + ((word >>> b) & 1);
    }
    for (const count of ones) assert.ok(Math.abs(count / samples - 0.5) < 0.02);
  });

  it('takes only non-negative integers without leading zeros', () => {
    for (const bad of ['', '00', '07', '-3', '-0', '1.5', '1e3', ' 2', 'abc']) {
      assert.throws(() => worldHash(bad), /Not a world number/, bad);
      assert.throws(() => pathHash(bad), /Not a world number/, bad);
    }
    assert.doesNotThrow(() => {
      assertWorldNumber('0');
      assertWorldNumber('9'.repeat(500));
    });
  });
});

/** `H(N, path)`'s message: the key words, little-endian, then the path. */
function message(world: string, path: string) {
  const digits = bytes(world);
  const key = new DataView(new ArrayBuffer(8));
  key.setUint32(0, murmur3(digits, 0x97_47_b2_8c), true);
  key.setUint32(4, murmur3(digits, 0x5b_d1_e9_95), true);
  return new Uint8Array([...new Uint8Array(key.buffer), ...bytes(path)]);
}

describe('pathHash', () => {
  it('is MurmurHash3 of the key words and the path’s UTF-8', () => {
    for (const world of ['0', '1', '42', '9'.repeat(40)]) {
      const hash = pathHash(world);
      for (const path of ['', 'a', 'land/sea', 'land/harmonic/37/-12', 'ø/日']) {
        assert.equal(hash(path), murmur3(message(world, path), 0), path);
      }
    }
  });

  it('gives the pinned words', () => {
    assert.deepEqual(
      ['land/sea', 'land/harmonic/1/-1', 'noise/seed'].map(pathHash('0')),
      [0x23_66_57_87, 0x86_32_47_14, 0x0e_b9_43_65],
    );
  });

  it('survives a path longer than its buffer', () => {
    const path = 'x/'.repeat(500);
    assert.equal(pathHash('7')(path), murmur3(message('7', path), 0));
  });
});
