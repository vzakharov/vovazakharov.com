import { SITE_CONFIG } from '@/shared/config';
import type { Locale } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

import { cvMessages } from './cv-messages';
import { cvPath } from './cv-urls';
import type { CvVariant } from './cv-variants';

/**
 * Every CV page declares the fully-specified address canonical, so the shorter
 * rungs that serve the same page defer to it rather than competing with it —
 * the indexed URL is the one that names both the framing and the language.
 * `path` is the address actually being served, so each rung still advertises
 * itself as its own `og:url`.
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
    ogType: 'profile',
    ogImage: '/cv_card.png',
  });
}
