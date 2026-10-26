import type { WithParams } from '@/kernel/shared/typings';

import {
  musicSegmentParams,
  parseMusicSegments,
  type WithOptionalMusicSegments,
} from '@/music/app/lib';
import { generateMusicRouteMetadata, MusicRoute } from '@/music/app/ui';

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
