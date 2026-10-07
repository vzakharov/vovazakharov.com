import { Stack } from '@mantine/core';

import { albumTitle, projectName } from '@/shared/config';
import { byLocale, loadMessages } from '@/shared/i18n';
import { BackToHome, PageShell } from '@/shared/ui';

import { albumYears, artistAlbums, artistSongs } from '../lib/catalogue';
import type { ArtistPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueHeader } from './catalogue-header';
import { CatalogueList } from './catalogue-list';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';

/** One project: the albums it put out, then every song it is billed on. */
export function ArtistPage({ artist, locale, everything }: ArtistPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: indexPath(catalogue, locale), label: messages.back }}
          hrefs={byLocale((alternate) =>
            artistPath(artist, catalogue, alternate),
          )}
          {...{ locale }}
        />

        <CatalogueHeader
          kind={messages.kind.artist}
          title={projectName(artist, locale)}
        />

        <CatalogueList
          title={messages.albums}
          entries={artistAlbums(artist, locale, songs).map((album) => ({
            href: albumPath(album, catalogue, locale),
            label: albumTitle(album, locale),
            detail: albumYears(album, songs),
          }))}
        />

        <SongList
          tracks={artistSongs(artist, songs).map((song) => songTrack(song))}
          {...{ locale }}
        />

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
