import { localeSegmentRoute } from '@/kernel/shared/i18n';

import { mayaHomeMetadata, MayaHomePage } from './maya-home-page';

export const mayaHomeRoute = localeSegmentRoute(MayaHomePage, mayaHomeMetadata);
