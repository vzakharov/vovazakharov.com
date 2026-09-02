import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { intrinsicDimensions } from '../image-dimensions';

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
