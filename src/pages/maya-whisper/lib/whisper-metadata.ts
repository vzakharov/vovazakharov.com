import { SITE_CONFIG } from '@/shared/config';
import { intrinsicDimensions } from '@/shared/content';
import { routeCardPath } from '@/shared/seo';
import { constructMetadata } from '@/shared/seo/index.server-only';

import {
  WHISPER_DESCRIPTION,
  WHISPER_ROUTE,
  WHISPER_TITLE,
} from './whisper-copy';

/** Its card, `pnpm content:og:maya` renders at the route plus the card suffix. */
const ogImage = routeCardPath(WHISPER_ROUTE);

export const whisperMetadata = constructMetadata({
  title: `${WHISPER_TITLE} - ${SITE_CONFIG.name}`,
  description: WHISPER_DESCRIPTION,
  path: WHISPER_ROUTE,
  ogImage,
  ogImageSize: intrinsicDimensions(ogImage),
});
