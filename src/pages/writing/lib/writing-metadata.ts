import { PAGE_ROUTES } from '@/shared/config';
import { SITE_CONFIG } from '@/shared/config/index.server-only';
import { constructMetadata } from '@/shared/seo/index.server-only';

export const writingMetadata = constructMetadata({
  title: `Writing - ${SITE_CONFIG.name}`,
  description:
    'Twenty-two years of translating, editing and copywriting, still in use — essays written with a synthetic co-conspirator under the Glitchporn banner.',
  path: PAGE_ROUTES.writing,
});
