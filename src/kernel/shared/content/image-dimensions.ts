import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import type { Sized } from '@/shared/typings';

import { PUBLIC_DIR } from './collections';

/**
 * Absent wherever the Open Graph card falls back to the site avatar, whose size
 * the config already states.
 */
export type WithOptionalOgImageSize = { ogImageSize?: Sized };

/** IHDR is the first chunk: 8-byte signature, 4-byte length, 4-byte type. */
function pngDimensions(file: Buffer): Sized {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

/**
 * A JPEG states its size in a start-of-frame segment, which sits after however
 * many metadata segments the encoder wrote — so the size is reached by walking
 * the segment chain rather than by an offset. `0xFFC4`, `0xC8` and `0xCC` are
 * Huffman and arithmetic tables, which share the SOF range without being one.
 */
function jpegDimensions(file: Buffer): Sized | undefined {
  let offset = 2;

  while (offset + 9 < file.length) {
    if (file[offset] !== 0xff) return undefined;

    const marker = file[offset + 1] ?? 0;

    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      return {
        height: file.readUInt16BE(offset + 5),
        width: file.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + file.readUInt16BE(offset + 2);
  }

  return undefined;
}

/** Only the ratio matters — the attributes reserve space, CSS sets the size. */
function svgDimensions(file: Buffer): Sized | undefined {
  const head = file.subarray(0, 2048).toString('utf8');
  const viewBox =
    /viewbox\s*=\s*["']\s*(?:[\d.-]+[\s,]+){2}([\d.]+)[\s,]+([\d.]+)/i.exec(
      head,
    );

  if (viewBox) {
    return {
      width: Math.round(Number(viewBox[1])),
      height: Math.round(Number(viewBox[2])),
    };
  }

  const width = /\bwidth\s*=\s*["']([\d.]+)(?:px)?["']/i.exec(head);
  const height = /\bheight\s*=\s*["']([\d.]+)(?:px)?["']/i.exec(head);

  return width && height
    ? {
        width: Math.round(Number(width[1])),
        height: Math.round(Number(height[1])),
      }
    : undefined;
}

/**
 * Reads the file's own header, so no image library is needed for the formats
 * the content uses. Throws on a `src` that resolves to nothing, so a broken
 * reference fails the build instead of reaching a reader.
 */
export function intrinsicDimensions(src: string): Sized | undefined {
  const filePath = path.join(PUBLIC_DIR, src);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Content image not found: ${src} (looked in ${filePath}). ` +
        `Check the reference in the markdown, or add the file under public/.`,
    );
  }

  const file = fs.readFileSync(filePath);
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.png') return pngDimensions(file);
  if (extension === '.svg') return svgDimensions(file);
  if (extension === '.jpg' || extension === '.jpeg') {
    return jpegDimensions(file);
  }

  return undefined;
}
