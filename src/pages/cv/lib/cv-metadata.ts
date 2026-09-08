import { SITE_CONFIG } from '@/shared/config';
import type { Locale } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

import { cvMessages } from './cv-messages';
import { cvRoute } from './cv-urls';
import type { CvVariant } from './cv-variants';

/**
 * Every CV page names the variant's own address as its canonical one, so the
 * bare `/{locale}/cv` — which serves the default variant — defers to
 * `/{locale}/cv/{DEFAULT_CV_VARIANT}` instead of competing with it, and a
 * searcher reads the URL that says which framing it is.
 */
export function generateCvMetadata(locale: Locale, variant: CvVariant) {
  const { description, ogSuffix } = cvMessages(locale, variant).cv.metadata;

  return constructMetadata({
    title: `CV - ${SITE_CONFIG.name}`,
    description,
    ogDescription: `${description} ${ogSuffix}`,
    path: cvRoute(locale, variant),
    canonical: cvRoute(locale, variant),
    ogType: 'profile',
    ogImage: '/cv_card.png',
  });
}
