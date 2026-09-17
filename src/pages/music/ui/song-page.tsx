import { Anchor, Box, Group, Stack, Text, Title } from '@mantine/core';
import { notFound } from 'next/navigation';

import { songRepositoryUrl } from '@/shared/config';
import {
  collectionRoute,
  COLLECTIONS,
  documentDateTime,
  formatDocumentDate,
  listDocuments,
  loadDocument,
  renderDocument,
  type SongFrontmatter,
  SONGS,
} from '@/shared/content';
import { constructArticleMetadata } from '@/shared/seo';
import type { WithParams } from '@/shared/typings';
import {
  BackToHome,
  FileLink,
  hoverDim,
  InternalLink,
  PageShell,
  ProseContent,
} from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { listSongs } from '../lib/songs';
import { TrackButton } from './track-button';

const LANGUAGE_LABELS: Record<SongFrontmatter['language'], string> = {
  ru: 'Russian',
  en: 'English',
  instrumental: 'Instrumental',
};

type Props = WithParams<{ slug: string }>;

export function generateSongParams() {
  return listDocuments(SONGS).map(({ slug }) => ({ slug }));
}

async function resolve(params: Props['params']) {
  const document = loadDocument(SONGS, (await params).slug);

  if (!document) notFound();

  return { document, rendered: await renderDocument(document) };
}

export async function generateSongMetadata({ params }: Props) {
  const { document, rendered } = await resolve(params);

  return constructArticleMetadata(document, rendered.title);
}

export async function SongPage({ params }: Props) {
  const { document, rendered } = await resolve(params);
  const { frontmatter, markdown, slug } = document;
  const { html } = rendered;
  const { name, project, language, date, description, seconds, repo } =
    frontmatter;

  // The queue's own index, so the header's play button and the index page's
  // rows drive one list rather than each addressing the song its own way.
  const track = listSongs().findIndex((song) => song.slug === slug);

  return (
    <PageShell>
      <Stack gap={48}>
        <Group component="nav">
          <InternalLink
            href={collectionRoute(SONGS.id)}
            size="sm"
            className={hoverDim}
          >
            ← {COLLECTIONS[SONGS.id].label}
          </InternalLink>
        </Group>

        <Box component="header">
          <Stack gap={24}>
            <Group gap={16} wrap="nowrap" align="center">
              <TrackButton {...{ track, name }} />
              <Title order={1}>{name}</Title>
            </Group>

            <Text size="lg" lh={1.625} opacity={0.8}>
              {description}
            </Text>

            <Group component="p" gap={12} wrap="wrap" fz="sm" opacity={0.7}>
              <time dateTime={documentDateTime(date)}>
                {formatDocumentDate(date)}
              </time>
              {project !== undefined && (
                <>
                  <span aria-hidden>·</span>
                  <span>{project}</span>
                </>
              )}
              <span aria-hidden>·</span>
              <span>{LANGUAGE_LABELS[language]}</span>
              <span aria-hidden>·</span>
              <span>{formatDuration(seconds)}</span>
            </Group>

            <Group gap={16} wrap="wrap">
              <FileLink {...markdown}>.md</FileLink>
              <Anchor
                href={songRepositoryUrl(repo)}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
                className={hoverDim}
              >
                source
              </Anchor>
            </Group>
          </Stack>
        </Box>

        <ProseContent {...{ html }} />

        <BackToHome />
      </Stack>
    </PageShell>
  );
}
