import { SITE_CONFIG } from '@/shared/config';
import { collectionRoute } from '@/shared/content';
import { constructMetadata } from '@/shared/seo';

export const musicMetadata = constructMetadata({
  title: `Music - ${SITE_CONFIG.name}`,
  description:
    'AI music from before there was a product for it — a catalogue of masters you can play right here, three projects on Spotify, all of it open-source.',
  path: collectionRoute('music'),
});
