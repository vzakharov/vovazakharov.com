import { Stack } from '@mantine/core';

import { byLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import { PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  artistDiscography,
  artistInfo,
  artistPath,
  artistSongs,
  catalogueInfo,
  musicPath,
  scriptSample,
  songPicture,
  songTrack,
  trackNames,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';

import { catalogueSize } from '../lib/duration';
import type { ArtistPageProps } from '../lib/music-route-params';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueHeader } from './catalogue-header';
import { HookLine } from './hook-line';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';
import { Story } from './story';

/**
 * One project: its own text where it has one, the albums it put out, then its
 * singles, then every song it is billed on.
 */
export function ArtistPage({ artist, locale }: ArtistPageProps) {
  const catalogue = catalogueInfo();
  const copy = messages(locale);
  const { name, gloss, text } = artistInfo(artist, locale);
  const { albums, singles } = artistDiscography(
    artist,
    locale,
    catalogue.songs,
  );
  const billed = artistSongs(artist, catalogue.songs);
  const albumTiles = albums.map((album) => {
    const { detail, ...tile } = catalogue.album(album, locale);

    return {
      ...pick(tile, 'href', 'slug', 'name', 'cover', 'wip'),
      detail: detail.join(' · '),
    };
  });
  const singleTiles = singles.map((single) => {
    const { titles, routes } = songTrack(single);

    return {
      href: routes[locale],
      ...pick(single, 'slug'),
      name: titles[locale],
      cover: songPicture(single),
      detail: String(single.frontmatter.date.getUTCFullYear()),
    };
  });
  const tracks = billed.map((song) => songTrack(song));
  const sample = scriptSample(
    [
      name.original,
      ...[...albumTiles, ...singleTiles].map((tile) => tile.name.original),
      ...trackNames(tracks, locale),
    ],
    locale,
  );

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: musicPath(locale), label: copy.back }}
          hrefs={byLocale((alternate) => artistPath(artist, alternate))}
          {...{ locale, sample }}
        />

        <CatalogueHeader
          kind={copy.kind.artist}
          title={name}
          {...{ gloss }}
          size={catalogueSize(
            {
              albums: albums.length,
              seconds: billed.map(({ frontmatter }) => frontmatter.seconds),
            },
            locale,
            copy.size,
          )}
          {...pick(text, 'markdown')}
        >
          <HookLine>{text.hook}</HookLine>
        </CatalogueHeader>

        <Story
          {...pick(text, 'prelude', 'story')}
          {...pick(copy, 'behindTheScenes', 'preludeHeadings', 'readMore')}
        />

        <CatalogueGrid title={copy.albums} tiles={albumTiles} />

        <CatalogueGrid title={copy.singles} tiles={singleTiles} />

        <SongList {...pick(copy, 'title')} {...{ tracks, locale }} />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
