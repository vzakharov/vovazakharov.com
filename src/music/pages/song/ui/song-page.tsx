import { Box, Group, Stack, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

import { pageFile, SITE_CONFIG } from '@/kernel/shared/config';
import type { WithLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';
import { localizedAddresses } from '@/kernel/shared/seo/index.server-only';
import type { Routed } from '@/kernel/shared/typings';

import { FileLink, hoverDim, PageShell, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import type { Slugged } from '@/blog/shared/content';
import { constructMetadata } from '@/blog/shared/seo';

import {
  listSongPages,
  musicPath,
  pictureCard,
  scriptSample,
  songDownloads,
  songInfo,
  type SongPageEntry,
  songPath,
  spelledText,
  textHook,
  trackNames,
  wordsText,
} from '@/music/shared/catalogue';
import {
  type SongFile,
  songRepositoryUrl,
} from '@/music/shared/catalogue/index.node-safe';
import { messages } from '@/music/shared/i18n';
import { listenTitle } from '@/music/shared/seo';
import { Spelling, TitleGlossLine } from '@/music/shared/ui';
import { CoverHead } from '@/music/entities/cover';
import { HookLine } from '@/music/entities/hook';
import { ExplicitBadge } from '@/music/entities/song';
import { SongPlayButton } from '@/music/features/player';
import { MusicNav } from '@/music/widgets/music-nav';
import { Story } from '@/music/widgets/story';

import { songVideo } from '../lib/song-video';
import { Lyrics } from './lyrics';
import { SongCredits } from './song-credits';
import { SongByline, SongFacts } from './song-facts';
import { SongVideoButton } from './song-video-button';

export type SongPageProps = WithLocale & Slugged;

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
  const { title, localized, picture } = songInfo(resolve(slug), locale);
  const { hook, hidden } = localized.frontmatter;
  const name = spelledText(title);

  return constructMetadata({
    title: `${name} - ${SITE_CONFIG.name}`,
    ogTitle: listenTitle(name, locale),
    description: hook === undefined ? undefined : textHook(hook),
    path: songPath(slug, locale),
    ...localizedAddresses((alternate) => songPath(slug, alternate), locale),
    ogType: 'article',
    ...pictureCard(picture),
    hidden,
  });
}

export function SongPage({ slug, locale }: SongPageProps) {
  const { document, album } = resolve(slug);
  const {
    title: spelled,
    localized,
    picture,
    track,
    lyrics,
    prelude,
  } = songInfo({ document, album }, locale);
  const { gloss, hook, repo, explicit, cribNote } = localized.frontmatter;
  const title = <Spelling {...spelled} />;
  const copy = messages(locale);
  const sample = scriptSample(
    [
      ...trackNames([track], locale),
      ...(lyrics?.transliteration === undefined
        ? []
        : [wordsText(lyrics.stanzas)]),
    ],
    locale,
  );
  const video = songVideo(document, locale);

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: musicPath(locale), label: copy.back }}
          hrefs={track.routes}
          {...{ locale, sample }}
        />

        <Box component="header">
          <Stack gap={24}>
            <CoverHead
              {...{ picture }}
              zoom={{
                enlargeLabel: copy.enlargeCover,
                closeLabel: copy.closeCover,
              }}
              kicker={<SongByline {...{ document, album, locale }} />}
            >
              <Stack gap={8} align="flex-start">
                <Title order={1}>
                  {title}
                  {explicit && <ExplicitBadge label={copy.explicit} />}
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
                      labels={copy.video}
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
                <TextLink
                  href={songRepositoryUrl(repo)}
                  size="sm"
                  className={hoverDim}
                >
                  {copy.source}
                </TextLink>
              </Group>
            </Group>
          </Stack>
        </Box>

        {/* Held behind «…» only above words, which a long story would keep
            the reader from. */}
        <Story
          {...{ prelude }}
          story={localized.body === '' ? undefined : localized}
          {...pick(copy, 'behindTheScenes', 'preludeHeadings')}
          readMore={lyrics && copy.readMore}
        />

        {lyrics && (
          <Lyrics
            {...{ lyrics, locale, cribNote }}
            {...pick(document, 'fileName')}
          />
        )}

        <SongCredits
          {...{ locale }}
          {...pick(document.frontmatter, 'credits', 'language')}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
