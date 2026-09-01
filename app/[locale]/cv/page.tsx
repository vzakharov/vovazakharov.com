import { NextIntlClientProvider } from 'next-intl';

import { routing } from '@/i18n/routing';

import { generateCvMetadata } from '@/app/cv/cv-utils';

import CVPage from './cv-page';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  return generateCvMetadata(locale);
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider {...{ locale, messages }}>
      <CVPage />
    </NextIntlClientProvider>
  );
}
