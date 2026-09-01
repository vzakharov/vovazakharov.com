import { SITE_CONFIG } from '@/shared/config';
import type { Locale } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

const CV_COPY: Record<Locale, { description: string; ogSuffix: string }> = {
  en: {
    description:
      'Full-stack developer with deep AI/ML expertise since 2020. Building practical LLM-powered tools, prototypes, and production systems.',
    ogSuffix: 'Physics-math brain meets low-maintenance execution.',
  },
  ru: {
    description:
      'Full-stack разработчик с глубокой AI/ML экспертизой с 2019 года. Создаю практичные инструменты на базе LLM, прототипы и продакшн-системы.',
    ogSuffix:
      'Физико-математический склад ума встречается с неприхотливым исполнением.',
  },
};

export function generateCvMetadata(locale: Locale) {
  const { description, ogSuffix } = CV_COPY[locale];

  return constructMetadata({
    title: `CV - ${SITE_CONFIG.name}`,
    description,
    ogDescription: `${description} ${ogSuffix}`,
    path: `/${locale}/cv`,
    ogType: 'profile',
    ogImage: '/cv_card.png',
  });
}
