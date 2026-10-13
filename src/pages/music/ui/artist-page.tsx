import { Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumCover, albumTitle } from '../lib/albums';
import {
  albumDetail,
  albumWipNote,
  artistDiscography,
  artistSongs,
} from '../lib/catalogue';
import { artistText } from '../lib/catalogue-text';
import { catalogueSize } from '../lib/duration';
import type { ArtistPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { songPicture } from '../lib/pictures';
import { projectGloss, projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
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
export function ArtistPage({ artist, locale, everything }: ArtistPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;
  const text = artistText(artist, locale);
  const { albums, singles } = artistDiscography(artist, locale, songs);
  const billed = artistSongs(artist, songs);

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
          gloss={projectGloss(artist, locale)}
          size={catalogueSize(
            {
              albums: albums.length,
              seconds: billed.map(({ frontmatter }) => frontmatter.seconds),
            },
            locale,
            messages.size,
          )}
          markdown={text?.markdown}
        >
          <HookLine>{text?.hook}</HookLine>
        </CatalogueHeader>

        {text && (
          <Story
            {...pick(text, 'universe', 'story')}
            {...pick(messages, 'makingOf', 'readMore')}
          />
        )}

        <CatalogueGrid
          title={messages.albums}
          tiles={albums.map((album) => ({
            href: albumPath(album, catalogue, locale),
            slug: album,
            label: albumTitle(album, locale),
            cover: albumCover(album),
            detail: albumDetail(album, locale, songs).join(' · '),
            wip: albumWipNote(album, locale),
          }))}
        />

        <CatalogueGrid
          title={messages.singles}
          tiles={singles.map((single) => {
            const { titles, routes } = songTrack(single);
            const { title, transliterated } = titles[locale];

            return {
              href: routes[locale],
              ...pick(single, 'slug'),
              label: title,
              transliterated,
              cover: songPicture(single),
              detail: String(single.frontmatter.date.getUTCFullYear()),
            };
          })}
        />

        <SongList
          {...pick(messages, 'title')}
          tracks={billed.map((song) => songTrack(song))}
          {...{ locale }}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
