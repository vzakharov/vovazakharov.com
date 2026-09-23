// How this repo is entered, beyond what knip's plugins read off their own configs
// and `package.json` scripts. A false "unused file" is an entry missing here, and
// is fixed here — never by exempting the file.

import type { KnipConfig } from 'knip';

export default {
  entry: [
    // Reached through `scripts/in-site.sh` or a hook rather than a script knip can
    // parse, so no plugin finds them.
    'scripts/*.ts',
    // Steiger has no knip plugin.
    'steiger.config.mjs',
    // Named by string in `apps/site-next-config.ts`, as `createNextIntlPlugin` wants.
    'src/shared/i18n/request.ts',
  ],
  // The plugin looks for `app/` and `next.config.*` at the root; the three sites
  // hold theirs one level down. The file names are the App Router's conventions,
  // as the plugin's own defaults list them.
  next: {
    config: ['apps/*/next.config.ts'],
    entry: [
      'apps/*/app/**/{layout,page,template,default,loading,error,global-error,not-found,global-not-found,forbidden,unauthorized,route}.{ts,tsx}',
      'apps/*/app/**/{sitemap,robots,manifest,icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx}',
    ],
  },
  // SCSS is in: knip follows `@use` and `@forward`, so a stylesheet nothing reaches
  // is reported like any other file.
  project: ['**/*.{ts,tsx,mjs,scss}'],
  ignoreDependencies: [
    // Imported only by the declarations `@feature-sliced/steiger-plugin` ships;
    // without it every type they carry reads as `any` (f00deba).
    '@steiger/toolkit',
  ],
} satisfies KnipConfig;
