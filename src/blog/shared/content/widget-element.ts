/**
 * No `import 'server-only'`: pure constants and a parser over plain values,
 * which the suite runs outside any bundler.
 *
 * A widget crosses from the pipeline to the page as a `figure` whose data
 * attributes carry it — the hast property on one side, the React prop it
 * becomes on the other — so both sides read their names from here.
 */

import { z } from 'zod';

import type { Named, WithFileName } from '@/kernel/shared/typings';

export const WIDGET_CLASS = 'content-widget';

/** The hast property names `remarkContentDirectives` writes. */
export const WIDGET_PROPERTIES = {
  name: 'dataWidget',
  attributes: 'dataWidgetAttributes',
  items: 'dataWidgetItems',
  fileName: 'dataWidgetFileName',
} as const;

/** The same, as the props a component mapped onto `figure` receives. */
const WIDGET_PROPS = {
  name: 'data-widget',
  attributes: 'data-widget-attributes',
  items: 'data-widget-items',
  fileName: 'data-widget-file-name',
} as const;

/**
 * What a widget's component is handed: everything the author wrote for it,
 * and the file it was authored in, for a throw to name.
 */
export type WidgetPlaceholder = Named &
  WithFileName & {
    attributes: Record<string, string>;
    /** The text of each item its body lists, in order. */
    items: string[];
  };

/** The placeholder as the pipeline writes it: two of its parts as JSON. */
const encodedSchema = z.object({
  name: z.string(),
  attributes: z.string(),
  items: z.string(),
  fileName: z.string(),
});

const stringsSchema = z.array(z.string());
const attributesSchema = z.record(z.string(), z.string());

function decoded(
  read: (part: keyof typeof WIDGET_PROPS) => unknown,
): WidgetPlaceholder {
  const encoded = encodedSchema.parse({
    name: read('name'),
    attributes: read('attributes'),
    items: read('items'),
    fileName: read('fileName'),
  });

  return {
    ...encoded,
    attributes: attributesSchema.parse(JSON.parse(encoded.attributes)),
    items: stringsSchema.parse(JSON.parse(encoded.items)),
  };
}

/**
 * The widget a `figure`'s props carry, or `undefined` for any other figure.
 * The props come from the pipeline's own output, but through React's untyped
 * prop bag, hence the parse.
 */
export function widgetPlaceholder(
  props: object,
): WidgetPlaceholder | undefined {
  if (!(WIDGET_PROPS.name in props)) return undefined;

  const bag = new Map(Object.entries(props));

  return decoded((part) => bag.get(WIDGET_PROPS[part]));
}

/** The widget a compiled element's properties carry, or `undefined`. */
export function elementWidget(
  properties: Readonly<Record<string, unknown>>,
): WidgetPlaceholder | undefined {
  if (properties[WIDGET_PROPERTIES.name] === undefined) return undefined;

  return decoded((part) => properties[WIDGET_PROPERTIES[part]]);
}
