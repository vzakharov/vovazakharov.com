import { parseLocaleSegment, type WithLocaleSegment } from '@/shared/i18n';
import type { WithParams } from '@/shared/typings';

import { mayaHomeMetadata, MayaHomePage } from '@/pages/maya-home';

type Props = WithParams<WithLocaleSegment>;

export async function generateMetadata({ params }: Props) {
  return mayaHomeMetadata({ locale: parseLocaleSegment(await params) });
}

export default async function Page({ params }: Props) {
  return <MayaHomePage locale={parseLocaleSegment(await params)} />;
}

export { localeSegmentParams as generateStaticParams } from '@/shared/i18n';
