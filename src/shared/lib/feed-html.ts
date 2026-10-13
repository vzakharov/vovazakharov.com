import type { Element, Root } from 'hast';
import { toHtml } from 'hast-util-to-html';
import { CONTINUE, SKIP, visit } from 'unist-util-visit';

const URL_PROPERTIES = ['href', 'src', 'poster'] as const;

/** A comma-separated candidate list, each candidate's URL first. */
function absoluteSrcSet(
  srcSet: string,
  absolute: (path: string) => string,
): string {
  return srcSet
    .split(',')
    .map((candidate) => {
      const [url = '', ...descriptors] = candidate.trim().split(/\s+/);

      return [absolute(url), ...descriptors].join(' ');
    })
    .join(', ');
}

/**
 * A rendered body as the HTML a feed reader shows. A reader resolves nothing
 * against the site, so every site-root URL is made absolute; and an element the
 * page hides from assistive tech is one it draws twice — a pull quote, the
 * seal — which a reader would show twice.
 */
export function feedHtml(
  tree: Root,
  siteUrl: (path: string) => string,
): string {
  const copy = structuredClone(tree);
  const absolute = (url: string) =>
    url.startsWith('/') && !url.startsWith('//') ? siteUrl(url) : url;

  visit(copy, 'element', (node: Element, index, parent) => {
    const { properties } = node;

    if (properties['ariaHidden'] === 'true' && parent && index !== undefined) {
      parent.children.splice(index, 1);

      return [SKIP, index];
    }

    for (const name of URL_PROPERTIES) {
      const value = properties[name];

      if (typeof value === 'string') properties[name] = absolute(value);
    }

    const srcSet = properties['srcSet'];

    if (typeof srcSet === 'string') {
      properties['srcSet'] = absoluteSrcSet(srcSet, absolute);
    }

    return CONTINUE;
  });

  return toHtml(copy);
}
