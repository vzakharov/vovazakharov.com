import { collectionRoute } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { MUSIC_ROUTE } from '@/shared/music-catalogue';
import { PageShell } from '@/shared/ui';

import { MovedSong } from './moved-song';

/** The page every address the export lacks is answered with. */
export function NotFoundPage() {
  return (
    <PageShell>
      <MovedSong
        musicRoute={MUSIC_ROUTE}
        songsRoute={collectionRoute('music')}
        copy={byLocale((locale) => loadMessages(locale).notFound)}
      />
    </PageShell>
  );
}
