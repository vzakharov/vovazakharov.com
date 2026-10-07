import { Stack } from '@mantine/core';

import { MUSIC_ALBUMS, projectName } from '@/shared/config';
import { byLocale, inLocale, loadMessages } from '@/shared/i18n';
import { BackToHome, PageShell } from '@/shared/ui';

import { artistAlbums, catalogueArtists } from '../lib/catalogue';
import type { CataloguePageProps } from '../lib/music-route-params';
import { artistPath, indexPath } from '../lib/music-urls';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueList } from './catalogue-list';
import { MusicNav } from './music-nav';
import { MusicSection } from './music-section';
import { SongList } from './song-list';

/** The section's front page: the artists first, then every song in the catalogue. */
export function MusicPage({ locale, everything }: CataloguePageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => indexPath(catalogue, alternate))}
          {...{ locale }}
        />

        <MusicSection {...{ locale }} />

        <CatalogueList
          title={messages.artists}
          entries={catalogueArtists(songs).map((artist) => ({
            href: artistPath(artist, catalogue, locale),
            label: projectName(artist, locale),
            detail: artistAlbums(artist, locale, songs)
              .map((album) => inLocale(MUSIC_ALBUMS[album].title, locale))
              .join(' · '),
          }))}
        />

        <SongList
          tracks={songs.map((song) => songTrack(song))}
          {...{ locale }}
        />

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
