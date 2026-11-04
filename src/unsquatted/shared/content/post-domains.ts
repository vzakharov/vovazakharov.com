import 'server-only';

import type { Element, Root, RootContent } from 'hast';

import {
  compileBody,
  type ContentDocument,
  elementWidget,
  type ProseSource,
  renderDocument,
  type WidgetPlaceholder,
} from '@/blog/shared/content';

function* elements(nodes: readonly RootContent[]): Generator<Element> {
  for (const node of nodes) {
    if (node.type !== 'element') continue;
    yield node;
    yield* elements(node.children);
  }
}

/**
 * The widgets a compiled tree sets, in order. Read off the tree the pipeline
 * compiles, so no second reader of the directive can disagree with the page.
 */
function widgetsIn({ children }: Root): WidgetPlaceholder[] {
  return [...elements(children)].flatMap(({ properties }) => {
    const widget = elementWidget(properties);

    return widget === undefined ? [] : [widget];
  });
}

/** A post's widgets, for a script that has its body but no document. */
export async function postWidgets(
  source: ProseSource,
): Promise<WidgetPlaceholder[]> {
  return widgetsIn(await compileBody(source));
}

/** The domains a post's `domains` widgets list, in the order the post lists them. */
export async function postDomains(
  document: ContentDocument,
): Promise<string[]> {
  return widgetsIn((await renderDocument(document)).tree)
    .filter(({ name }) => name === 'domains')
    .flatMap(({ items }) => items);
}
