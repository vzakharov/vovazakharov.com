import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';

import type { SiteImage } from '@/shared/config';

type EndMarkOptions = { seal: SiteImage };

function markElement({ path, width, height }: SiteImage): Element {
  return {
    type: 'element',
    tagName: 'img',
    properties: {
      src: path,
      width,
      height,
      alt: '',
      ariaHidden: 'true',
      className: ['content-end-mark'],
    },
    children: [],
  };
}

/**
 * Closes an article with the site's seal, in place of an amen — a centred line
 * of its own below the last block. A plugin rather than markup in the article
 * component because the mark belongs to the compiled HTML: `ArticleBody` takes
 * that HTML and nothing else, and the seal is the resolved site's, which is a
 * thing the pipeline already holds and that slice does not.
 */
export const rehypeEndMark: Plugin<[EndMarkOptions], Root> =
  ({ seal }) =>
  (tree: Root) => {
    tree.children.push({
      type: 'element',
      tagName: 'p',
      properties: { className: ['content-end-mark-line'] },
      children: [markElement(seal)],
    });
  };
