import { SITE_ID } from '@/kernel/shared/config';
import { constructRootMetadata } from '@/kernel/app/ui';

import { listFeeds } from '@/blog/shared/content';

/** kernel's, advertising the feeds the site's collections publish. */
export const rootMetadata = constructRootMetadata(listFeeds(SITE_ID));
