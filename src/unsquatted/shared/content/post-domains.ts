import 'server-only';

import type { Element, Root, RootContent } from 'hast';
import { z } from 'zod';

import {
  compileBody,
  type ContentDocument,
  type ProseSource,
  renderDocument,
  WIDGET_PROPERTIES,
  type WidgetPlaceholder,
} from '@/blog/shared/content';

const itemsSchema = z.array(z.string());
const attributesSchema = z.record(z.string(), z.string());

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
    const name = properties[WIDGET_PROPERTIES.name];

    return typeof name === 'string'
      ? [
          {
            name,
            attributes: attributesSchema.parse(
              JSON.parse(String(properties[WIDGET_PROPERTIES.attributes])),
            ),
            items: itemsSchema.parse(
              JSON.parse(String(properties[WIDGET_PROPERTIES.items])),
            ),
            source: String(properties[WIDGET_PROPERTIES.source]),
          },
        ]
      : [];
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
