import { Stack } from '@mantine/core';

import { SITE_CONFIG } from '@/kernel/shared/config';
import { byLocale, type WithLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';
import { localizedAddresses } from '@/kernel/shared/seo/index.server-only';

import { PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import { constructMetadata } from '@/blog/shared/seo';

import {
  albumInfo,
  catalogueInfo,
  hookRuns,
  listSongs,
  localizeSong,
  musicPath,
  pictureCard,
  RADIO_CARD,
  radioPath,
  scriptSample,
  songPicture,
  trackNames,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';
import { spokenLength } from '@/music/shared/lib/duration';
import { MusicNav } from '@/music/widgets/music-nav';

import { OnAir, type OnAirExtras } from './on-air';

export function generateRadioMetadata({ locale }: WithLocale) {
  const { title, pitch, metaDescription } = messages(locale).radioPage;

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
    catalogueInfo().songs.map((document) => {
      const { album, hook } = localizeSong(document, locale).frontmatter;

      return [
        document.slug,
        {
          cover: songPicture(document),
          album:
            album === null
              ? undefined
              : pick(albumInfo(album, locale), 'name', 'href'),
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
  const copy = messages(locale);
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
          back={{ href: musicPath(locale), label: copy.back }}
          hrefs={byLocale(radioPath)}
          {...{ locale, sample }}
        />

        <OnAir
          labels={copy.radioPage}
          zoom={{
            enlargeLabel: copy.enlargeCover,
            closeLabel: copy.closeCover,
          }}
          albumLine={copy.album}
          cycleLength={spokenLength(cycle, locale, copy.radioPage.cycleLength)}
          {...{ extras }}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
