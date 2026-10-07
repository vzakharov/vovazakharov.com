import 'server-only';

import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  LOCALES,
  type LocaleTail,
  localeTailAddresses,
} from '@/shared/i18n';
import { oneOfEach } from '@/shared/lib/collections';

import { EVERYTHING_SEGMENT } from './music-urls';
import { listSongDocuments } from './songs';

/** The catch-all's segments as a route hands them over, before the parse narrows them. */
export type WithOptionalMusicSegments = { slugAndLocale?: string[] };

/** `/music`, `/music/<locale>`, `/music/<slug>` and `/music/<slug>/<locale>`. */
export type MusicSegments = [Locale] | LocaleTail<string>;

/**
 * A parse rather than a cast, failing `next build` on a segment no reading
 * covers. The index's language is tried first — `/music/ru` is the index in
 * Russian — and `listSongDocuments` refuses a slug that is a locale, so neither
 * reading can steal the other's URL.
 */
export function parseMusicSegments({
  slugAndLocale = [],
}: WithOptionalMusicSegments): MusicSegments {
  const [head, ...tail] = slugAndLocale;

  if (head === undefined) return [];
  if (isLocale(head)) return oneOfEach([LOCALES], slugAndLocale);

  return [head, ...oneOfEach([LOCALES], tail)];
}

/**
 * Which page an address resolves to, in one language: the index, the index with
 * hidden songs on it too, or one song.
 */
export function musicAddressDefaults(address: MusicSegments): {
  slug?: string;
  everything?: true;
  locale: Locale;
} {
  const [head, tail] = address;

  if (head === undefined) return { locale: DEFAULT_LOCALE };
  if (isLocale(head)) return { locale: head };
  if (head === EVERYTHING_SEGMENT) {
    return { everything: true, locale: tail ?? DEFAULT_LOCALE };
  }

  return { slug: head, locale: tail ?? DEFAULT_LOCALE };
}

/** Every address the music section answers, as the catch-all spells them. */
export function musicSegmentParams(): WithOptionalMusicSegments[] {
  const addresses: MusicSegments[] = [
    [],
    ...LOCALES.map<MusicSegments>((locale) => [locale]),
    ...localeTailAddresses(EVERYTHING_SEGMENT),
    ...listSongDocuments().flatMap(({ slug }) => localeTailAddresses(slug)),
  ];

  return addresses.map((slugAndLocale) => ({ slugAndLocale }));
}
