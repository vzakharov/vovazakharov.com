import 'server-only';

import type { ElementContent, Node, Parent } from 'hast';

/**
 * Every text descendant of a node, concatenated — a heading's or a link's label.
 *
 * "hast" is the unified ecosystem's name for its HTML syntax tree, the shape
 * every `rehype` plugin operates on (as "mdast" is the markdown one).
 */
export function hastText(node: Node | ElementContent): string {
  if (node.type === 'text') return (node as { value: string }).value;

  const children = (node as Parent).children;

  return Array.isArray(children) ? children.map(hastText).join('') : '';
}
