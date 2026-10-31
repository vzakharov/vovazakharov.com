import 'server-only';

import { MUSIC_COLLAGE, tabLabels, tabPath } from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';
import { catalogueMetadata } from '@/music/shared/seo';

import type { IndexPageProps } from './page-props';

/** The index, titled by its tab where that is not the artists it opens on. */
export function generateMusicMetadata(page: IndexPageProps) {
  const { metaTitle, metaDescription, ogTitleIndex } = messages(page.locale);

  return catalogueMetadata(
    page,
    page.tab === 'artists'
      ? metaTitle
      : `${metaTitle}: ${tabLabels(page.locale)[page.tab]}`,
    ogTitleIndex,
    metaDescription,
    (locale) => tabPath(page.tab, locale),
    MUSIC_COLLAGE,
  );
}
