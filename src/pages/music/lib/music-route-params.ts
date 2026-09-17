import 'server-only';

import { z } from 'zod';

import { DEFAULT_LOCALE, isLocale, type Locale, LOCALES } from '@/shared/i18n';
import {
  localeSchema,
  localeTailAddresses,
  localeTailSchema,
} from '@/shared/i18n/index.server-only';

import { listSongDocuments } from './songs';

/** The catch-all's segments as a route hands them over, before the schema narrows them. */
export type WithOptionalMusicSegments = { slugAndLocale?: string[] };

/**
 * A slug that cannot be read as a language. `/music/ru` is the index in
 * Russian, so a song from a repository called `ru` would have no address — and
 * this is what turns that into a build failure rather than a missing page.
 */
const songSlugSchema = z
  .string()
  .min(1)
  .refine((slug) => !isLocale(slug), {
    message: 'a song slug cannot be a locale: /music/<locale> is the index',
  });

/**
 * `/music`, `/music/<locale>`, `/music/<slug>` and `/music/<slug>/<locale>`, in
 * that order of preference — the index's language is tried first, and the slug
 * schema rejects a locale anyway, so neither reading can steal the other's URL.
 */
export const musicSegmentsSchema = z.object({
  slugAndLocale: z
    .union([z.tuple([localeSchema]), localeTailSchema(songSlugSchema)])
    .default([]),
});

export type MusicSegments = z.infer<
  typeof musicSegmentsSchema
>['slugAndLocale'];

/** Which page an address resolves to: the index or one song, in one language. */
export function musicAddressDefaults(address: MusicSegments): {
  slug?: string;
  locale: Locale;
} {
  const [head, tail] = address;

  if (head === undefined) return { locale: DEFAULT_LOCALE };
  if (isLocale(head)) return { locale: head };

  return { slug: head, locale: tail ?? DEFAULT_LOCALE };
}

/** Every address the music section answers, as the catch-all spells them. */
export function musicSegmentParams(): WithOptionalMusicSegments[] {
  const addresses: MusicSegments[] = [
    [],
    ...LOCALES.map<MusicSegments>((locale) => [locale]),
    ...listSongDocuments().flatMap(({ slug }) => localeTailAddresses(slug)),
  ];

  return addresses.map((slugAndLocale) => ({ slugAndLocale }));
}
