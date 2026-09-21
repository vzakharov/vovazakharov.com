import { NextIntlClientProvider } from 'next-intl';

import { FEATURED_CASE_STUDY_ROUTE } from '@/shared/content';
import type { Locale } from '@/shared/i18n';

import { cvPdfFile } from '../lib/cv-files';
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
        caseStudy={{ href: FEATURED_CASE_STUDY_ROUTE }}
        pdfFile={cvPdfFile(variant, locale)}
      />
    </NextIntlClientProvider>
  );
}
