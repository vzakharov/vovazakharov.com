import type { WithParams } from '@/shared/typings';

import {
  generateMusicMetadata,
  generateSongMetadata,
  musicAddressDefaults,
  MusicPage,
  musicSegmentParams,
  parseMusicSegments,
  SongPage,
  type WithOptionalMusicSegments,
} from '@/pages/music';

type Props = WithParams<WithOptionalMusicSegments>;

export function generateStaticParams() {
  return musicSegmentParams();
}

export async function generateMetadata({ params }: Props) {
  const { slug, everything, locale } = musicAddressDefaults(
    parseMusicSegments(await params),
  );

  return slug === undefined
    ? generateMusicMetadata(locale, everything)
    : generateSongMetadata({ slug, locale });
}

export default async function Page({ params }: Props) {
  const { slug, everything, locale } = musicAddressDefaults(
    parseMusicSegments(await params),
  );

  return slug === undefined ? (
    <MusicPage {...{ locale, everything }} />
  ) : (
    <SongPage {...{ slug, locale }} />
  );
}
