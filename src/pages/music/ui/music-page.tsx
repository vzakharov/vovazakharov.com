import { Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { BackToHome, PageShell } from '@/shared/ui';

import { albumArtist, albumCover, albumTitle } from '../lib/albums';
import { albumYears, catalogueArtists, newestAlbums } from '../lib/catalogue';
import type { IndexPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, tabPath } from '../lib/music-urls';
import { artistImage, projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueTabs, type CatalogueTabsProps } from './catalogue-tabs';
import { MusicNav } from './music-nav';
import { MusicSection } from './music-section';
import { SongList } from './song-list';

/**
 * The section's front page: the artists, each a way into its albums and songs,
 * or every album, or every song — one tab each.
 */
export function MusicPage({ locale, everything, tab }: IndexPageProps) {
  const catalogue = { everything };
  const messages = loadMessages(locale).music;

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => tabPath(tab, catalogue, alternate))}
          {...{ locale }}
        />

        <MusicSection {...{ locale }} />

        <Stack gap={24}>
          <CatalogueTabs {...{ tab, catalogue, locale }} />

          <TabContent {...{ tab, catalogue, locale }} />
        </Stack>

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}

function TabContent({ tab, catalogue, locale }: CatalogueTabsProps) {
  const songs = catalogueSongs(catalogue);

  switch (tab) {
    case 'artists': {
      return (
        <CatalogueGrid
          tiles={catalogueArtists(songs).map((artist) => ({
            href: artistPath(artist, catalogue, locale),
            label: projectName(artist, locale),
            cover: artistImage(artist),
          }))}
        />
      );
    }
    case 'albums': {
      return (
        <CatalogueGrid
          tiles={newestAlbums(songs).map((album) => ({
            href: albumPath(album, catalogue, locale),
            label: albumTitle(album, locale),
            cover: albumCover(album),
            detail: `${projectName(albumArtist(album, locale), locale)} · ${albumYears(album, songs)}`,
          }))}
        />
      );
    }
    case 'songs': {
      return (
        <SongList
          tracks={songs.map((song) => songTrack(song))}
          {...{ locale }}
        />
      );
    }
    default: {
      return tab satisfies never;
    }
  }
}
