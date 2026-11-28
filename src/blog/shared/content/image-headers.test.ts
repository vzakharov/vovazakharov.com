import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { headerDimensions } from './image-headers';

/** A RIFF/WEBP container whose first chunk is `encoding` carrying `data`. */
function webp(encoding: string, data: number[]): Buffer {
  const chunk = Buffer.from([...data, ...Array.from({ length: 16 }, () => 0)]);
  const head = Buffer.alloc(20);

  head.write('RIFF', 0, 'ascii');
  head.writeUInt32LE(12 + chunk.length, 4);
  head.write('WEBP', 8, 'ascii');
  head.write(encoding, 12, 'ascii');
  head.writeUInt32LE(chunk.length, 16);

  return Buffer.concat([head, chunk]);
}

describe('headerDimensions, WebP', () => {
  it('reads a lossy VP8 keyframe, dropping the scale bits', () => {
    // Frame tag, start code, then 640 with a scale bit set, then 480.
    const file = webp(
      'VP8 ',
      [0x00, 0x00, 0x00, 0x9d, 0x01, 0x2a, 0x80, 0x42, 0xe0, 0x01],
    );

    assert.deepEqual(headerDimensions(file, '.webp'), {
      width: 640,
      height: 480,
    });
  });

  it('reads a lossless VP8L header', () => {
    // 1400 × 993: (width - 1) in bits 0–13, (height - 1) in bits 14–27.
    const bits = (1400 - 1) | ((993 - 1) << 14);
    const file = webp('VP8L', [
      0x2f,
      bits & 0xff,
      (bits >>> 8) & 0xff,
      (bits >>> 16) & 0xff,
      (bits >>> 24) & 0xff,
    ]);

    assert.deepEqual(headerDimensions(file, '.webp'), {
      width: 1400,
      height: 993,
    });
  });

  it('reads an extended VP8X canvas', () => {
    // Flags (ICC set), reserved, then 24-bit (width - 1) and (height - 1).
    const file = webp(
      'VP8X',
      [0x20, 0x00, 0x00, 0x00, 0x77, 0x05, 0x00, 0xe0, 0x03, 0x00],
    );

    assert.deepEqual(headerDimensions(file, '.webp'), {
      width: 1400,
      height: 993,
    });
  });

  it('reads nothing from a file that is not a WebP', () => {
    assert.equal(headerDimensions(Buffer.alloc(40), '.webp'), undefined);
  });
});
