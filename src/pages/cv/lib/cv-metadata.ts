import { SITE_CONFIG } from '@/shared/config';
import type { Locale } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

import { cvMessages } from './cv-messages';
import { cvRoute } from './cv-urls';
import { type CvVariant, DEFAULT_CV_VARIANT } from './cv-variants';

/**
 * `variant` is the segment the described URL carries, so omitting it describes
 * `/{locale}/cv` itself — which is why the default variant's own address
 * declares that bare route canonical rather than competing with it.
 */
export function generateCvMetadata(locale: Locale, variant?: CvVariant) {
  const { description, ogSuffix } = cvMessages(
    locale,
    variant ?? DEFAULT_CV_VARIANT,
  ).cv.metadata;

  return constructMetadata({
    title: `CV - ${SITE_CONFIG.name}`,
    description,
    ogDescription: `${description} ${ogSuffix}`,
    path: cvRoute(locale, variant),
    canonical: variant === DEFAULT_CV_VARIANT ? cvRoute(locale) : undefined,
    ogType: 'profile',
    ogImage: '/cv_card.png',
  });
}
