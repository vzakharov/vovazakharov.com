import { SITE_CONFIG } from '@/kernel/shared/config';

import { constructMetadata } from '@/blog/shared/seo';

/** Linked from nowhere and kept out of the sitemap and the index: a tool for the author, not a page for readers. */
const BLIND_TEST_PATH = '/music/mastering-blind-test';

export const blindTestMetadata = constructMetadata({
  title: `Blind test - ${SITE_CONFIG.name}`,
  path: BLIND_TEST_PATH,
  hidden: true,
});
