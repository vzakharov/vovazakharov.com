import { Box, Group, Stack, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

import { pageFile, SITE_CONFIG } from '@/shared/config';
import type { Routed } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import {
  scriptSample,
  songTitle,
  spelledText,
  textHook,
} from '@/shared/music-catalogue';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';
import { FileLink, hoverDim, PageShell, TextLink } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { universeOf } from '../lib/catalogue-text';
import { listenTitle } from '../lib/music-metadata';
import type { SongPageProps } from '../lib/music-route-params';
import { musicPath, songPath } from '../lib/music-urls';
import { pictureCard, songPicture } from '../lib/pictures';
import { songRepositoryUrl } from '../lib/projects';
import { songDownloads } from '../lib/song-downloads';
import type { SongFile } from '../lib/song-files';
import { localizeSong, songLyrics, wordsText } from '../lib/song-text';
import { songVideo } from '../lib/song-video';
import {
  listSongPages,
  type SongPageEntry,
  songTrack,
  trackNames,
} from '../lib/songs';
import { CoverHead } from './cover-head';
import { ExplicitBadge } from './explicit-badge';
import { HookLine } from './hook-line';
import { Lyrics } from './lyrics';
import { MusicNav } from './music-nav';
import { SongCredits } from './song-credits';
import { SongByline, SongFacts } from './song-facts';
import { SongPlayButton } from './song-play-button';
import { SongVideoButton } from './song-video-button';
import { Spelling } from './spelling';
import { Story } from './story';
import { TitleGlossLine } from './title-gloss-line';

function resolve(slug: string): SongPageEntry {
  const page = listSongPages().find((entry) => entry.slug === slug);

  if (!page) notFound();

  return page;
}

type SongFileLinkProps = Routed & { file: SongFile };

/**
 * A song's file labelled by its extension. Saved under the page's name where the
 * site hosts it; another origin's opens in a tab of its own, since a browser
 * ignores `download` there, so its URL carries the name — one link per
 * spelling, shown by the reader's script as `Spelling` shows a name.
 */
function SongFileLink({ route, file }: SongFileLinkProps) {
  const { extension, href } = file;
  const label = `.${extension}`;
  const { original, latin } = href;

  if (original.startsWith('/')) {
    return (
      <FileLink {...pageFile(route, extension)} href={original}>
        {label}
      </FileLink>
    );
  }

  const link = (at: string, spelling?: keyof typeof href) => (
    <TextLink href={at} size="sm" className={hoverDim} data-spelling={spelling}>
      {label}
    </TextLink>
  );

  return latin === undefined ? (
    link(original)
  ) : (
    <>
      {link(original, 'original')}
      {link(latin, 'latin')}
    </>
  );
}

/** The alias defers to the addressed language, which is the canonical page. */
export function generateSongMetadata({ slug, locale }: SongPageProps) {
  const { document, album } = resolve(slug);
  const { hook, hidden } = localizeSong(document, locale).frontmatter;
  const title = spelledText(songTitle(document.frontmatter, locale));

  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    ogTitle: listenTitle(title, locale),
    description: hook === undefined ? undefined : textHook(hook),
    path: songPath(slug, locale),
    ...localizedAddresses((alternate) => songPath(slug, alternate), locale),
    ogType: 'article',
    ...pictureCard(songPicture(document, album)),
    hidden,
  });
}

export function SongPage({ slug, locale }: SongPageProps) {
  const { document, album } = resolve(slug);
  const localized = localizeSong(document, locale);
  const { gloss, hook, repo, explicit, cribNote } = localized.frontmatter;
  const title = <Spelling {...songTitle(document.frontmatter, locale)} />;
  const messages = loadMessages(locale).music;
  const lyrics = songLyrics(document, locale);
  const track = songTrack(document, album);
  const sample = scriptSample(
    [
      ...trackNames([track], locale),
      ...(lyrics?.transliteration === undefined
        ? []
        : [wordsText(lyrics.stanzas)]),
    ],
    locale,
  );
  const picture = songPicture(document, album);
  const video = songVideo(document, locale);

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: musicPath(locale), label: messages.back }}
          hrefs={byLocale((alternate) => songPath(slug, alternate))}
          {...{ locale, sample }}
        />

        <Box component="header">
          <Stack gap={24}>
            <CoverHead
              {...{ picture }}
              zoom={{
                enlargeLabel: messages.enlargeCover,
                closeLabel: messages.closeCover,
              }}
              kicker={<SongByline {...{ document, album, locale }} />}
            >
              <Stack gap={8} align="flex-start">
                <Title order={1}>
                  {title}
                  {explicit && <ExplicitBadge label={messages.explicit} />}
                </Title>
                <TitleGlossLine {...{ gloss }} />
                <HookLine>{hook}</HookLine>
                {/* The same track a song list's row plays, so both drive one
                    queue — which a hidden song joins only once played here. */}
                <Group mt={12} gap={8}>
                  <SongPlayButton {...{ track }} />
                  {video && (
                    <SongVideoButton
                      {...video}
                      {...{ slug }}
                      heading={title}
                      labels={messages.video}
                    />
                  )}
                </Group>
              </Stack>
            </CoverHead>

            {/* The recording's facts, and the files behind it at the far end
                of the same line. */}
            <Group justify="space-between" gap="12px 32px" wrap="wrap">
              <SongFacts {...{ document, album, locale }} />

              <Group gap={16} wrap="wrap">
                <FileLink {...localized.markdown}>.md</FileLink>
                {songDownloads(document, locale).map((file) => (
                  <SongFileLink
                    key={file.extension}
                    {...pick(localized, 'route')}
                    {...{ file }}
                  />
                ))}
                {repo !== undefined && (
                  <TextLink
                    href={songRepositoryUrl(repo)}
                    size="sm"
                    className={hoverDim}
                  >
                    {messages.source}
                  </TextLink>
                )}
              </Group>
            </Group>
          </Stack>
        </Box>

        {/* Held behind «…» only above words, which a long story would keep
            the reader from. */}
        <Story
          universe={universeOf(document, locale)}
          story={localized.body === '' ? undefined : localized}
          {...pick(messages, 'makingOf')}
          readMore={lyrics && messages.readMore}
        />

        {lyrics && <Lyrics {...{ lyrics, locale, cribNote }} />}

        <SongCredits
          {...{ locale }}
          {...pick(document.frontmatter, 'credits', 'language')}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
