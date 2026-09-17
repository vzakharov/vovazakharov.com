import type { WithParams } from '@/shared/typings';

import {
  generateMusicMetadata,
  generateSongMetadata,
  musicAddressDefaults,
  MusicPage,
  musicSegmentParams,
  musicSegmentsSchema,
  SongPage,
  type WithOptionalMusicSegments,
} from '@/pages/music';

type Props = WithParams<WithOptionalMusicSegments>;

export function generateStaticParams() {
  return musicSegmentParams();
}

export async function generateMetadata({ params }: Props) {
  const { slugAndLocale } = musicSegmentsSchema.parse(await params);
  const { slug, locale } = musicAddressDefaults(slugAndLocale);

  return slug === undefined
    ? generateMusicMetadata(locale)
    : generateSongMetadata({ slug, locale });
}

export default async function Page({ params }: Props) {
  const { slugAndLocale } = musicSegmentsSchema.parse(await params);
  const { slug, locale } = musicAddressDefaults(slugAndLocale);

  return slug === undefined ? (
    <MusicPage {...{ locale }} />
  ) : (
    <SongPage {...{ slug, locale }} />
  );
}
