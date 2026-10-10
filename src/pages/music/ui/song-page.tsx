import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

import { pageFile, SITE_CONFIG } from '@/shared/config';
import { isListed, renderDocument } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';
import { FileLink, hoverDim, PageShell, TextLink } from '@/shared/ui';

import { ProseContent } from '@/entities/document';

import { SiteFooter } from '@/widgets/site-footer';

import type { SongPageProps } from '../lib/music-route-params';
import { indexPath, songPath } from '../lib/music-urls';
import { pictureCard, songPicture } from '../lib/pictures';
import { songRepositoryUrl } from '../lib/projects';
import { localizeSong, songLyrics } from '../lib/song-text';
import { songVideo } from '../lib/song-video';
import { listSongPages, type SongPageEntry, songTrack } from '../lib/songs';
import { titleGloss } from '../lib/title-gloss';
import { CoverHead } from './cover-head';
import { ExplicitBadge } from './explicit-badge';
import { Lyrics } from './lyrics';
import { MusicNav } from './music-nav';
import { ReadMore } from './read-more';
import { SongCredits } from './song-credits';
import { SongByline, SongFacts } from './song-facts';
import { SongName } from './song-name';
import { SongPlayButton } from './song-play-button';
import { SongVideoButton } from './song-video-button';
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
  const { title, description, hidden } = localizeSong(
    document,
    locale,
  ).frontmatter;

  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    description,
    path: songPath(slug, locale),
    ...localizedAddresses((alternate) => songPath(slug, alternate), locale),
    ogType: 'article',
    ...pictureCard(songPicture(document, album)),
    hidden,
  });
}

export async function SongPage({ slug, locale }: SongPageProps) {
  const { document, album } = resolve(slug);
  const localized = localizeSong(document, locale);
  const { tree } = await renderDocument(localized);
  // A hidden song's artists and album may have no public page, so its links
  // stay in the whole catalogue.
  const catalogue = { everything: !isListed(document) };
  const {
    title,
    titleTransliterated,
    description,
    repo,
    explicit,
    cribNote,
    audio,
  } = localized.frontmatter;
  const messages = loadMessages(locale).music;
  const lyrics = songLyrics(document, locale);
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
                  <SongName
                    {...{ title }}
                    transliterated={titleTransliterated}
                  />
                  {explicit && <ExplicitBadge label={messages.explicit} />}
                </Title>
                <TitleGlossLine
                  gloss={titleGloss(localized.frontmatter, locale)}
                />
                {/* The same track a song list's row plays, so both drive one
                    queue — which a hidden song joins only once played here. */}
                <Group mt={12} gap={8}>
                  <SongPlayButton track={songTrack(document, album)} />
                  {video && (
                    <SongVideoButton
                      {...video}
                      {...{ slug }}
                      heading={
                        <SongName
                          {...{ title }}
                          transliterated={titleTransliterated}
                        />
                      }
                      labels={messages.video}
                    />
                  )}
                </Group>
              </Stack>
            </CoverHead>

            <Text size="lg" lh={1.625} opacity={0.8}>
              {description}
            </Text>

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

        <ReadMore label={messages.readMore}>
          <ProseContent {...{ tree }} />
        </ReadMore>

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
