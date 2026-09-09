import { PAGE_ROUTES, SITE_CONFIG } from '@/shared/config';
import { constructMetadata } from '@/shared/seo';

export const musicMetadata = constructMetadata({
  title: `Music - ${SITE_CONFIG.name}`,
  description:
    'AI music from before there was a product for it — three projects on Spotify, written from my own humming, piano and MIDIs, all of it open-source.',
  path: PAGE_ROUTES.music,
});
