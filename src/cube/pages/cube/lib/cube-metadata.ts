import { SITE_CONFIG } from '@/kernel/shared/config';
import { constructMetadata } from '@/kernel/shared/seo/index.server-only';

/** Linked from nowhere and kept out of the sitemap and the index while it is built. */
const CUBE_PATH = '/cube';

export const cubeMetadata = constructMetadata({
  title: `Cube - ${SITE_CONFIG.name}`,
  path: CUBE_PATH,
  hidden: true,
});
