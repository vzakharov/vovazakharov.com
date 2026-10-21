// How this repo is entered, beyond what knip's plugins read off their own configs
// and `package.json` scripts. A false "unused file" is an entry missing here, and
// is fixed here — never by exempting the file.

import type { KnipConfig } from 'knip';

export default {
  entry: [
    // Reached through `scripts/in-site.sh` or a hook rather than a script knip can
    // parse, so no plugin finds them.
    'scripts/*.ts',
    'src/*/scripts/*.ts',
    // Steiger has no knip plugin.
    'steiger.config.mjs',
    // Named by string in `sites/site-next-config.ts`, as `createNextIntlPlugin` wants.
    'src/kernel/shared/i18n/request.ts',
  ],
  // The plugin looks for `app/` and `next.config.*` at the root; the three sites
  // hold theirs one level down. The file names are the App Router's conventions,
  // as the plugin's own defaults list them.
  next: {
    config: ['sites/*/next.config.ts'],
    entry: [
      'sites/*/app/**/{layout,page,template,default,loading,error,global-error,not-found,global-not-found,forbidden,unauthorized,route}.{ts,tsx}',
      'sites/*/app/**/{sitemap,robots,manifest,icon,apple-icon,opengraph-image,twitter-image}.{ts,tsx}',
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
  ignoreBinaries: [
    // A system tool `src/music/scripts/lib/song-tagging.ts` decodes with, to prove tagging left
    // the audio alone. No npm package stands in: the ones that ship it download the
    // binary in an install script, which pnpm here does not run.
    'ffmpeg',
  ],
} satisfies KnipConfig;
