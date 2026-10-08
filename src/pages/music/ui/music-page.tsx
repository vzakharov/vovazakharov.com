import { Stack } from '@mantine/core';

import { albumTitle, projectName } from '@/shared/config';
import { byLocale, loadMessages } from '@/shared/i18n';
import { BackToHome, PageShell } from '@/shared/ui';

import { artistAlbums, catalogueArtists } from '../lib/catalogue';
import type { CataloguePageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
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

        <CatalogueGrid
          title={messages.artists}
          tiles={catalogueArtists(songs).map((artist) => ({
            href: artistPath(artist, catalogue, locale),
            label: projectName(artist, locale),
            links: artistAlbums(artist, locale, songs).map((album) => ({
              href: albumPath(album, catalogue, locale),
              label: albumTitle(album, locale),
            })),
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
