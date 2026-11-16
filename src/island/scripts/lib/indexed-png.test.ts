import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { crc32, inflateSync } from 'node:zlib';

import { encodeIndexedPng } from './indexed-png';

/** Each chunk's type and data, its CRC checked. */
function chunks(png: Uint8Array) {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const out: Array<{ type: string; data: Uint8Array }> = [];
  for (let at = 8; at < png.length; ) {
    const length = view.getUint32(at);
    const body = png.subarray(at + 4, at + 8 + length);
    assert.equal(view.getUint32(at + 8 + length), crc32(body));
    out.push({
      type: new TextDecoder().decode(body.subarray(0, 4)),
      data: body.subarray(4),
    });
    at += 12 + length;
  }
  return out;
}

describe('encodeIndexedPng', () => {
  it('packs three colours two bits a pixel, rows filtered with none', () => {
    const png = encodeIndexedPng({
      width: 5,
      height: 2,
      pixels: Uint8Array.of(0, 1, 2, 1, 0, 2, 2, 2, 2, 1),
      palette: [
        [0, 0, 0],
        [255, 0, 0],
        [0, 0, 255],
      ],
    });
    assert.deepEqual(
      [...png.subarray(0, 8)],
      [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    );
    const [ihdr, plte, idat, iend] = chunks(png);
    assert.deepEqual(
      [ihdr?.type, plte?.type, idat?.type, iend?.type],
      ['IHDR', 'PLTE', 'IDAT', 'IEND'],
    );
    assert.deepEqual(
      [...(ihdr?.data ?? [])],
      [0, 0, 0, 5, 0, 0, 0, 2, 2, 3, 0, 0, 0],
    );
    assert.deepEqual([...(plte?.data ?? [])], [0, 0, 0, 255, 0, 0, 0, 0, 255]);
    assert.deepEqual(
      [...inflateSync(idat?.data ?? new Uint8Array(0))],
      [0, 0b0001_1001, 0b0000_0000, 0, 0b1010_1010, 0b0100_0000],
    );
  });

  it('refuses pixels that do not fill the image', () => {
    assert.throws(
      () =>
        encodeIndexedPng({
          width: 2,
          height: 2,
          pixels: new Uint8Array(3),
          palette: [[0, 0, 0]],
        }),
      /3 pixels for 2 × 2/,
    );
  });
});
