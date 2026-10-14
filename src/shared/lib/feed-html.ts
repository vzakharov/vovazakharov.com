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

/** A link a heading wraps its own text in, to its own anchor, so the page can hand it out. */
function isSelfLink(node: Element, parent: Element): boolean {
  return (
    node.tagName === 'a' &&
    /^h[1-6]$/.test(parent.tagName) &&
    typeof parent.properties['id'] === 'string' &&
    node.properties['href'] === `#${parent.properties['id']}`
  );
}

/**
 * A rendered body as the HTML a feed reader shows. A reader resolves nothing
 * against the site, so every site-root URL is made absolute; an element the
 * page hides from assistive tech is one it draws twice — a pull quote, the
 * seal — which a reader would show twice; and a heading's link to itself would
 * show every heading as a link.
 */
export function feedHtml(
  tree: Root,
  siteUrl: (path: string) => string,
): string {
  const copy = structuredClone(tree);
  const absolute = (url: string) =>
    url.startsWith('/') && !url.startsWith('//') ? siteUrl(url) : url;

  visit(copy, 'element', (node: Element, index, parent) => {
    const { properties, children } = node;

    if (properties['ariaHidden'] === 'true' && parent && index !== undefined) {
      parent.children.splice(index, 1);

      return [SKIP, index];
    }

    if (
      parent?.type === 'element' &&
      index !== undefined &&
      isSelfLink(node, parent)
    ) {
      parent.children.splice(index, 1, ...children);

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
