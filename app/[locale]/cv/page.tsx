import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';

import { documentRoute } from '@/lib/content/collections';

import { MESSAGES } from '@/i18n/messages';
import { routing } from '@/i18n/routing';

import { generateCvMetadata } from '@/app/cv/cv-utils';

import CVPage from './cv-page';

const FEATURED_CASE_STUDY = 'playgram-bubble-to-nextjs-part-1';

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  return generateCvMetadata(locale);
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  // `generateStaticParams` only emits the configured locales, so this narrows
  // the segment to a catalog key rather than guarding a reachable case.
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <NextIntlClientProvider {...{ locale, messages: MESSAGES[locale] }}>
      <CVPage
        caseStudyHref={documentRoute('case-studies', FEATURED_CASE_STUDY)}
      />
    </NextIntlClientProvider>
  );
}
