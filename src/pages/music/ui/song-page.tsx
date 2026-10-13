import { Box, Group, Stack, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

import { pageFile, SITE_CONFIG } from '@/shared/config';
import { isListed } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { songTitle, spelledText, textHook } from '@/shared/music-catalogue';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';
import { FileLink, hoverDim, PageShell, TextLink } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { universeOf } from '../lib/catalogue-text';
import { listenTitle } from '../lib/music-metadata';
import type { SongPageProps } from '../lib/music-route-params';
import { indexPath, songPath } from '../lib/music-urls';
import { pictureCard, songPicture } from '../lib/pictures';
import { songRepositoryUrl } from '../lib/projects';
import { localizeSong, songLyrics } from '../lib/song-text';
import { songVideo } from '../lib/song-video';
import { listSongPages, type SongPageEntry, songTrack } from '../lib/songs';
import { CoverHead } from './cover-head';
import { ExplicitBadge } from './explicit-badge';
import { HookLine } from './hook-line';
import { Lyrics } from './lyrics';
import { MusicNav } from './music-nav';
import { ScriptSwitch } from './script-switch';
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

/**
 * The master as a file to save, labelled by its extension — only when the site
 * hosts it, since a browser ignores `download` on another origin's file.
 */
function hostedMaster(route: string, audio: string) {
  if (!audio.startsWith('/')) return;

  const extension = audio.slice(audio.lastIndexOf('.') + 1);

  return { file: { ...pageFile(route, extension), href: audio }, extension };
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
  // A hidden song's artists and album may have no public page, so its links
  // stay in the whole catalogue.
  const catalogue = { everything: !isListed(document) };
  const { gloss, hook, repo, explicit, cribNote, audio } =
    localized.frontmatter;
  const spelled = songTitle(document.frontmatter, locale);
  const title = <Spelling {...spelled} />;
  const messages = loadMessages(locale).music;
  const lyrics = songLyrics(document, locale);
  // Latin words under a title the reader can read switch too, so the title is
  // the switch wherever either has a Latin spelling.
  const switchable =
    spelled.latin !== undefined || lyrics?.transliteration !== undefined;
  const picture = songPicture(document, album);
  const master = hostedMaster(localized.route, audio);
  const video = songVideo(document, locale);

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: indexPath(catalogue, locale), label: messages.back }}
          hrefs={byLocale((alternate) => songPath(slug, alternate))}
          {...{ locale }}
        />

        <Box component="header">
          <Stack gap={24}>
            <CoverHead
              {...{ picture }}
              zoom={{
                enlargeLabel: messages.enlargeCover,
                closeLabel: messages.closeCover,
              }}
            >
              <Stack gap={8} align="flex-start">
                <SongByline {...{ document, album, catalogue, locale }} />
                <Title order={1}>
                  {switchable ? (
                    <ScriptSwitch tips={messages.titleScript}>
                      {title}
                    </ScriptSwitch>
                  ) : (
                    title
                  )}
                  {explicit && <ExplicitBadge label={messages.explicit} />}
                </Title>
                <TitleGlossLine {...{ gloss }} />
                <HookLine>{hook}</HookLine>
                {/* The same track a song list's row plays, so both drive one
                    queue — which a hidden song joins only once played here. */}
                <Group mt={12} gap={8}>
                  <SongPlayButton track={songTrack(document, album)} />
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
              <SongFacts {...{ document, album, catalogue, locale }} />

              <Group gap={16} wrap="wrap">
                <FileLink {...localized.markdown}>.md</FileLink>
                {master !== undefined && (
                  <FileLink {...master.file}>.{master.extension}</FileLink>
                )}
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
