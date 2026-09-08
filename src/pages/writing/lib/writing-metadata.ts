import { PAGE_ROUTES, SITE_CONFIG } from '@/shared/config';
import { constructMetadata } from '@/shared/seo';

export const writingMetadata = constructMetadata({
  title: `Writing - ${SITE_CONFIG.name}`,
  description:
    'Twenty-two years of translating, editing and copywriting, still in use — essays written with a synthetic co-conspirator under the Glitchporn banner.',
  path: PAGE_ROUTES.writing,
});
