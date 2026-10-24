import type { WithParams } from '@/kernel/shared/typings';

import {
  generateMusicRouteMetadata,
  MusicRoute,
  musicSegmentParams,
  parseMusicSegments,
  type WithOptionalMusicSegments,
} from '@/music/pages/music';

type Props = WithParams<WithOptionalMusicSegments>;

export function generateStaticParams() {
  return musicSegmentParams();
}

export async function generateMetadata({ params }: Props) {
  return generateMusicRouteMetadata({
    address: parseMusicSegments(await params),
  });
}

export default async function Page({ params }: Props) {
  return <MusicRoute address={parseMusicSegments(await params)} />;
}
