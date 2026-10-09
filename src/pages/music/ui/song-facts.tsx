import { Group } from '@mantine/core';
import { Fragment, type ReactNode } from 'react';

import { documentMonth, formatDocumentMonth } from '@/shared/content';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import type { MusicAlbum } from '@/shared/song';
import { NameLink } from '@/shared/ui';

import { albumTitle } from '../lib/albums';
import { formatDuration } from '../lib/duration';
import { albumPath, artistPath, type WithEverything } from '../lib/music-urls';
import { bill, projectName } from '../lib/projects';
import type { SongDocument } from '../lib/song-text';

export type SongFactsProps = WithLocale & {
  document: SongDocument;
  /** The catalogue the artist and album links stay in. */
  catalogue: WithEverything;
};

/**
 * The line under the title: what a listener would want to know about the
 * recording before playing it, in the order they would ask, each artist and
 * album linked to its page — the release the song is filed under, then any
 * other it is also on. Empty entries drop out, so a single names no album.
 */
export function SongFacts({ document, catalogue, locale }: SongFactsProps) {
  const { date, language, album, alsoOn, project, seconds } =
    document.frontmatter;
  const messages = loadMessages(locale).music;

  /** The message with each album linked in its `{album}` slot, or nothing for none. */
  const albumsFact = (message: string, albums: readonly MusicAlbum[]) => {
    const [before, after] = message.split('{album}');

    return (
      albums.length > 0 && [
        before,
        ...albums.flatMap((linked, index) => [
          index > 0 && ', ',
          <NameLink key={linked} href={albumPath(linked, catalogue, locale)}>
            {albumTitle(linked, locale)}
          </NameLink>,
        ]),
        after,
      ]
    );
  };

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
    album: albumsFact(messages.album, album === null ? [] : [album]),
    alsoOn: albumsFact(
      messages.alsoOn,
      (alsoOn ?? []).map((placement) => placement.album),
    ),
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
