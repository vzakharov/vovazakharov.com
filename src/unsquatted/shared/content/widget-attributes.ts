/**
 * No `import 'server-only'`: parsers over what the pipeline hands a widget,
 * which the suite runs outside any bundler.
 *
 * What an author writes for a widget is checked here rather than trusted: a
 * misspelt attribute or a domain written wrong fails the build naming the
 * post, where it would otherwise show as a row that checks nothing.
 */

import { z } from 'zod';

import { errorClass } from '@/kernel/shared/lib/error-class';
import type { Labeled } from '@/kernel/shared/typings';

import type { WidgetPlaceholder } from '@/blog/shared/content/index.node-safe';

const WidgetError = errorClass('WidgetError');

const LABEL = /^[\da-z-]+$/;

const DOMAIN = /^[\da-z-]+\.[a-z]+$/;

/** An anchor in the post, so a copied link opens on the widget. */
const anchorSchema = z.string().regex(/^[\da-z-]+$/);

const domainsSchema = z.strictObject({
  label: z.string().min(1),
  id: anchorSchema.optional(),
});

/** `zones` as written: `com,shop,gift`. */
const zonesSchema = z
  .string()
  .regex(/^[a-z]+(?:,[a-z]+)*$/)
  .transform((zones) => zones.split(','));

const nameSchema = z.strictObject({
  word: z.string().regex(LABEL),
  zones: zonesSchema.optional(),
  /** The line under the rows, in the Unnamed's hand. */
  note: z.string().min(1).optional(),
  id: anchorSchema.optional(),
});

/** The zones a `name` widget shows where it names none. */
const DEFAULT_ZONES = ['com', 'net', 'org'];

/** The widget's id in the post, which a copied link opens on. */
type Anchored = { anchor: string };

/** The domains a widget's rows show, in order. */
export type Listed = { domains: readonly string[] };

/** What both widgets are drawn from. */
export type AnchoredList = Anchored & Listed;

export type Worded = { word: string };

export type DomainsList = AnchoredList & Labeled;

export type NameAcross = AnchoredList &
  Worded & {
    note: string | undefined;
  };

function parsed<T>(
  schema: z.ZodType<T>,
  { name, attributes, fileName }: WidgetPlaceholder,
): T {
  const result = schema.safeParse(attributes);

  if (!result.success) {
    throw new WidgetError(
      `${fileName}: the \`${name}\` widget's attributes do not parse: ${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

/** `A party of one` as `a-party-of-one`. */
const slugOf = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, '-')
    .replaceAll(/^-|-$/g, '');

/**
 * `:::domains{label="…"}` with a list of domains in its body. Its anchor is
 * its label's slug unless `id` names one.
 */
export function domainsList(placeholder: WidgetPlaceholder): DomainsList {
  const { label, id } = parsed(domainsSchema, placeholder);
  const astray = placeholder.items.filter((item) => !DOMAIN.test(item));

  if (placeholder.items.length === 0 || astray.length > 0) {
    throw new WidgetError(
      `${placeholder.fileName}: a \`domains\` widget lists domains, one per item${
        astray.length > 0 ? `, and not ${astray.join(', ')}` : ''
      }.`,
    );
  }

  return { label, domains: placeholder.items, anchor: id ?? slugOf(label) };
}

/** `::name{word=… zones=… note=…}`: one word across a few zones. */
export function nameAcross(placeholder: WidgetPlaceholder): NameAcross {
  const {
    word,
    zones = DEFAULT_ZONES,
    note,
    id,
  } = parsed(nameSchema, placeholder);

  return {
    word,
    domains: zones.map((zone) => `${word}.${zone}`),
    note,
    anchor: id ?? word,
  };
}
