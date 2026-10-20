import { PAGE_ROUTES } from '@/kernel/shared/config';
import { sitemap as collectionSitemap } from '@/kernel/app/lib';

import { musicCatalogueRoutes } from '@/music/pages/music';

import { cvRoutes } from '@/vova/pages/cv';

export const sitemap = collectionSitemap([
  ...Object.values(PAGE_ROUTES),
  ...cvRoutes(),
  ...musicCatalogueRoutes(),
]);
