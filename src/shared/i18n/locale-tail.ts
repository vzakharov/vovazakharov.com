import 'server-only';

import { z } from 'zod';

import { localeSchema } from './locale-schema';
import { type Locale, type LocaleTail, LOCALES, DEFAULT_LOCALE } from './locales';

/**
 * The segments of a locale-last address, as a route hands them over. A parse
 * rather than a cast: under `output: 'export'` the only thing that ever runs it
 * is `next build`, so a segment neither list covers fails the build — hence
 * `server-only`, zod having no business on the CDN.
 */
export function localeTailSchema<Head extends string>(
  head: z.ZodType<Head>,
): z.ZodType<LocaleTail<Head>> {
  return z.union([
    z.tuple([]),
    z.tuple([head]),
    z.tuple([head, localeSchema]),
  ]);
}

/** Every address one head value answers: itself, and one per locale. */
export function localeTailAddresses<Head extends string>(
  head: Head,
): Array<LocaleTail<Head>> {
  return [
    [head],
    ...LOCALES.map<LocaleTail<Head>>((locale) => [head, locale]),
  ];
}

/** Which page a locale-last address resolves to, an omitted locale falling back. */
export function localeTailDefaults<Head extends string>(
  address: LocaleTail<Head>,
): { head?: Head; locale: Locale } {
  const [head, locale = DEFAULT_LOCALE] = address;

  return { head, locale };
}
