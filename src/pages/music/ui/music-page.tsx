import { Stack } from '@mantine/core';
import type { ReactNode } from 'react';

import { SITE_ID } from '@/shared/config';
import { findFeed } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { type MusicAlbum, scriptSample } from '@/shared/music-catalogue';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumArtist, albumCover, albumTitle } from '../lib/albums';
import { projectName } from '../lib/artists';
import {
  albumDetail,
  albumWipNote,
  catalogueAlbums,
  catalogueArtists,
  newestAlbums,
  wipApart,
} from '../lib/catalogue';
import { catalogueSize } from '../lib/duration';
import type { IndexPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, tabPath } from '../lib/music-urls';
import { artistPicture } from '../lib/pictures';
import { catalogueSongs, songTrack, trackNames } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueTabs } from './catalogue-tabs';
import { MusicNav } from './music-nav';
import { MusicSection } from './music-section';
import { SongList } from './song-list';
import { Spelling } from './spelling';

/**
 * The section's front page: the artists, each a way into its albums and songs,
 * or every album, those in the works last, or every song — one tab each.
 */
export function MusicPage({ locale, tab }: IndexPageProps) {
  const songs = catalogueSongs();
  const { content, names } = tabContent({ tab, locale });

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => tabPath(tab, alternate))}
          sample={scriptSample(names, locale)}
          {...{ locale }}
        />

        <MusicSection
          size={catalogueSize(
            {
              artists: catalogueArtists(songs).length,
              albums: catalogueAlbums(songs).length,
              seconds: songs.map(({ frontmatter }) => frontmatter.seconds),
            },
            locale,
            loadMessages(locale).music.size,
          )}
          {...{ locale }}
        />

        <Stack gap={24}>
          <CatalogueTabs {...{ tab, locale }} />

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
function tabContent({ tab, locale }: IndexPageProps): {
  content: ReactNode;
  names: string[];
} {
  const songs = catalogueSongs();

  switch (tab) {
    case 'artists': {
      const tiles = catalogueArtists(songs).map((artist) => ({
        href: artistPath(artist, locale),
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
      const albumTile = (album: MusicAlbum) => {
        const artist = projectName(albumArtist(album, locale), locale);

        return {
          href: albumPath(album, locale),
          slug: album,
          name: albumTitle(album, locale),
          artist,
          cover: albumCover(album),
          detail: (
            <>
              <Spelling {...artist} />
              {albumDetail(album, locale, songs).map((fact) => ` · ${fact}`)}
            </>
          ),
          wip: albumWipNote(album, locale),
        };
      };
      const { finished, wip } = wipApart(newestAlbums(songs));
      const tiles = finished.map((album) => albumTile(album));
      const wipTiles = wip.map((album) => albumTile(album));

      return {
        content: (
          <Stack gap={48}>
            <CatalogueGrid {...{ tiles }} />

            <CatalogueGrid
              title={loadMessages(locale).music.wip.heading}
              tiles={wipTiles}
            />
          </Stack>
        ),
        names: [...tiles, ...wipTiles].flatMap(({ name, artist }) => [
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
