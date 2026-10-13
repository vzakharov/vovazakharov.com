import { Stack } from '@mantine/core';
import type { ReactNode } from 'react';

import { SITE_ID } from '@/shared/config';
import { findFeed } from '@/shared/content';
import { byLocale } from '@/shared/i18n';
import { scriptSample } from '@/shared/music-catalogue';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumArtist, albumCover, albumTitle } from '../lib/albums';
import { albumYears, catalogueArtists, newestAlbums } from '../lib/catalogue';
import type { IndexPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, tabPath } from '../lib/music-urls';
import { artistPicture } from '../lib/pictures';
import { projectName } from '../lib/projects';
import { catalogueSongs, songTrack, trackNames } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueTabs, type CatalogueTabsProps } from './catalogue-tabs';
import { MusicNav } from './music-nav';
import { MusicSection } from './music-section';
import { SongList } from './song-list';
import { Spelling } from './spelling';

/**
 * The section's front page: the artists, each a way into its albums and songs,
 * or every album, or every song — one tab each.
 */
export function MusicPage({ locale, everything, tab }: IndexPageProps) {
  const catalogue = { everything };
  const { content, names } = tabContent({ tab, catalogue, locale });

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => tabPath(tab, catalogue, alternate))}
          sample={scriptSample(names, locale)}
          {...{ locale }}
        />

        <MusicSection {...{ locale }} />

        <Stack gap={24}>
          <CatalogueTabs {...{ tab, catalogue, locale }} />

          {content}
        </Stack>

        <SiteFooter
          {...{ locale }}
          feed={findFeed(SITE_ID, 'music', locale).route}
        />
      </Stack>
    </PageShell>
  );
}

/** The tab's list, and the names it shows for `scriptSample` to read. */
function tabContent({ tab, catalogue, locale }: CatalogueTabsProps): {
  content: ReactNode;
  names: string[];
} {
  const songs = catalogueSongs(catalogue);

  switch (tab) {
    case 'artists': {
      const tiles = catalogueArtists(songs).map((artist) => ({
        href: artistPath(artist, catalogue, locale),
        slug: artist,
        name: projectName(artist, locale),
        cover: artistPicture(artist, locale, songs),
      }));

      return {
        content: <CatalogueGrid {...{ tiles }} />,
        names: tiles.map(({ name }) => name.original),
      };
    }
    case 'albums': {
      const tiles = newestAlbums(songs).map((album) => {
        const artist = projectName(albumArtist(album, locale), locale);

        return {
          href: albumPath(album, catalogue, locale),
          slug: album,
          name: albumTitle(album, locale),
          artist,
          cover: albumCover(album),
          detail: (
            <>
              <Spelling {...artist} />
              {` · ${albumYears(album, songs)}`}
            </>
          ),
        };
      });

      return {
        content: <CatalogueGrid {...{ tiles }} />,
        names: tiles.flatMap(({ name, artist }) => [
          name.original,
          artist.original,
        ]),
      };
    }
    case 'songs': {
      const tracks = songs.map((song) => songTrack(song));

      return {
        content: <SongList {...{ tracks, locale }} />,
        names: trackNames(tracks, locale),
      };
    }
    default: {
      return tab satisfies never;
    }
  }
}
