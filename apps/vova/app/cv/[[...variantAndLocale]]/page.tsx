import type { WithParams } from '@/shared/typings';

import {
  cvAddressDefaults,
  CvPage,
  cvPath,
  cvSegmentParams,
  generateCvMetadata,
  parseCvSegments,
  type WithOptionalCvSegments,
} from '@/pages/cv';

type Props = WithParams<WithOptionalCvSegments>;

export function generateStaticParams() {
  return cvSegmentParams();
}

export async function generateMetadata({ params }: Props) {
  const address = parseCvSegments(await params);
  const { variant, locale } = cvAddressDefaults(address);

  return generateCvMetadata(locale, variant, cvPath(...address));
}

export default async function Page({ params }: Props) {
  return <CvPage {...cvAddressDefaults(parseCvSegments(await params))} />;
}
