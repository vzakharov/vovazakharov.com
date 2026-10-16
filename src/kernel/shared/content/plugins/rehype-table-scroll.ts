import 'server-only';

import type { Root } from 'hast';
import type { Plugin } from 'unified';

import { replaceElements } from '../hast-elements';

/**
 * Puts every table in its own scroll container, so one wider than the viewport
 * scrolls inside the column instead of widening the page.
 */
function wrapTables(tree: Root) {
  replaceElements(tree, 'table', (node) => ({
    type: 'element',
    tagName: 'div',
    properties: { className: ['content-table-scroll'] },
    children: [node],
  }));
}

export const rehypeTableScroll: Plugin<[], Root> = () => wrapTables;
