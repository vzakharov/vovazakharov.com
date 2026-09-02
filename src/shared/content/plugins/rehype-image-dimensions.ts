import 'server-only';

import type { Element, Root } from 'hast';
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { PUBLIC_DIR } from '../collections';

type Dimensions = {
  width: number;
  height: number;
};

/** IHDR is the first chunk: 8-byte signature, 4-byte length, 4-byte type. */
function pngDimensions(file: Buffer): Dimensions {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

/** Only the ratio matters — the attributes reserve space, CSS sets the size. */
function svgDimensions(file: Buffer): Dimensions | undefined {
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
function intrinsicDimensions(src: string): Dimensions | undefined {
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

/**
 * Reserves each image's layout space before it loads, and defers the ones below
 * the fold. Sizes only images the repo serves — a remote source has no bytes to
 * read at build time — and never overwrites dimensions the author set by hand.
 */
function sizeImages(tree: Root) {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'img') return;

    node.properties.loading ??= 'lazy';
    node.properties.decoding ??= 'async';

    const src = node.properties.src;
    const authored =
      node.properties.width ?? node.properties.height ?? undefined;

    if (
      typeof src !== 'string' ||
      !src.startsWith('/') ||
      authored !== undefined
    )
      return;

    const dimensions = intrinsicDimensions(src);

    if (dimensions) {
      node.properties.width = dimensions.width;
      node.properties.height = dimensions.height;
    }
  });
}

export const rehypeImageDimensions: Plugin<[], Root> = () => sizeImages;
