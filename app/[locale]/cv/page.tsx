import { routing, toLocale } from '@/shared/i18n';

import { CvPage, DEFAULT_CV_VARIANT, generateCvMetadata } from '@/pages/cv';

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
  const { locale } = await params;

  return <CvPage locale={toLocale(locale)} variant={DEFAULT_CV_VARIANT} />;
}
