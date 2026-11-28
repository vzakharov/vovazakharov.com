import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { wav } from './wav';

describe('wav', () => {
  const left = new Float32Array([0, 1, -1]);
  const right = new Float32Array([0.5, 2, -0.5]);
  const file = wav({ sampleRate: 8000, channels: [left, right] });
  const view = new DataView(file.buffer);
  const text = (at: number) =>
    String.fromCodePoint(...file.subarray(at, at + 4));

  it('writes a RIFF header naming the format, rate and size', () => {
    assert.equal(text(0), 'RIFF');
    assert.equal(text(8), 'WAVE');
    assert.equal(text(36), 'data');
    assert.equal(view.getUint16(22, true), 2);
    assert.equal(view.getUint32(24, true), 8000);
    assert.equal(view.getUint32(40, true), 3 * 2 * 2);
    assert.equal(view.getUint32(4, true), file.length - 8);
  });

  it('interleaves the channels as 16-bit samples, clipped to full scale', () => {
    assert.deepEqual(
      [0, 1, 2, 3, 4, 5].map((n) => view.getInt16(44 + n * 2, true)),
      [0, 16_384, 32_767, 32_767, -32_767, -16_383],
    );
  });
});
