import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { resolveAuthoredPath } from '../collections';
import type { ProseSource } from '../documents';

/** `./x`, `../x` and bare `x` — anything that resolves against the document. */
function isRelative(url: string): boolean {
  return !/^(?:[a-z][\d+.a-z-]*:|\/\/|\/|#)/i.test(url);
}

/** The collection, and the file inside it that the links are written in. */
type LinkContext = Pick<ProseSource, 'collection' | 'fileName'>;

function rewrite({ collection, fileName }: LinkContext, url: string): string {
  if (!isRelative(url)) return url;

  const hashAt = url.indexOf('#');
  const pathPart = hashAt === -1 ? url : url.slice(0, hashAt);
  const fragment = hashAt === -1 ? '' : url.slice(hashAt);

  return `${resolveAuthoredPath(collection, fileName, pathPart)}${fragment}`;
}

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
export const rehypeContentLinks: Plugin<[LinkContext], Root> = (context) => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      const attribute = URL_ATTRIBUTE[node.tagName];

      if (attribute === undefined) return;

      const value = node.properties[attribute];

      if (typeof value !== 'string') return;

      node.properties[attribute] = rewrite(context, value);
    });
  };
};
