import { Group, type GroupProps } from '@mantine/core';
import { Fragment, type ReactNode } from 'react';

import { documentMonth, formatDocumentMonth } from '@/shared/content';
import { loadMessages } from '@/shared/i18n';
import type { MusicAlbum } from '@/shared/music-catalogue';
import { NameLink } from '@/shared/ui';

import { songPlacements } from '../lib/album-tracks';
import { albumTitle } from '../lib/albums';
import { formatDuration } from '../lib/duration';
import { albumPath, artistPath, type CatalogueView } from '../lib/music-urls';
import { bill, projectName } from '../lib/projects';
import type { SongOnRelease } from '../lib/song-text';

export type SongFactsProps = SongOnRelease & CatalogueView;

/**
 * What a listener would want to know about the recording, in the order they
 * would ask, each artist and album linked to its page: who made it and which
 * release the page shows it on, then the rest — any other release it is also
 * on among them. Empty entries drop out, so a single names no album.
 */
function songFacts({ document, album, catalogue, locale }: SongFactsProps) {
  const { date, language, project, seconds } = document.frontmatter;
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

  return {
    byline: {
      billing: bill(project, (artist) => (
        <NameLink key={artist} href={artistPath(artist, catalogue, locale)}>
          {projectName(artist, locale)}
        </NameLink>
      )),
      album: albumsFact(messages.album, album === null ? [] : [album]),
    },
    details: {
      date: (
        <time dateTime={documentMonth(date)}>
          {formatDocumentMonth(date, locale)}
        </time>
      ),
      language: language.map((sung) => messages.language[sung]).join(', '),
      alsoOn: albumsFact(
        messages.alsoOn,
        songPlacements(document.frontmatter)
          .map((placement) => placement.album)
          .filter((other) => other !== album),
      ),
      duration: formatDuration(seconds),
    },
  } satisfies Record<string, Record<string, ReactNode>>;
}

function FactLine({
  facts,
  ...props
}: GroupProps & { facts: Record<string, ReactNode> }) {
  return (
    <Group component="p" gap={12} wrap="wrap" {...props}>
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

/** Who made the song and the release the page shows it on, above the title. */
export function SongByline(props: SongFactsProps) {
  return <FactLine facts={songFacts(props).byline} opacity={0.8} />;
}

/** The recording's other facts, in the line further down. */
export function SongFacts(props: SongFactsProps) {
  return <FactLine facts={songFacts(props).details} fz="sm" opacity={0.7} />;
}
