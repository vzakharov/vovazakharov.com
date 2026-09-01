import 'server-only';

import type { ElementContent, Node, Parent } from 'hast';

/** Every text descendant of a node, concatenated — a heading's or a link's label. */
export function hastText(node: Node | ElementContent): string {
  if (node.type === 'text') return (node as { value: string }).value;

  const children = (node as Parent).children;

  return Array.isArray(children) ? children.map(hastText).join('') : '';
}
