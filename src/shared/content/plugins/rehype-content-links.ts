import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { getAbsoluteUrl } from '@/shared/config';

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

function rewrite(
  collection: CollectionId,
  tagName: string,
  url: string,
): { href: string; external: boolean } {
  if (!isRelative(url)) {
    return { href: url, external: /^https?:/i.test(url) };
  }

  const target = stripLeadingDot(url);
  const hashAt = target.indexOf('#');
  const pathPart = hashAt === -1 ? target : target.slice(0, hashAt);
  const fragment = hashAt === -1 ? '' : target.slice(hashAt);

  // A sibling document's route is its file name minus the `.md`, cuts
  // included, so the documents' own cross-links resolve the same way every
  // other relative target does — and this plugin never learns what a cut is.
  const path = `${collectionAssetUrl(collection, pathPart.replace(/\.md$/, ''))}${fragment}`;

  // A link is spelled absolutely and a media source is not, because the two
  // travel differently: the printed PDF carries its links out of the browser
  // that resolved them, where a site-root path means the reader's own host —
  // while a source is fetched by the page itself, and an absolute one would
  // cost a preview its images and the dimension pass its file.
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
 * `public/` serves the collection, and marks off-site links safe to open in a
 * new tab. Runs before the media and image plugins, which read the rewritten
 * URLs.
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

      const { href, external } = rewrite(collection, node.tagName, value);
      node.properties[attribute] = href;

      if (external && node.tagName === 'a') {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
    });
  };
};
