import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { PUBLIC_DIR } from '../collections';

interface Dimensions {
  width: number;
  height: number;
}

/** IHDR is the first chunk: 8-byte signature, 4-byte length, 4-byte type. */
function pngDimensions(file: Buffer): Dimensions {
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

function svgDimensions(file: Buffer): Dimensions | undefined {
  const head = file.subarray(0, 2048).toString('utf8');
  const viewBox = head.match(
    /viewBox\s*=\s*["']\s*[-\d.]+[,\s]+[-\d.]+[,\s]+([\d.]+)[,\s]+([\d.]+)/i
  );

  if (viewBox) {
    return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  }

  const width = head.match(/\bwidth\s*=\s*["']([\d.]+)(?:px)?["']/i);
  const height = head.match(/\bheight\s*=\s*["']([\d.]+)(?:px)?["']/i);

  return width && height
    ? { width: Number(width[1]), height: Number(height[1]) }
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
        `Check the reference in the markdown, or add the file under public/.`
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
export const rehypeImageDimensions: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'img') return;

      node.properties.loading ??= 'lazy';
      node.properties.decoding ??= 'async';

      const src = node.properties.src;
      const authored = node.properties.width ?? node.properties.height;

      if (typeof src !== 'string' || !src.startsWith('/') || authored) return;

      const dimensions = intrinsicDimensions(src);

      if (dimensions) {
        node.properties.width = dimensions.width;
        node.properties.height = dimensions.height;
      }
    });
  };
};
