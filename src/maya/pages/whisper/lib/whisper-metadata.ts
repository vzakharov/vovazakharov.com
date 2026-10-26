import { SITE_CONFIG } from '@/kernel/shared/config';

import { constructMetadata } from '@/blog/shared/seo';

export const WHISPER_ROUTE = '/whisper';

export const whisperMetadata = constructMetadata({
  title: `Шепчущая машинка - ${SITE_CONFIG.name}`,
  description:
    'Печатаешь — и видишь, что слышал жучок КГБ в посольской IBM Selectric и что из этого восстановил пост.',
  path: WHISPER_ROUTE,
});
