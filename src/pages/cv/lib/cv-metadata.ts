import { SITE_CONFIG } from '@/shared/config';
import { loadMessages, type Locale } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

export function generateCvMetadata(locale: Locale) {
  const { description, ogSuffix } = loadMessages(locale).cv.metadata;

  return constructMetadata({
    title: `CV - ${SITE_CONFIG.name}`,
    description,
    ogDescription: `${description} ${ogSuffix}`,
    path: `/${locale}/cv`,
    ogType: 'profile',
    ogImage: '/cv_card.png',
  });
}
