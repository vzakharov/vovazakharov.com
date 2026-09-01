import { NextIntlClientProvider } from 'next-intl';
import { CvPage, generateCvMetadata } from '@/pages/cv';
import { loadMessages, routing, toLocale } from '@/shared/i18n';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;

  return generateCvMetadata(toLocale(locale));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={loadMessages(toLocale(locale))}
    >
      <CvPage />
    </NextIntlClientProvider>
  );
}
