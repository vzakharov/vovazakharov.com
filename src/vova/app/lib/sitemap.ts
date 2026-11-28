import { PAGE_ROUTES } from '@/kernel/shared/config';

import { sitemap as collectionSitemap } from '@/blog/app/lib';

import { musicCatalogueRoutes } from '@/music/app/lib';

import { cvRoutes } from '@/vova/entities/cv';

export const sitemap = collectionSitemap([
  ...Object.values(PAGE_ROUTES),
  ...cvRoutes(),
  ...musicCatalogueRoutes(),
]);
