import { Stack } from '@mantine/core';
import type { ReactNode } from 'react';

import { SITE_ID } from '@/kernel/shared/config';
import { byLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import { PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import { findFeed } from '@/blog/shared/content';

import {
  type CatalogueInfo,
  catalogueInfo,
  type MusicAlbum,
  scriptSample,
  songTrack,
  tabPath,
  trackNames,
  wipApart,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';
import { Spelling } from '@/music/shared/ui';
import { CatalogueGrid } from '@/music/widgets/catalogue-grid';
import { MusicNav } from '@/music/widgets/music-nav';
import { SongList } from '@/music/widgets/song-list';

import type { IndexPageProps } from '../lib/page-props';
import { CatalogueTabs } from './catalogue-tabs';
import { MusicSection } from './music-section';

/**
 * The section's front page: the artists, each a way into its albums and songs,
 * or every album, those in the works last, or every song — one tab each.
 */
export function MusicPage({ locale, tab }: IndexPageProps) {
  const catalogue = catalogueInfo();
  const { content, names } = tabContent({ tab, locale }, catalogue);

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => tabPath(tab, alternate))}
          sample={scriptSample(names, locale)}
          {...{ locale }}
        />

        <MusicSection size={catalogue.size(locale)} {...{ locale }} />

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
      const albumTile = (album: MusicAlbum) => {
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
      };
      const { finished, wip } = wipApart(albums);
      const tiles = finished.map((album) => albumTile(album));
      const wipTiles = wip.map((album) => albumTile(album));

      return {
        content: (
          <Stack gap={48}>
            <CatalogueGrid {...{ tiles }} />

            <CatalogueGrid
              title={messages(locale).wip.heading}
              tiles={wipTiles}
            />
          </Stack>
        ),
        names: [...tiles, ...wipTiles].flatMap(({ name, artist }) => [
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
