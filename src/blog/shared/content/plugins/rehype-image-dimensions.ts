import 'server-only';

import type { Root } from 'hast';
import type { Plugin } from 'unified';

import { visitElements } from '../hast-elements';
import { intrinsicDimensions } from '../image-dimensions';

/**
 * Reserves each image's layout space before it loads, and defers the ones below
 * the fold. Sizes only images the repo serves — a remote source has no bytes to
 * read at build time — and never overwrites dimensions the author set by hand.
 */
function sizeImages(tree: Root) {
  visitElements(tree, 'img', (node) => {
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
