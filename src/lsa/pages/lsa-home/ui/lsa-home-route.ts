import { localeSegmentRoute } from '@/kernel/shared/i18n';

import { lsaHomeMetadata, LsaHomePage } from './lsa-home-page';

export const lsaHomeRoute = localeSegmentRoute(LsaHomePage, lsaHomeMetadata);
