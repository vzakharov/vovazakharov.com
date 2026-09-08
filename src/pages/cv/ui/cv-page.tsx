import { NextIntlClientProvider } from 'next-intl';

import { documentRoute, FEATURED_CASE_STUDY } from '@/shared/content';
import type { Locale } from '@/shared/i18n';

import { cvMessages } from '../lib/cv-messages';
import type { WithCvVariant } from '../lib/cv-variants';
import { CvSheet } from './cv-sheet';

export type CvPageProps = WithCvVariant & { locale: Locale };

export function CvPage({ locale, variant }: CvPageProps) {
  return (
    <NextIntlClientProvider
      {...{ locale }}
      messages={cvMessages(locale, variant)}
    >
      <CvSheet
        {...{ variant }}
        caseStudyHref={documentRoute('case-studies', FEATURED_CASE_STUDY)}
      />
    </NextIntlClientProvider>
  );
}
