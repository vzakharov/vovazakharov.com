import {
  localeSegmentParams,
  parseLocaleSegment,
  type WithLocaleSegment,
} from '@/shared/i18n';
import type { WithParams } from '@/shared/typings';

import { WhisperPage, whisperMetadata } from '@/pages/maya-whisper';

type Props = WithParams<WithLocaleSegment>;

export const generateStaticParams = localeSegmentParams;

export async function generateMetadata({ params }: Props) {
  return whisperMetadata({ locale: parseLocaleSegment(await params) });
}

export default async function Page({ params }: Props) {
  return <WhisperPage locale={parseLocaleSegment(await params)} />;
}
