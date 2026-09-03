import { NextIntlClientProvider } from 'next-intl';

import { documentRoute } from '@/shared/content';
import { loadMessages, routing, toLocale } from '@/shared/i18n';

import { CvPage, generateCvMetadata } from '@/pages/cv';

const FEATURED_CASE_STUDY = 'playgram';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  return generateCvMetadata(toLocale(locale));
}

export default async function Page({ params }: Props) {
  const locale = toLocale((await params).locale);

  return (
    <NextIntlClientProvider {...{ locale }} messages={loadMessages(locale)}>
      <CvPage
        caseStudyHref={documentRoute('case-studies', FEATURED_CASE_STUDY)}
      />
    </NextIntlClientProvider>
  );
}
