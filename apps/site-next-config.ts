import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

// Type-only on purpose — erased before resolution. Importing the value would
// run `src/shared/config`'s own check, against the variable this file sets.
import type { SiteId } from '@/shared/config';

/**
 * Every site's Next config. Pass the caller's own `import.meta.dirname`:
 * Turbopack has to be told the workspace root, the lockfile and `node_modules`
 * being two levels above an app.
 */
export function siteNextConfig(site: SiteId, appDir: string): NextConfig {
  // Found by string rather than by import, and relative to the app directory —
  // which is where Turbopack resolves it from and where every build is entered.
  const withNextIntl = createNextIntlPlugin('../../src/shared/i18n/request.ts');

  return withNextIntl({
    output: 'export',
    basePath: '',
    images: {
      unoptimized: true,
    },
    // Which site this build is, pinned here so no invocation can forget it —
    // `src/shared/config` refuses to load without it.
    env: {
      NEXT_PUBLIC_SITE: site,
    },
    turbopack: {
      root: path.join(appDir, '..', '..'),
    },
  });
}
