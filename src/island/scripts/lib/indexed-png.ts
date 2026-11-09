import { crc32, deflateSync } from 'node:zlib';

import type { Sized } from '@/kernel/shared/typings';

/** An image of palette indices, row-major, each below the palette's length. */
export type IndexedImage = Sized & {
  pixels: Uint8Array;
  /** `[r, g, b]` per index, at most 256. */
  palette: ReadonlyArray<readonly [number, number, number]>;
};

const SIGNATURE = Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);

function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(data, 8);
  view.setUint32(8 + data.length, crc32(out.subarray(4, 8 + data.length)));
  return out;
}

/** The least PNG bit depth (1, 2, 4 or 8) that holds `colours` indices. */
const bitDepth = (colours: number) =>
  [1, 2, 4, 8].find((bits) => colours <= 2 ** bits) ?? 8;

/** `image` as an indexed-colour PNG, packed at the least bit depth. */
export function encodeIndexedPng({
  width,
  height,
  pixels,
  palette,
}: IndexedImage): Uint8Array {
  if (palette.length === 0 || palette.length > 256) {
    throw new Error(`A palette holds 1 to 256 colours, not ${palette.length}`);
  }
  if (pixels.length !== width * height) {
    throw new Error(`${pixels.length} pixels for ${width} × ${height}`);
  }
  const bits = bitDepth(palette.length);
  const perByte = 8 / bits;
  const stride = 1 + Math.ceil(width / perByte);
  const raw = new Uint8Array(stride * height);
  for (let y = 0; y < height; y += 1) {
    // Each row opens with filter type 0, none.
    for (let x = 0; x < width; x += 1) {
      const index = pixels[y * width + x] ?? 0;
      const at = y * stride + 1 + Math.floor(x / perByte);
      const shift = 8 - bits * ((x % perByte) + 1);
      raw[at] = (raw[at] ?? 0) | (index << shift);
    }
  }
  const header = new Uint8Array(13);
  const view = new DataView(header.buffer);
  view.setUint32(0, width);
  view.setUint32(4, height);
  header.set([bits, 3, 0, 0, 0], 8);
  return Buffer.concat([
    SIGNATURE,
    chunk('IHDR', header),
    chunk('PLTE', Uint8Array.from(palette.flat())),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ]);
}
