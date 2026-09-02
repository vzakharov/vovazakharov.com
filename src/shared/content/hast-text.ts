import 'server-only';

import type { ElementContent, Nodes } from 'hast';

/**
 * Every text descendant of a node, concatenated — a heading's or a link's label.
 *
 * "hast" is the unified ecosystem's name for its HTML syntax tree, the shape
 * every `rehype` plugin operates on (as "mdast" is the markdown one).
 */
export function hastText(node: Nodes | ElementContent): string {
  if (node.type === 'text') return node.value;

  return 'children' in node
    ? node.children.map((child) => hastText(child)).join('')
    : '';
}
