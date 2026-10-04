import { PAGE_ROUTES, SITE_CONFIG } from '@/shared/config';
import { constructMetadata } from '@/shared/seo/index.server-only';

export const mushroomsMetadata = constructMetadata({
  title: `Mushrooms - ${SITE_CONFIG.name}`,
  description: 'A meadow of fly agarics, from a drawing by Syama.',
  path: PAGE_ROUTES.mushrooms,
});
