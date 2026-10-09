import { Box, Group, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { SITE_CONFIG } from '@/shared/config';
import { isListed, renderDocument } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
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
import { pictureCard, songPicture } from '../lib/pictures';
import { songRepositoryUrl } from '../lib/projects';
import { localizeSong, songLyrics } from '../lib/song-text';
import { listSongPages, type SongPageEntry, songTrack } from '../lib/songs';
import { titleGloss } from '../lib/title-gloss';
import { ExplicitBadge } from './explicit-badge';
import { Lyrics } from './lyrics';
import classes from './music.module.scss';
import { MusicNav } from './music-nav';
import { SongCredits } from './song-credits';
import { SongByline, SongFacts } from './song-facts';
import { SongPlayButton } from './song-play-button';
import { TitleGlossLine } from './title-gloss-line';

function resolve(slug: string): SongPageEntry {
  const page = listSongPages().find((entry) => entry.slug === slug);

  if (!page) notFound();

  return page;
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
  const { title, description, repo, explicit, cribNote } =
    localized.frontmatter;
  const messages = loadMessages(locale).music;
  const lyrics = songLyrics(document, locale);
  const picture = songPicture(document, album);

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
            <div className={classes['songHead']}>
              {picture !== undefined && (
                <div
                  className={cx(classes['tileArt'], classes['songCover'])}
                  aria-hidden
                >
                  <Image
                    src={picture}
                    alt=""
                    width={600}
                    height={600}
                    sizes="200px"
                    priority
                  />
                </div>
              )}

              <Stack gap={8} align="flex-start">
                <Title order={1}>
                  {title}
                  {explicit && <ExplicitBadge label={messages.explicit} />}
                </Title>
                <TitleGlossLine
                  gloss={titleGloss(localized.frontmatter, locale)}
                />
                <SongByline {...{ document, album, catalogue, locale }} />
                {/* The same track a song list's row plays, so both drive one
                    queue — which a hidden song joins only once played here. */}
                <Box mt={12}>
                  <SongPlayButton track={songTrack(document, album)} />
                </Box>
              </Stack>
            </div>

            <Text size="lg" lh={1.625} opacity={0.8}>
              {description}
            </Text>

            {/* The recording's facts, and the files behind it at the far end
                of the same line. */}
            <Group justify="space-between" gap="12px 32px" wrap="wrap">
              <SongFacts {...{ document, album, catalogue, locale }} />

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

        <SongCredits
          {...{ locale }}
          {...pick(document.frontmatter, 'credits', 'language')}
        />

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
