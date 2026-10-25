import { Stack } from '@mantine/core';
import type { ReactNode } from 'react';

import { SITE_ID } from '@/kernel/shared/config';
import { findFeed } from '@/kernel/shared/content';
import { byLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import { PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  type CatalogueInfo,
  catalogueInfo,
  scriptSample,
  songTrack,
  tabPath,
  trackNames,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';
import { catalogueSize } from '@/music/shared/lib/duration';
import { Spelling } from '@/music/shared/ui';

import type { IndexPageProps } from '../lib/page-props';
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
  const catalogue = catalogueInfo();
  const { songs, artists, albums } = catalogue;
  const { content, names } = tabContent({ tab, locale }, catalogue);

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
              artists: artists.length,
              albums: albums.length,
              seconds: songs.map(({ frontmatter }) => frontmatter.seconds),
            },
            locale,
            messages(locale).size,
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
function tabContent(
  { tab, locale }: IndexPageProps,
  {
    songs,
    artists,
    albums,
    album: catalogueAlbum,
    artist: catalogueArtist,
  }: CatalogueInfo,
): {
  content: ReactNode;
  names: string[];
} {
  switch (tab) {
    case 'artists': {
      const tiles = artists.map((artist) => {
        const { picture, ...tile } = catalogueArtist(artist, locale);

        return { ...pick(tile, 'href', 'slug', 'name'), cover: picture };
      });

      return {
        content: <CatalogueGrid {...{ tiles }} />,
        names: tiles.map(({ name }) => name.original),
      };
    }
    case 'albums': {
      const tiles = albums.map((album) => {
        const { artist, detail, ...tile } = catalogueAlbum(album, locale);

        return {
          ...pick(tile, 'href', 'slug', 'name', 'cover', 'wip'),
          artist,
          detail: (
            <>
              <Spelling {...artist.name} />
              {detail.map((fact) => ` · ${fact}`)}
            </>
          ),
        };
      });

      return {
        content: <CatalogueGrid {...{ tiles }} />,
        names: tiles.flatMap(({ name, artist }) => [
          name.original,
          artist.name.original,
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
