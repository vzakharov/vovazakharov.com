import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

import type { SiteId } from '@/kernel/shared/config';

/**
 * Every site's Next config. Pass the caller's own `import.meta.dirname`:
 * Turbopack has to be told the workspace root, the lockfile and `node_modules`
 * being two levels above a site.
 */
export function siteNextConfig(site: SiteId, siteDir: string): NextConfig {
  // Found by string rather than by import, and relative to the site directory —
  // which is where Turbopack resolves it from and where every build is entered.
  const withNextIntl = createNextIntlPlugin(
    '../../src/kernel/shared/i18n/request.ts',
  );

  return withNextIntl({
    output: 'export',
    basePath: '',
    images: {
      unoptimized: true,
    },
    // Which site this build is, pinned here so no invocation can forget it —
    // `src/kernel/shared/config` refuses to load without it.
    env: {
      NEXT_PUBLIC_SITE: site,
    },
    // A site whose route groups each carry their own root layout has no layout
    // above them all for `not-found.tsx` to render in; `global-not-found.tsx`
    // renders its own document instead.
    experimental: {
      globalNotFound: true,
    },
    turbopack: {
      root: path.join(siteDir, '..', '..'),
    },
  });
}
