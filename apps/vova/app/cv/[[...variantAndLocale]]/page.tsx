import type { WithParams } from '@/shared/typings';

import {
  cvAddressDefaults,
  CvPage,
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
  return generateCvMetadata(parseCvSegments(await params));
}

export default async function Page({ params }: Props) {
  return <CvPage {...cvAddressDefaults(parseCvSegments(await params))} />;
}
