import { routing, toLocale, type WithStringLocale } from '@/shared/i18n';
import type { WithParams } from '@/shared/typings';

import {
  CV_VARIANTS,
  CvPage,
  generateCvMetadata,
  toCvVariant,
  type WithStringVariant,
} from '@/pages/cv';

type Props = WithParams<WithStringLocale & WithStringVariant>;

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
