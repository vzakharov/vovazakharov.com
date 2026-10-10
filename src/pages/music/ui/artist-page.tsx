import { Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { LocaleFonts, PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumTitle } from '../lib/albums';
import { albumYears, artistReleases, artistSongs } from '../lib/catalogue';
import type { ArtistPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { releasePicture } from '../lib/pictures';
import { projectGloss, projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueHeader } from './catalogue-header';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';

/** One project: the albums and singles it put out, then every song it is billed on. */
export function ArtistPage({ artist, locale, everything }: ArtistPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;

  return (
    <PageShell>
      <LocaleFonts {...{ locale }} />
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
        />

        <CatalogueGrid
          title={messages.albums}
          tiles={artistReleases(artist, locale, songs).map((release) => {
            const cover = releasePicture(release);

            if ('album' in release) {
              const { album } = release;

              return {
                href: albumPath(album, catalogue, locale),
                label: albumTitle(album, locale),
                cover,
                detail: albumYears(album, songs),
              };
            }

            const { titles, routes } = songTrack(release.single);

            const { title, transliterated } = titles[locale];

            return {
              href: routes[locale],
              label: title,
              transliterated,
              cover,
              detail: `${messages.single} · ${String(release.single.frontmatter.date.getUTCFullYear())}`,
            };
          })}
        />

        <SongList
          {...pick(messages, 'title')}
          tracks={artistSongs(artist, songs).map((song) => songTrack(song))}
          {...{ locale }}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
