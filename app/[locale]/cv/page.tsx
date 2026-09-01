import { NextIntlClientProvider } from 'next-intl';
import { routing } from '@/i18n/routing';
import CVPage from './CVPage';
import { generateCvMetadata } from '@/app/cv/cv-utils';
import { documentRoute } from '@/lib/content/collections';

/** The write-up the CV's case-studies section points at. */
const FEATURED_CASE_STUDY = 'playgram-bubble-to-nextjs-part-1';

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
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CVPage
        caseStudyHref={documentRoute('case-studies', FEATURED_CASE_STUDY)}
      />
    </NextIntlClientProvider>
  );
}
