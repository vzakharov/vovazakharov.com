/**
 * No `import 'server-only'`: pure constants and a parser over plain values,
 * which the suite runs outside any bundler.
 *
 * A widget crosses from the pipeline to the page as a `figure` whose data
 * attributes carry it — the hast property on one side, the React prop it
 * becomes on the other — so both sides read their names from here.
 */

import { z } from 'zod';

export const WIDGET_CLASS = 'content-widget';

/** The hast property names `remarkContentDirectives` writes. */
export const WIDGET_PROPERTIES = {
  name: 'dataWidget',
  attributes: 'dataWidgetAttributes',
  items: 'dataWidgetItems',
  source: 'dataWidgetSource',
} as const;

/** The same, as the props a component mapped onto `figure` receives. */
const WIDGET_PROPS = {
  name: 'data-widget',
  attributes: 'data-widget-attributes',
  items: 'data-widget-items',
  source: 'data-widget-source',
} as const;

const placeholderSchema = z.object({
  [WIDGET_PROPS.name]: z.string(),
  [WIDGET_PROPS.attributes]: z.string(),
  [WIDGET_PROPS.items]: z.string(),
  [WIDGET_PROPS.source]: z.string(),
});

/** What a widget's component is handed: everything the author wrote for it. */
export type WidgetPlaceholder = {
  name: string;
  attributes: Record<string, string>;
  /** The text of each item its body lists, in order. */
  items: string[];
  /** The file it was authored in, for a throw to name. */
  source: string;
};

const stringsSchema = z.array(z.string());
const attributesSchema = z.record(z.string(), z.string());

/**
 * The widget a `figure`'s props carry, or `undefined` for any other figure.
 * The props come from the pipeline's own output, but through React's untyped
 * prop bag, hence the parse.
 */
export function widgetPlaceholder(
  props: object,
): WidgetPlaceholder | undefined {
  if (!(WIDGET_PROPS.name in props)) return undefined;

  const parsed = placeholderSchema.parse(props);

  return {
    name: parsed[WIDGET_PROPS.name],
    attributes: attributesSchema.parse(
      JSON.parse(parsed[WIDGET_PROPS.attributes]),
    ),
    items: stringsSchema.parse(JSON.parse(parsed[WIDGET_PROPS.items])),
    source: parsed[WIDGET_PROPS.source],
  };
}
