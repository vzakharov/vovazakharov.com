import { Stack } from '@mantine/core';

import { SITE_CONFIG } from '@/shared/config';
import { byLocale, loadMessages, type WithLocale } from '@/shared/i18n';
import { hookRuns, scriptSample } from '@/shared/music-catalogue';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumTitle } from '../lib/albums';
import { spokenLength } from '../lib/duration';
import { albumPath, musicPath, radioPath } from '../lib/music-urls';
import { pictureCard, RADIO_CARD, songPicture } from '../lib/pictures';
import { localizeSong } from '../lib/song-text';
import { catalogueSongs, listSongs, trackNames } from '../lib/songs';
import { MusicNav } from './music-nav';
import { OnAir, type OnAirExtras } from './on-air';

export function generateRadioMetadata({ locale }: WithLocale) {
  const { title, pitch, metaDescription } =
    loadMessages(locale).music.radioPage;

  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    ogTitle: `${title}: ${pitch}`,
    description: metaDescription,
    path: radioPath(locale),
    ...localizedAddresses(radioPath, locale),
    ...pictureCard(RADIO_CARD),
  });
}

/**
 * What the page shows beside each song the radio may play. Which one is on air
 * is decided in the browser, so every public song's travels with the page.
 */
function onAirExtras({ locale }: WithLocale): Record<string, OnAirExtras> {
  return Object.fromEntries(
    catalogueSongs().map((document) => {
      const { album, hook } = localizeSong(document, locale).frontmatter;

      return [
        document.slug,
        {
          cover: songPicture(document),
          album:
            album === null
              ? undefined
              : {
                  name: albumTitle(album, locale),
                  href: albumPath(album, locale),
                },
          hook: hook === undefined ? undefined : hookRuns(hook),
        },
      ];
    }),
  );
}

/**
 * The radio's own page: the set on the desk, built the same for every visitor,
 * with what is on air computed by the browser from its clock.
 */
export function RadioPage({ locale }: WithLocale) {
  const messages = loadMessages(locale).music;
  const tracks = listSongs();
  const cycle = tracks.reduce((sum, { seconds }) => sum + seconds, 0);
  const extras = onAirExtras({ locale });
  const sample = scriptSample(
    [
      ...trackNames(tracks, locale),
      ...Object.values(extras).flatMap(({ album }) =>
        album === undefined ? [] : [album.name.original],
      ),
    ],
    locale,
  );

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: musicPath(locale), label: messages.back }}
          hrefs={byLocale(radioPath)}
          {...{ locale, sample }}
        />

        <OnAir
          labels={messages.radioPage}
          zoom={{
            enlargeLabel: messages.enlargeCover,
            closeLabel: messages.closeCover,
          }}
          albumLine={messages.album}
          cycleLength={spokenLength(
            cycle,
            locale,
            messages.radioPage.cycleLength,
          )}
          {...{ extras }}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
