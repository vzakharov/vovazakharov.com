import { Anchor, Box, Group, Stack, Text, Title } from '@mantine/core';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';

import {
  billing,
  MUSIC_ALBUMS,
  SITE_CONFIG,
  songRepositoryUrl,
} from '@/shared/config';
import {
  documentMonth,
  formatDocumentMonth,
  loadDocument,
  localizeSong,
  renderDocument,
  type Slugged,
  type SongDocument,
  songLyrics,
  SONGS,
} from '@/shared/content';
import {
  byLocale,
  loadMessages,
  type Locale,
  LOCALES,
  routing,
  type WithLocale,
} from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';
import {
  BackToHome,
  FileLink,
  hoverDim,
  InternalLink,
  PageShell,
  ProseContent,
} from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { musicPath, songPath } from '../lib/music-urls';
import { songQueueIndex } from '../lib/songs';
import { LocaleChips } from './locale-chips';
import { Lyrics } from './lyrics';
import { TrackButton } from './track-button';

export type SongPageProps = WithLocale & Slugged;

function resolve(slug: string): SongDocument {
  const document = loadDocument(SONGS, slug);

  if (!document) notFound();

  return document;
}

/**
 * The fully-specified address is canonical, so the locale-less alias defers to
 * it rather than competing. The `hreflang` alternates are load-bearing rather
 * than belt-and-braces: with the locale in a trailing segment, nothing else in
 * the URL names the language.
 */
export function generateSongMetadata({ slug, locale }: SongPageProps) {
  const { title, description } = localizeSong(
    resolve(slug),
    locale,
  ).frontmatter;

  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    description,
    path: songPath(slug, locale),
    canonical: songPath(slug, locale),
    languages: {
      ...Object.fromEntries(
        LOCALES.map((alternate) => [alternate, songPath(slug, alternate)]),
      ),
      'x-default': songPath(slug, routing.defaultLocale),
    },
    ogType: 'article',
  });
}

/**
 * The line under the title: what a listener would want to know about the
 * recording before playing it, in the order they would ask. Empty entries drop
 * out, so a song with no album and no co-author shows neither.
 */
function songFacts(document: SongDocument, locale: Locale): string[] {
  const { language, album, credits, project, seconds } = document.frontmatter;
  const messages = loadMessages(locale).music;

  return [
    billing(project),
    messages.language[language],
    album &&
      messages.album.replace('{album}', MUSIC_ALBUMS[album].title[locale]),
    credits?.lyrics &&
      `${messages.credits.lyrics}: ${credits.lyrics.join(', ')}`,
    credits?.music && `${messages.credits.music}: ${credits.music.join(', ')}`,
    formatDuration(seconds),
  ].flatMap((fact) => fact ?? []);
}

export async function SongPage({ slug, locale }: SongPageProps) {
  const document = resolve(slug);
  const localized = localizeSong(document, locale);
  const { html } = await renderDocument(localized);
  const { title, description, date, repo, explicit } = localized.frontmatter;
  const messages = loadMessages(locale).music;
  const lyrics = songLyrics(document, locale);

  return (
    <PageShell>
      <Stack gap={48}>
        <Group component="nav" justify="space-between">
          <InternalLink href={musicPath(locale)} size="sm" className={hoverDim}>
            ← {messages.back}
          </InternalLink>
          <LocaleChips
            hrefs={byLocale((alternate) => songPath(slug, alternate))}
            {...{ locale }}
          />
        </Group>

        <Box component="header">
          <Stack gap={24}>
            <Group gap={16} wrap="nowrap" align="center">
              {/* The queue's own index, so the header's play button and the
                  index page's rows drive one list. */}
              <TrackButton track={songQueueIndex(slug)} {...{ title }} />
              <Title order={1}>
                {title}
                {explicit && (
                  <Text
                    component="span"
                    inherit
                    opacity={0.6}
                    title={messages.explicit}
                  >
                    {' '}
                    🅴
                  </Text>
                )}
              </Title>
            </Group>

            <Text size="lg" lh={1.625} opacity={0.8}>
              {description}
            </Text>

            <Group component="p" gap={12} wrap="wrap" fz="sm" opacity={0.7}>
              <time dateTime={documentMonth(date)}>
                {formatDocumentMonth(date, locale)}
              </time>
              {songFacts(document, locale).map((fact) => (
                <Fragment key={fact}>
                  <span aria-hidden>·</span>
                  <span>{fact}</span>
                </Fragment>
              ))}
            </Group>

            <Group gap={16} wrap="wrap">
              <FileLink {...localized.markdown}>.md</FileLink>
              <Anchor
                href={songRepositoryUrl(repo)}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                className={hoverDim}
              >
                {messages.source}
              </Anchor>
            </Group>
          </Stack>
        </Box>

        <ProseContent {...{ html }} />

        {lyrics && <Lyrics {...{ lyrics, locale }} />}

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
