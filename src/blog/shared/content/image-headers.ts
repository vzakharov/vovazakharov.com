// No `server-only`: pure functions over a file's bytes, which a test runs
// outside any bundler. `image-dimensions.ts` is the build's fenced entry.
import type { Sized } from '@/kernel/shared/typings';

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
 * A WebP is a RIFF file whose first chunk, at byte 12, names its encoding:
 * `VP8 ` (lossy) states its size in the keyframe header, `VP8L` (lossless)
 * packs it into 14-bit fields after a signature byte, and `VP8X` (extended —
 * an ICC profile, alpha or animation) states the canvas as 24-bit
 * little-endian values one less than the size. Each data starts at byte 20.
 */
function webpDimensions(file: Buffer): Sized | undefined {
  if (file.length < 30) return undefined;
  if (file.toString('ascii', 0, 4) !== 'RIFF') return undefined;
  if (file.toString('ascii', 8, 12) !== 'WEBP') return undefined;

  const encoding = file.toString('ascii', 12, 16);

  if (encoding === 'VP8 ') {
    return {
      width: file.readUInt16LE(26) & 0x3f_ff,
      height: file.readUInt16LE(28) & 0x3f_ff,
    };
  }

  if (encoding === 'VP8L') {
    const bits = file.readUInt32LE(21);

    return {
      width: (bits & 0x3f_ff) + 1,
      height: ((bits >>> 14) & 0x3f_ff) + 1,
    };
  }

  if (encoding === 'VP8X') {
    return {
      width: file.readUIntLE(24, 3) + 1,
      height: file.readUIntLE(27, 3) + 1,
    };
  }

  return undefined;
}

/** The size a file's header states, for the formats the content uses. */
export function headerDimensions(
  file: Buffer,
  extension: string,
): Sized | undefined {
  if (extension === '.png') return pngDimensions(file);
  if (extension === '.svg') return svgDimensions(file);
  if (extension === '.webp') return webpDimensions(file);
  if (extension === '.jpg' || extension === '.jpeg') {
    return jpegDimensions(file);
  }

  return undefined;
}
