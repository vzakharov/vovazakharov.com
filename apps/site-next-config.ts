import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

/**
 * Every site's Next config, which differs only in which site it is. Both are
 * static exports off one `src/`, so anything else that varied between them
 * would be a difference in how the same code is built.
 *
 * `appDir` is the caller's own `import.meta.dirname`: Turbopack has to be told
 * the workspace root, which is two levels up, since the lockfile and
 * `node_modules` are not beside an app.
 *
 * `site` is a plain string rather than the id union, because reaching into
 * `src/` from here would run the config module's own check while Next is still
 * loading this file, before anything has set the variable it checks. An
 * unknown value fails that check moments later, which is where it reads best.
 */
export function siteNextConfig(site: string, appDir: string): NextConfig {
  // The i18n config is found by string rather than by import, and relative to
  // the app directory — which is both where Turbopack resolves it from and
  // where every build is entered. Moving that file means editing this line.
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
