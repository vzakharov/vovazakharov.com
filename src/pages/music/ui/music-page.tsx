import { Stack, Text } from '@mantine/core';

import { SITE_ID } from '@/shared/config';
import { findFeed } from '@/shared/content';
import { byLocale, loadMessages, type Locale } from '@/shared/i18n';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumArtist, albumCover, albumTitle } from '../lib/albums';
import {
  albumDetail,
  catalogueAlbums,
  catalogueArtists,
  newestAlbums,
} from '../lib/catalogue';
import { type CatalogueSize, catalogueSize } from '../lib/duration';
import type { IndexPageProps } from '../lib/music-route-params';
import {
  albumPath,
  artistPath,
  type CatalogueTab,
  tabPath,
} from '../lib/music-urls';
import { artistPicture } from '../lib/pictures';
import { projectName } from '../lib/projects';
import type { SongDocument } from '../lib/song-text';
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
  const songs = catalogueSongs(catalogue);

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => tabPath(tab, catalogue, alternate))}
          {...{ locale }}
        />

        <MusicSection {...{ locale }} />

        <Stack gap={24}>
          <Stack gap={8}>
            <CatalogueTabs {...{ tab, catalogue, locale }} />

            <Text size="sm" opacity={0.7}>
              {tabSize(tab, songs, locale)}
            </Text>
          </Stack>

          <TabContent {...{ tab, catalogue, locale }} />
        </Stack>

        <SiteFooter
          {...{ locale }}
          feed={findFeed(SITE_ID, 'music', locale).route}
        />
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
            href: albumPath(album, catalogue, locale),
            slug: album,
            label: albumTitle(album, locale),
            cover: albumCover(album),
            detail: [
              projectName(albumArtist(album, locale), locale),
              ...albumDetail(album, locale, songs),
            ].join(' · '),
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

/**
 * The size of what the tab lists, and of everything it is a way into: the
 * artists tab is the front page, so it counts the whole catalogue.
 */
function tabSize(
  tab: CatalogueTab,
  songs: readonly SongDocument[],
  locale: Locale,
): string {
  const albums = catalogueAlbums(songs).length;
  const ahead: Record<CatalogueTab, Omit<CatalogueSize, 'seconds'>> = {
    artists: { artists: catalogueArtists(songs).length, albums },
    albums: { albums },
    songs: {},
  };

  return catalogueSize(
    {
      ...ahead[tab],
      seconds: songs.map(({ frontmatter }) => frontmatter.seconds),
    },
    locale,
    loadMessages(locale).music.size,
  );
}
