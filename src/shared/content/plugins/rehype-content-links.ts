import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { resolveAuthoredUrl } from '../collections';
import type { FileInCollection } from '../documents';

const URL_ATTRIBUTE: Record<string, 'href' | 'src'> = {
  a: 'href',
  img: 'src',
  video: 'src',
  source: 'src',
};

/**
 * Resolves the documents' relative links and media sources to site-root paths,
 * against where `public/` serves the file they are written in. Runs before the
 * media and image plugins, which read the rewritten URLs.
 *
 * A link's absolute address, which paper needs, is `ContentLink`'s to give.
 */
export const rehypeContentLinks: Plugin<[FileInCollection], Root> = ({
  collection,
  fileName,
}) => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      const attribute = URL_ATTRIBUTE[node.tagName];

      if (attribute === undefined) return;

      const value = node.properties[attribute];

      if (typeof value !== 'string') return;

      node.properties[attribute] = resolveAuthoredUrl(
        collection,
        fileName,
        value,
      );
    });
  };
};
