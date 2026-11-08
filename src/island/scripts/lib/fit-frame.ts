import { crc32, deflateSync } from 'node:zlib';

import type { Coast } from '@/island/shared/globe';

import type { PlaneGrid } from './fit-grid';

/** An RGB raster, row 0 at the top. */
export type Raster = { width: number; height: number; rgb: Uint8Array };

function chunk(type: string, data: Uint8Array): Buffer {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(data.length, 0);
  head.write(type, 4, 'latin1');
  const tail = Buffer.alloc(4);
  tail.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])), 0);
  return Buffer.concat([head, data, tail]);
}

/** `raster` as an 8-bit RGB PNG file. */
export function encodePng({ width, height, rgb }: Raster): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const rows = Buffer.alloc(height * (1 + 3 * width));
  for (let y = 0; y < height; y += 1) {
    const from = y * 3 * width;
    rows.set(rgb.subarray(from, from + 3 * width), y * (1 + 3 * width) + 1);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows)),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

const COLOURS = {
  land: [222, 200, 150],
  sea: [200, 222, 240],
  lake: [70, 120, 200],
  added: [225, 30, 30],
  dropped: [140, 0, 40],
  ring: [20, 20, 20],
} as const;

/** What one grid node shows in the fit's frame. */
export type NodeKind = Exclude<keyof typeof COLOURS, 'ring'>;

/**
 * A frame of the grid's nodes `[i0, i1) × [j0, j1)`, `pixels` per node, north
 * up, each node painted by `kindAt` and the rings drawn over it in black.
 */
export function paintFrame({
  grid,
  window: [i0, i1, j0, j1],
  pixels,
  kindAt,
  coast,
}: {
  grid: PlaneGrid;
  window: readonly [number, number, number, number];
  pixels: number;
  kindAt: (node: number) => NodeKind;
  coast: Coast;
}): Raster {
  const width = (i1 - i0) * pixels;
  const height = (j1 - j0) * pixels;
  const rgb = new Uint8Array(3 * width * height);
  const put = (x: number, y: number, colour: readonly number[]) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    rgb.set(colour, 3 * (y * width + x));
  };
  for (let y = 0; y < height; y += 1) {
    const j = j1 - 1 - Math.floor(y / pixels);
    for (let x = 0; x < width; x += 1) {
      const i = i0 + Math.floor(x / pixels);
      put(x, y, COLOURS[kindAt(j * grid.columns + i)]);
    }
  }
  // A node's pixel block spans `[i, i + 1)`, so a plane point maps to the
  // block's centre at the node itself.
  const toPixel = (xKm: number, yKm: number): [number, number] => [
    ((xKm * 1000 - grid.originX) / grid.cellMetres - i0 + 0.5) * pixels,
    (j1 - 0.5 - (yKm * 1000 - grid.originY) / grid.cellMetres) * pixels,
  ];
  for (const ring of coast.rings) {
    for (const [v, point] of ring.entries()) {
      const next = ring[(v + 1) % ring.length] ?? point;
      const [ax, ay] = toPixel(...point);
      const [bx, by] = toPixel(...next);
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay)) + 1;
      for (let s = 0; s <= steps; s += 1) {
        const t = s / steps;
        put(
          Math.floor(ax + (bx - ax) * t),
          Math.floor(ay + (by - ay) * t),
          COLOURS.ring,
        );
      }
    }
  }
  return { width, height, rgb };
}
