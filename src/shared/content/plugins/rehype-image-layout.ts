import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * How an author sets an image beside the text rather than across the column:
 *
 * ```markdown
 * ![A polar bear, thought of](./assets/polar-bear.jpg 'aside')
 * ```
 *
 * The link title is the marker for the same reason it is on a video link —
 * markdown has nowhere else to put one, and a document still renders as an
 * image on GitHub, where the marker is a tooltip nobody minds.
 */
const ASIDE = 'aside';

function layOutImages(tree: Root) {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName !== 'img' || node.properties.title !== ASIDE) return;

    // Dropped rather than kept: on the site the word is a layout instruction,
    // and a tooltip reading "aside" is the instruction leaking to the reader.
    delete node.properties.title;
    node.properties.className = ['content-image-aside'];
  });
}

export const rehypeImageLayout: Plugin<[], Root> = () => layOutImages;
