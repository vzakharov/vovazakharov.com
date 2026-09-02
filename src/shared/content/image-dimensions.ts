import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_DIR } from './collections';

export type Sized = {
  width: number;
  height: number;
};

/**
 * Absent wherever the Open Graph card falls back to the site avatar, whose size
 * the config already states.
 */
export type WithOptionalOgImageSize = { ogImageSize?: Sized };

/** IHDR is the first chunk: 8-byte signature, 4-byte length, 4-byte type. */
function pngDimensions(file: Buffer): Sized {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
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
 * Reads the file's own header, so no image library is needed for the two formats
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

  return undefined;
}
