import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { getAbsoluteUrl, isOffSite } from '@/shared/config';

import { resolveAuthoredPath, type WithCollectionId } from '../collections';

/** `./x`, `../x` and bare `x` — anything that resolves against the document. */
function isRelative(url: string): boolean {
  return !/^(?:[a-z][\d+.a-z-]*:|\/\/|\/|#)/i.test(url);
}

type LinkContext = WithCollectionId & {
  /** The file the links are written in, relative to the collection's directory. */
  fileName: string;
};

function rewrite(
  { collection, fileName }: LinkContext,
  tagName: string,
  url: string,
): { href: string; external: boolean } {
  if (!isRelative(url)) {
    return { href: url, external: isOffSite(url) };
  }

  const hashAt = url.indexOf('#');
  const pathPart = hashAt === -1 ? url : url.slice(0, hashAt);
  const fragment = hashAt === -1 ? '' : url.slice(hashAt);
  const path = `${resolveAuthoredPath(collection, fileName, pathPart)}${fragment}`;

  // A link is absolute and a source is not, because they travel differently: a
  // link leaves in the printed PDF, where a site-root path would mean whatever
  // host opened it, while a source is fetched by the page itself — and an
  // absolute one would cost a local preview its images.
  return {
    href: tagName === 'a' ? getAbsoluteUrl(path) : path,
    external: false,
  };
}

const URL_ATTRIBUTE: Record<string, 'href' | 'src'> = {
  a: 'href',
  img: 'src',
  video: 'src',
  source: 'src',
};

/**
 * Resolves the documents' relative links and media sources against where
 * `public/` serves the file they are written in, and marks off-site links safe
 * to open in a new tab. Runs before the media and image plugins, which read the
 * rewritten URLs.
 */
export const rehypeContentLinks: Plugin<[LinkContext], Root> = (context) => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      const attribute = URL_ATTRIBUTE[node.tagName];

      if (attribute === undefined) return;

      const value = node.properties[attribute];

      if (typeof value !== 'string') return;

      const { href, external } = rewrite(context, node.tagName, value);
      node.properties[attribute] = href;

      if (external && node.tagName === 'a') {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    });
  };
};
