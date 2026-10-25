import { SITE_CONFIG } from '@/shared/config';
import { constructMetadata } from '@/shared/seo/index.server-only';

export const WHISPER_ROUTE = '/whisper';

export const whisperMetadata = constructMetadata({
  title: `Шепчущая машинка - ${SITE_CONFIG.name}`,
  description:
    'Печатаешь — и видишь, что слышал жучок КГБ в посольской IBM Selectric и что из этого восстановил пост.',
  path: WHISPER_ROUTE,
});
