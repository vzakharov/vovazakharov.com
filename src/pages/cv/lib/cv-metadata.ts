import { SITE_CONFIG } from '@/shared/config';
import { type Locale, routing } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

import { cvMessages } from './cv-messages';
import { cvPath } from './cv-urls';
import type { CvVariant } from './cv-variants';

/**
 * The fully-specified address is canonical, so the shorter rungs serving the
 * same page defer to it rather than competing — the indexed URL names both the
 * framing and the language. `path` is the rung actually being served, so each
 * still advertises itself as its own `og:url`.
 *
 * The same framing in the other language is a translation, not a duplicate, so
 * every rung also lists both twins as `hreflang` alternates. With the locale
 * carried as a trailing segment, a crawler has nothing else to read the
 * language off.
 */
export function generateCvMetadata(
  locale: Locale,
  variant: CvVariant,
  path: string,
) {
  const { description, ogSuffix } = cvMessages(locale, variant).cv.metadata;

  return constructMetadata({
    title: `CV - ${SITE_CONFIG.name}`,
    description,
    ogDescription: `${description} ${ogSuffix}`,
    path,
    canonical: cvPath(variant, locale),
    languages: {
      ...Object.fromEntries(
        routing.locales.map((alternate) => [
          alternate,
          cvPath(variant, alternate),
        ]),
      ),
      'x-default': cvPath(variant, routing.defaultLocale),
    },
    ogType: 'profile',
    ogImage: '/cv_card.png',
  });
}
