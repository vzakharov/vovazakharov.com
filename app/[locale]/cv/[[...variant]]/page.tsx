import { routing, type WithStringLocale } from '@/shared/i18n';
import type { WithParams } from '@/shared/typings';

import {
  CvPage,
  cvParamsSchema,
  cvVariantParams,
  generateCvMetadata,
  type WithOptionalVariantSegments,
} from '@/pages/cv';

type Props = WithParams<WithStringLocale & WithOptionalVariantSegments>;

/**
 * Both variants get an address that says which one it is, plus the bare `/cv`
 * the default variant also answers — one page, three URLs per locale.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    cvVariantParams().map((params) => ({ locale, ...params })),
  );
}

export async function generateMetadata({ params }: Props) {
  const { locale, variant } = cvParamsSchema.parse(await params);

  return generateCvMetadata(locale, variant);
}

export default async function Page({ params }: Props) {
  return <CvPage {...cvParamsSchema.parse(await params)} />;
}
