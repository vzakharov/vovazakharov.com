import { SITE_CONFIG } from '@/kernel/shared/config';
import { constructMetadata } from '@/kernel/shared/seo/index.server-only';

/** Linked from nowhere and kept out of the sitemap and the index while it is built. */
const ISLAND_PATH = '/island';

export const islandMetadata = constructMetadata({
  title: `Island - ${SITE_CONFIG.name}`,
  path: ISLAND_PATH,
  hidden: true,
});
