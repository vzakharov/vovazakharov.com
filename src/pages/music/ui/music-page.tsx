import { Stack } from '@mantine/core';

import { SITE_ID } from '@/shared/config';
import { findFeed } from '@/shared/content';
import { byLocale } from '@/shared/i18n';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumArtist, albumCover, albumTitle } from '../lib/albums';
import { albumYears, catalogueArtists, newestAlbums } from '../lib/catalogue';
import type { IndexPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, tabPath } from '../lib/music-urls';
import { artistPicture } from '../lib/pictures';
import { projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueTabs } from './catalogue-tabs';
import { MusicNav } from './music-nav';
import { MusicSection } from './music-section';
import { SongList } from './song-list';

/**
 * The section's front page: the artists, each a way into its albums and songs,
 * or every album, or every song — one tab each.
 */
export function MusicPage({ locale, tab }: IndexPageProps) {
  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => tabPath(tab, alternate))}
          {...{ locale }}
        />

        <MusicSection {...{ locale }} />

        <Stack gap={24}>
          <CatalogueTabs {...{ tab, locale }} />

          <TabContent {...{ tab, locale }} />
        </Stack>

        <SiteFooter
          {...{ locale }}
          feed={findFeed(SITE_ID, 'music', locale).route}
        />
      </Stack>
    </PageShell>
  );
}

function TabContent({ tab, locale }: IndexPageProps) {
  const songs = catalogueSongs();

  switch (tab) {
    case 'artists': {
      return (
        <CatalogueGrid
          tiles={catalogueArtists(songs).map((artist) => ({
            href: artistPath(artist, locale),
            slug: artist,
            label: projectName(artist, locale),
            cover: artistPicture(artist, locale, songs),
          }))}
        />
      );
    }
    case 'albums': {
      return (
        <CatalogueGrid
          tiles={newestAlbums(songs).map((album) => ({
            href: albumPath(album, locale),
            slug: album,
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
