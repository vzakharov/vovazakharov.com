import { Group } from '@mantine/core';
import { Fragment, type ReactNode } from 'react';

import { albumTitle, bill, projectName } from '@/shared/config';
import { documentMonth, formatDocumentMonth } from '@/shared/content';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { NameLink } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { albumPath, artistPath, type WithEverything } from '../lib/music-urls';
import type { SongDocument } from '../lib/song-text';

export type SongFactsProps = WithLocale & {
  document: SongDocument;
  /** The catalogue the artist and album links stay in. */
  catalogue: WithEverything;
};

/**
 * The line under the title: what a listener would want to know about the
 * recording before playing it, in the order they would ask, each artist and
 * the album linked to its page. Empty entries drop out, so a song with no
 * album and no co-author shows neither.
 */
export function SongFacts({ document, catalogue, locale }: SongFactsProps) {
  const { date, language, album, credits, project, seconds } =
    document.frontmatter;
  const messages = loadMessages(locale).music;
  const [beforeAlbum, afterAlbum] = messages.album.split('{album}');

  const facts: Record<string, ReactNode> = {
    date: (
      <time dateTime={documentMonth(date)}>
        {formatDocumentMonth(date, locale)}
      </time>
    ),
    billing: bill(project, (artist) => (
      <NameLink key={artist} href={artistPath(artist, catalogue, locale)}>
        {projectName(artist, locale)}
      </NameLink>
    )),
    language: language.map((sung) => messages.language[sung]).join(', '),
    album: album && [
      beforeAlbum,
      <NameLink key="album" href={albumPath(album, catalogue, locale)}>
        {albumTitle(album, locale)}
      </NameLink>,
      afterAlbum,
    ],
    lyrics:
      credits?.lyrics &&
      `${messages.credits.lyrics}: ${credits.lyrics.join(', ')}`,
    music:
      credits?.music &&
      `${messages.credits.music}: ${credits.music.join(', ')}`,
    duration: formatDuration(seconds),
  };

  return (
    <Group component="p" gap={12} wrap="wrap" fz="sm" opacity={0.7}>
      {Object.entries(facts)
        .filter(([, fact]) => Boolean(fact))
        .map(([key, fact], index) => (
          <Fragment key={key}>
            {index > 0 && <span aria-hidden>·</span>}
            <span>{fact}</span>
          </Fragment>
        ))}
    </Group>
  );
}
