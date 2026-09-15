import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

// Found by string rather than by import, and relative to this directory, which
// is both where Turbopack resolves the alias from and where every build is
// entered. Moving the file means editing this line and its twin in the other
// app.
const withNextIntl = createNextIntlPlugin('../../src/shared/i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '',
  images: {
    unoptimized: true,
  },
  // Which site this build is, pinned here so no invocation can forget it —
  // `src/shared/config` refuses to load without it.
  env: {
    NEXT_PUBLIC_SITE: 'vova',
  },
  // Stated rather than inferred: the lockfile and `node_modules` are a level up,
  // and Turbopack picks a workspace root by looking for them.
  turbopack: {
    root: path.join(import.meta.dirname, '..', '..'),
  },
};

export default withNextIntl(nextConfig);
