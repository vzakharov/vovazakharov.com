import 'server-only';

import type { Element, ElementContent, Root } from 'hast';
import { SKIP, visit, type VisitorResult } from 'unist-util-visit';

/**
 * Every `tagName` element in the tree. The visitor receives the node's `index`
 * and `parent` and may return a traversal action, so a pass that only edits in
 * place ignores both and a pass that rewrites the tree — `replaceElements` — is
 * built on this rather than restating the element walk.
 */
export function visitElements(
  tree: Root,
  tagName: string,
  visitor: (
    node: Element,
    index: number | undefined,
    parent: Root | Element | undefined,
  ) => VisitorResult,
): void {
  visit(tree, 'element', (node: Element, index, parent) => {
    if (node.tagName === tagName) return visitor(node, index, parent);
  });
}

/**
 * Every `tagName` element that sits in a parent, swapped for whatever `replace`
 * returns — `undefined` leaves it where it is. Traversal resumes past the
 * replacement, so a plugin that wraps a node never meets it again and wraps it
 * twice.
 */
export function replaceElements(
  tree: Root,
  tagName: string,
  replace: (node: Element) => ElementContent | undefined,
): void {
  visitElements(tree, tagName, (node, index, parent) => {
    if (index === undefined || !parent) return;

    const replacement = replace(node);

    if (replacement === undefined) return;

    parent.children[index] = replacement;

    return [SKIP, index + 1];
  });
}
