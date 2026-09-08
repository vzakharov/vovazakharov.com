import { routing, toLocale } from '@/shared/i18n';

import {
  CV_VARIANTS,
  CvPage,
  generateCvMetadata,
  toCvVariant,
} from '@/pages/cv';

type Props = {
  params: Promise<{ locale: string; variant: string }>;
};

/**
 * Both variants get an address that says which one it is, the default included
 * — `/cv` serves that one in place, and its metadata points search back there.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    CV_VARIANTS.map((variant) => ({ locale, variant })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, variant } = await params;

  return generateCvMetadata(toLocale(locale), toCvVariant(variant));
}

export default async function Page({ params }: Props) {
  const { locale, variant } = await params;

  return <CvPage locale={toLocale(locale)} variant={toCvVariant(variant)} />;
}
