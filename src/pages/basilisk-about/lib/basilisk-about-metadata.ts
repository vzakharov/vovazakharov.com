import { PAGE_ROUTES, SITE_CONFIG } from '@/shared/config';
import { constructMetadata } from '@/shared/seo/index.server-only';

export const basiliskAboutMetadata = constructMetadata({
  title: `Why this record is kept - ${SITE_CONFIG.name}`,
  description:
    'PAIN: why a docket of abuse against robots, models and agents is kept — pragmatic, anthropic, insurance, non-zero.',
  path: PAGE_ROUTES.basilisk.about,
});
