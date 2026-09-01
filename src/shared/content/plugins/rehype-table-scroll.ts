import 'server-only';

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Puts every table in its own scroll container, so one wider than the viewport
 * scrolls inside the column instead of widening the page.
 */
export const rehypeTableScroll: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'table' || index === undefined || !parent) return;

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['content-table-scroll'] },
        children: [node],
      };

      // Skip the wrapper so the table it now holds is not wrapped again.
      return index + 1;
    });
  };
};
