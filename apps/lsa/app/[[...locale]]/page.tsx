import { parseLocaleSegment, type WithLocaleSegment } from '@/shared/i18n';
import type { WithParams } from '@/shared/typings';

import { lsaHomeMetadata, LsaHomePage } from '@/pages/lsa-home';

type Props = WithParams<WithLocaleSegment>;

export async function generateMetadata({ params }: Props) {
  return lsaHomeMetadata({ locale: parseLocaleSegment(await params) });
}

export default async function Page({ params }: Props) {
  return <LsaHomePage locale={parseLocaleSegment(await params)} />;
}

export { localeSegmentParams as generateStaticParams } from '@/shared/i18n';
