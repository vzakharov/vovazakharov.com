import { collectionRoute, MUSIC_ROUTE } from '@/kernel/shared/content';
import { byLocale } from '@/kernel/shared/i18n';

import { PageShell } from '@/shell/shared/ui';

import { messages } from '@/vova/shared/i18n';

import { MovedSong } from './moved-song';

/** The page every address the export lacks is answered with. */
export function NotFoundPage() {
  return (
    <PageShell>
      <MovedSong
        musicRoute={MUSIC_ROUTE}
        songsRoute={collectionRoute('music')}
        copy={byLocale((locale) => messages(locale).notFound)}
      />
    </PageShell>
  );
}
