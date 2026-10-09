import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import {
  collectionAssetUrl,
  type CollectionId,
  type WithCollectionId,
} from '../collections';

/** `./x`, `../x` and bare `x` — anything that resolves against the document. */
function isRelative(url: string): boolean {
  return !/^(?:[a-z][\d+.a-z-]*:|\/\/|\/|#)/i.test(url);
}

function stripLeadingDot(url: string): string {
  return url.replace(/^\.\//, '');
}

function rewrite(collection: CollectionId, url: string): string {
  if (!isRelative(url)) return url;

  const target = stripLeadingDot(url);
  const hashAt = target.indexOf('#');
  const pathPart = hashAt === -1 ? target : target.slice(0, hashAt);
  const fragment = hashAt === -1 ? '' : target.slice(hashAt);

  // A sibling document's route is its file name minus the `.md`, cuts
  // included, so the documents' own cross-links resolve the same way every
  // other relative target does — and this plugin never learns what a cut is.
  return `${collectionAssetUrl(collection, pathPart.replace(/\.md$/, ''))}${fragment}`;
}

const URL_ATTRIBUTE: Record<string, 'href' | 'src'> = {
  a: 'href',
  img: 'src',
  video: 'src',
  source: 'src',
};

/**
 * Resolves the documents' relative links and media sources to site-root paths,
 * against where `public/` serves the collection. Runs before the media and
 * image plugins, which read the rewritten URLs.
 *
 * A link stays site-root for print too: `ContentLink` gives paper its absolute
 * address, the way every other page of the site does.
 */
export const rehypeContentLinks: Plugin<[WithCollectionId], Root> = ({
  collection,
}) => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      const attribute = URL_ATTRIBUTE[node.tagName];

      if (attribute === undefined) return;

      const value = node.properties[attribute];

      if (typeof value !== 'string') return;

      node.properties[attribute] = rewrite(collection, value);
    });
  };
};
