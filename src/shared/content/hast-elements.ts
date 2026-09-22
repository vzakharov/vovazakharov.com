import 'server-only';

import type { Element, ElementContent, Root } from 'hast';
import type { Parent } from 'unist';
import { SKIP, visit, type VisitorResult } from 'unist-util-visit';

/**
 * Runs `visitor` on every `tagName` element in the tree. A pass that edits nodes
 * in place ignores `index` and `parent` and returns nothing; a pass that
 * rewrites the tree returns a traversal action, which `replaceElements` uses to
 * resume past a node it has just swapped.
 */
export function visitElements(
  tree: Root,
  tagName: string,
  visitor: (
    node: Element,
    index: number | undefined,
    parent: Parent | undefined,
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
