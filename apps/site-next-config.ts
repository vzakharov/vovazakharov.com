import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

/**
 * Every site's Next config. Pass the caller's own `import.meta.dirname`:
 * Turbopack has to be told the workspace root, the lockfile and `node_modules`
 * being two levels above an app.
 *
 * `site` is a bare string rather than the id union because importing it would
 * run `src/shared/config`'s own check here, while Next is still loading this
 * file and nothing has set the variable yet. An unknown value fails that check
 * moments later instead.
 */
export function siteNextConfig(site: string, appDir: string): NextConfig {
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
