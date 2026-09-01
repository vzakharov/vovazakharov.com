import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';

import { MESSAGES } from '@/i18n/messages';
import { routing } from '@/i18n/routing';

import { generateCvMetadata } from '@/app/cv/cv-utils';

import CVPage from './cv-page';

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
      <CVPage />
    </NextIntlClientProvider>
  );
}
