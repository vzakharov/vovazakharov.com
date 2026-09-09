import type { WithParams } from '@/shared/typings';

import {
  cvAddressDefaults,
  CvPage,
  cvPath,
  cvSegmentParams,
  cvSegmentsSchema,
  generateCvMetadata,
  type WithOptionalCvSegments,
} from '@/pages/cv';

type Props = WithParams<WithOptionalCvSegments>;

export function generateStaticParams() {
  return cvSegmentParams();
}

export async function generateMetadata({ params }: Props) {
  const { variantAndLocale } = cvSegmentsSchema.parse(await params);
  const { variant, locale } = cvAddressDefaults(variantAndLocale);

  return generateCvMetadata(locale, variant, cvPath(...variantAndLocale));
}

export default async function Page({ params }: Props) {
  const { variantAndLocale } = cvSegmentsSchema.parse(await params);

  return <CvPage {...cvAddressDefaults(variantAndLocale)} />;
}
