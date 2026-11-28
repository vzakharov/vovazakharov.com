import { PAGE_ROUTES, SITE_CONFIG } from '@/kernel/shared/config';
import { constructMetadata } from '@/kernel/shared/seo/index.server-only';

export const horowoClipMetadata = constructMetadata({
  title: `«Хорошо!» - ${SITE_CONFIG.name}`,
  description: 'A music video for «Хорошо!», drawn in code.',
  path: PAGE_ROUTES.horowoClip,
});
