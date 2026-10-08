import { Box, Group, Stack, Text, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

import { SITE_CONFIG } from '@/shared/config';
import {
  isListed,
  loadDocument,
  renderDocument,
  SONGS,
} from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';
import {
  BackToHome,
  FileLink,
  hoverDim,
  PageShell,
  TextLink,
} from '@/shared/ui';

import { ProseContent } from '@/entities/document';

import type { SongPageProps } from '../lib/music-route-params';
import { indexPath, songPath } from '../lib/music-urls';
import { songRepositoryUrl } from '../lib/projects';
import { localizeSong, type SongDocument, songLyrics } from '../lib/song-text';
import { songTrack } from '../lib/songs';
import { titleGloss } from '../lib/title-gloss';
import { ExplicitBadge } from './explicit-badge';
import { Lyrics } from './lyrics';
import { MusicNav } from './music-nav';
import { SongFacts } from './song-facts';
import { TrackButton } from './track-button';

function resolve(slug: string): SongDocument {
  const document = loadDocument(SONGS, slug);

  if (!document) notFound();

  return document;
}

/** The alias defers to the addressed language, which is the canonical page. */
export function generateSongMetadata({ slug, locale }: SongPageProps) {
  const { title, description, hidden } = localizeSong(
    resolve(slug),
    locale,
  ).frontmatter;

  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    description,
    path: songPath(slug, locale),
    ...localizedAddresses((alternate) => songPath(slug, alternate), locale),
    ogType: 'article',
    hidden,
  });
}

export async function SongPage({ slug, locale }: SongPageProps) {
  const document = resolve(slug);
  const localized = localizeSong(document, locale);
  const { tree } = await renderDocument(localized);
  // A hidden song's artists and album may have no public page, so its links
  // stay in the whole catalogue.
  const catalogue = { everything: !isListed(document) };
  const {
    title,
    description,
    repo,
    explicit,
    cribNote,
    titleLanguage,
    language,
  } = localized.frontmatter;
  const messages = loadMessages(locale).music;
  const lyrics = songLyrics(document, locale);
  const gloss = titleGloss(
    {
      ...localized.frontmatter,
      titleLanguage: titleLanguage ?? language[0] ?? 'instrumental',
    },
    locale,
    messages.languageShort,
  );

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
            <Group gap={16} wrap="nowrap" align="center">
              {/* The same track a song list's row plays, so both drive one
                  queue — which a hidden song joins only once played here. */}
              <TrackButton track={songTrack(document)} {...{ title }} />
              <Title order={1}>
                {title}
                {explicit && <ExplicitBadge label={messages.explicit} />}
              </Title>
            </Group>

            {(gloss.transliteration ?? gloss.translation) !== undefined && (
              <Text size="sm" opacity={0.6} mt={-16}>
                {gloss.transliteration !== undefined && (
                  <em>{gloss.transliteration}</em>
                )}
                {gloss.transliteration !== undefined &&
                  gloss.translation !== undefined &&
                  ' · '}
                {gloss.translation}
              </Text>
            )}

            <Text size="lg" lh={1.625} opacity={0.8}>
              {description}
            </Text>

            {/* The recording's facts, and the files behind it at the far end
                of the same line. */}
            <Group justify="space-between" gap="12px 32px" wrap="wrap">
              <SongFacts {...{ document, catalogue, locale }} />

              <Group gap={16} wrap="wrap">
                <FileLink {...localized.markdown}>.md</FileLink>
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

        <ProseContent {...{ tree }} />

        {lyrics && <Lyrics {...{ lyrics, locale, cribNote }} />}

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
