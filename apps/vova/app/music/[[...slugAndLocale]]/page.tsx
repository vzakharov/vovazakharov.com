import type { WithParams } from '@/shared/typings';

import {
  generateMusicRouteMetadata,
  MusicRoute,
  musicSegmentParams,
  parseMusicSegments,
  type WithOptionalMusicSegments,
} from '@/pages/music';

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
