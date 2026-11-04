import 'server-only';

import type { Element, Root, RootContent } from 'hast';
import { z } from 'zod';

import {
  type ContentDocument,
  renderDocument,
  WIDGET_PROPERTIES,
} from '@/blog/shared/content';

const itemsSchema = z.array(z.string());

function* elements(nodes: readonly RootContent[]): Generator<Element> {
  for (const node of nodes) {
    if (node.type !== 'element') continue;
    yield node;
    yield* elements(node.children);
  }
}

const isDomainsWidget = (element: Element) =>
  element.properties[WIDGET_PROPERTIES.name] === 'domains';

/**
 * The domains a post's `domains` widgets list, in the order the post lists
 * them, read off the tree the pipeline compiles, so no second reader of the
 * directive can disagree with the page.
 */
export async function postDomains(
  document: ContentDocument,
): Promise<string[]> {
  const { tree }: { tree: Root } = await renderDocument(document);

  return [...elements(tree.children)]
    .filter((element) => isDomainsWidget(element))
    .flatMap((element) =>
      itemsSchema.parse(
        JSON.parse(String(element.properties[WIDGET_PROPERTIES.items])),
      ),
    );
}
