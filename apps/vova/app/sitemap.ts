import { PAGE_ROUTES } from '@/kernel/shared/config';
import { sitemap } from '@/kernel/app/lib';

import { musicCatalogueRoutes } from '@/music/pages/music';

import { cvRoutes } from '@/vova/pages/cv';

// `output: 'export'` has no request-time rendering, so the route must declare
// that it is written once at build time. Next reads this off the route module
// itself, which is why it is stated here rather than re-exported.
export const dynamic = 'force-static';

export default sitemap([
  ...Object.values(PAGE_ROUTES),
  ...cvRoutes(),
  ...musicCatalogueRoutes(),
]);
