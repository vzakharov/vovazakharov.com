import 'server-only';

import type { Element, ElementContent, Root } from 'hast';
import { SKIP, visit } from 'unist-util-visit';

/** Every `tagName` element in the tree, for a pass that edits them in place. */
export function visitElements(
  tree: Root,
  tagName: string,
  visitor: (node: Element) => void,
): void {
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === tagName) visitor(node);
  });
}

/**
 * Every `tagName` element that sits in a parent, swapped for whatever `replace`
 * returns — `undefined` leaves it where it is. Traversal resumes after the
 * replacement rather than inside it, so a plugin that wraps a node never meets
 * that node again and wraps it twice.
 */
export function replaceElements(
  tree: Root,
  tagName: string,
  replace: (node: Element) => ElementContent | undefined,
): void {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName !== tagName || index === undefined || !parent) return;

    const replacement = replace(node);

    if (replacement === undefined) return;

    parent.children[index] = replacement;

    return [SKIP, index + 1];
  });
}
