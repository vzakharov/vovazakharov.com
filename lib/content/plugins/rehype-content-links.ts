import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import {
  VARIANTS,
  type CollectionId,
  type Variant,
  collectionAssetUrl,
  documentRoute,
} from '../collections';

export interface ContentLinksOptions {
  collection: CollectionId;
}

/** `./x`, `../x` and bare `x` — anything that resolves against the document. */
function isRelative(url: string): boolean {
  return !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(url);
}

function stripLeadingDot(url: string): string {
  return url.replace(/^\.\//, '');
}

/**
 * A sibling markdown file becomes the site route that renders it, so the
 * documents' own cross-links between the full, mini and micro cuts work
 * unchanged on GitHub and on the site.
 */
function markdownRoute(collection: CollectionId, target: string): string {
  const stem = target.replace(/\.md$/, '');
  const dotted = stem.lastIndexOf('.');
  const suffix = dotted === -1 ? '' : stem.slice(dotted + 1);
  const isVariant = (VARIANTS as readonly string[]).includes(suffix);

  return documentRoute(
    collection,
    isVariant ? stem.slice(0, dotted) : stem,
    isVariant ? (suffix as Variant) : undefined
  );
}

function rewrite(
  collection: CollectionId,
  url: string
): { href: string; external: boolean } {
  if (!isRelative(url)) {
    return { href: url, external: /^https?:/i.test(url) };
  }

  const target = stripLeadingDot(url);
  const [pathPart, fragment] = target.split(/(?=#)/, 2);

  const href = pathPart.endsWith('.md')
    ? markdownRoute(collection, pathPart)
    : collectionAssetUrl(collection, pathPart);

  return { href: `${href}${fragment ?? ''}`, external: false };
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
export const rehypeContentLinks: Plugin<[ContentLinksOptions], Root> = ({
  collection,
}) => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      const attribute = URL_ATTRIBUTE[node.tagName];
      const value = attribute && node.properties[attribute];

      if (typeof value !== 'string') return;

      const { href, external } = rewrite(collection, value);
      node.properties[attribute] = href;

      if (external && node.tagName === 'a') {
        node.properties.target = '_blank';
        node.properties.rel = 'noopener noreferrer';
      }
    });
  };
};
