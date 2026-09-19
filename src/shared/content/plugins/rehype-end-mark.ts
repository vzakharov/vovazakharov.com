import 'server-only';

import type { Element, Root, RootContent } from 'hast';
import type { Plugin } from 'unified';

import type { SiteImage } from '@/shared/config';

type EndMarkOptions = { seal: SiteImage };

/** Tag names an end mark may sit inside: a closing sentence, and nothing else. */
const PROSE_TAGS = new Set(['p', 'blockquote']);

/**
 * Whether the mark can ride the document's last line. A paragraph holding
 * nothing but a picture is still a paragraph, and a seal set beside a
 * full-width image reads as part of it — so the test is that the element ends
 * in text, which is the closing punctuation the mark is meant to follow.
 */
function endsInProse(element: Element): boolean {
  return (
    PROSE_TAGS.has(element.tagName) && element.children.at(-1)?.type === 'text'
  );
}

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

/** The document's last element, which is what the mark either joins or follows. */
function lastElement(tree: Root): Element | undefined {
  const last = tree.children.findLast(
    (node: RootContent) => node.type === 'element',
  );

  return last?.type === 'element' ? last : undefined;
}

/**
 * Closes an article with the site's seal, in place of an amen. Inline means
 * inside the compiled HTML — appended to the last paragraph, after its final
 * punctuation — so it is a plugin rather than markup in the article component,
 * where it could only ever reach its own line.
 *
 * A document ending in a list, a table, a fence or a picture has no sentence
 * to follow, so the mark gets a paragraph of its own.
 */
export const rehypeEndMark: Plugin<[EndMarkOptions], Root> =
  ({ seal }) =>
  (tree: Root) => {
    const last = lastElement(tree);
    const mark = markElement(seal);

    if (last && endsInProse(last)) {
      last.children.push(mark);

      return;
    }

    tree.children.push({
      type: 'element',
      tagName: 'p',
      properties: { className: ['content-end-mark-line'] },
      children: [mark],
    });
  };
