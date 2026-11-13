/** Pictures of sound a script draws for an eye to check: PNGs, made here. */
import { crc32, deflateSync } from 'node:zlib';

import type { Sized } from '@/kernel/shared/typings';

import { decibels, type Spectrogram } from './spectrum';

/** An image as rows of RGB bytes. */
type Picture = Sized & { rgb: Uint8Array };

type Colour = readonly [number, number, number];

const picture = (width: number, height: number, [r, g, b]: Colour): Picture => {
  const rgb = new Uint8Array(width * height * 3);
  for (let i = 0; i < rgb.length; i += 3) rgb.set([r, g, b], i);
  return { width, height, rgb };
};

function dot(
  { width, height, rgb }: Picture,
  x: number,
  y: number,
  c: Colour,
): void {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  rgb.set(c, (Math.round(y) * width + Math.round(x)) * 3);
}

function chunk(type: string, data: Uint8Array): Buffer {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const framed = Buffer.alloc(body.length + 8);
  framed.writeUInt32BE(data.length, 0);
  body.copy(framed, 4);
  framed.writeUInt32BE(crc32(body), body.length + 4);
  return framed;
}

/** `picture` as a PNG file's bytes. */
export function pngOf({ width, height, rgb }: Picture): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8);
  const rows = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    rows.set(
      rgb.subarray(y * width * 3, (y + 1) * width * 3),
      y * (width * 3 + 1) + 1,
    );
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

/** From silence (black) through violet and orange to full scale (white). */
const HEAT: readonly Colour[] = [
  [0, 0, 0],
  [40, 10, 90],
  [150, 30, 110],
  [240, 110, 40],
  [255, 230, 120],
  [255, 255, 255],
];

function heat(x: number): Colour {
  const along = Math.min(0.9999, Math.max(0, x)) * (HEAT.length - 1);
  const from = HEAT[Math.floor(along)] ?? HEAT[0];
  const to = HEAT[Math.floor(along) + 1] ?? from;
  const part = along - Math.floor(along);
  const mixed = (n: 0 | 1 | 2): number =>
    Math.round((from?.[n] ?? 0) + part * ((to?.[n] ?? 0) - (from?.[n] ?? 0)));
  return [mixed(0), mixed(1), mixed(2)];
}

/** The lowest pitch a spectrogram's picture shows, and the quietest level. */
const LOWEST = 25;
const QUIETEST = -100;

/**
 * `spectrogram` as a picture `width` by `height`: time left to right, pitch
 * bottom to top on a scale of octaves from `LOWEST` hertz to the top band,
 * level as heat from `QUIETEST` decibels to `loudest`.
 */
export function spectrogramPicture(
  { columns, hzPerBand }: Spectrogram,
  width: number,
  height: number,
  loudest = -20,
): Picture {
  const drawn = picture(width, height, [0, 0, 0]);
  const bands = columns[0]?.length ?? 1;
  const octaves = Math.log2((bands * hzPerBand) / LOWEST);
  for (let x = 0; x < width; x += 1) {
    const from = Math.floor((x * columns.length) / width);
    const to = Math.max(
      from + 1,
      Math.floor(((x + 1) * columns.length) / width),
    );
    for (let y = 0; y < height; y += 1) {
      const hz = (up: number): number =>
        LOWEST * 2 ** ((octaves * (height - y + up)) / height);
      const low = Math.max(1, Math.floor(hz(-1) / hzPerBand));
      const high = Math.max(low + 1, Math.ceil(hz(0) / hzPerBand));
      let power = 0;
      for (let column = from; column < to; column += 1) {
        for (let band = low; band < high; band += 1) {
          power += columns[column]?.[band] ?? 0;
        }
      }
      const level = decibels(power / ((to - from) * (high - low)));
      dot(drawn, x, y, heat((level - QUIETEST) / (loudest - QUIETEST)));
    }
  }
  return drawn;
}

/** One line of a plot: its values left to right, and its colour. */
export type Line = { values: readonly number[]; colour: Colour };

/**
 * `lines` on one picture, each scaled to its own range so their shapes can
 * be laid over one another: what rises with what, and when.
 */
export function plotPicture(
  lines: readonly Line[],
  width: number,
  height: number,
): Picture {
  const drawn = picture(width, height, [16, 16, 20]);
  for (const { values, colour } of lines) {
    const low = Math.min(...values);
    const span = Math.max(...values) - low || 1;
    let before: number | undefined;
    for (let x = 0; x < width; x += 1) {
      const value = values[Math.floor((x * values.length) / width)] ?? low;
      const y = Math.round((height - 4) * (1 - (value - low) / span)) + 2;
      const [top, bottom] =
        before === undefined
          ? [y, y]
          : [Math.min(before, y), Math.max(before, y)];
      for (let at = top; at <= bottom; at += 1) dot(drawn, x, at, colour);
      before = y;
    }
  }
  return drawn;
}
