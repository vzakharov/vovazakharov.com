import { SITE_CONFIG } from '@/shared/config';
import type { Locale } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

import { cvMessages } from './cv-messages';
import { cvRoute } from './cv-urls';
import type { CvVariant } from './cv-variants';

/**
 * Every CV page declares its variant's own address canonical, so the bare
 * `/{locale}/cv` defers to `/{locale}/cv/cto` rather than competing with it —
 * the indexed URL is the one that names the framing.
 */
export function generateCvMetadata(locale: Locale, variant: CvVariant) {
  const { description, ogSuffix } = cvMessages(locale, variant).cv.metadata;
  const route = cvRoute(locale, variant);

  return constructMetadata({
    title: `CV - ${SITE_CONFIG.name}`,
    description,
    ogDescription: `${description} ${ogSuffix}`,
    path: route,
    canonical: route,
    ogType: 'profile',
    ogImage: '/cv_card.png',
  });
}
