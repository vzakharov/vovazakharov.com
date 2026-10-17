import type { ReactNode } from 'react';

import { documentMonth, formatDocumentMonth } from '@/kernel/shared/content';
import { loadMessages, type WithLocale } from '@/kernel/shared/i18n';
import { NameLink } from '@/kernel/shared/ui';

import type { MusicAlbum } from '@/music/shared/catalogue';

import { songPlacements } from '../lib/album-tracks';
import { albumTitle } from '../lib/albums';
import { projectName } from '../lib/artists';
import { formatDuration } from '../lib/duration';
import { albumPath, artistPath } from '../lib/music-urls';
import { bill } from '../lib/projects';
import type { SongOnRelease } from '../lib/song-text';
import { FactLine } from './fact-line';
import { Spelling } from './spelling';

export type SongFactsProps = SongOnRelease & WithLocale;

/**
 * What a listener would want to know about the recording, in the order they
 * would ask, each artist and album linked to its page: who made it and which
 * release the page shows it on, then the rest — any other release it is also
 * on among them. Empty entries drop out, so a single names no album.
 */
function songFacts({ document, album, locale }: SongFactsProps) {
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
          <NameLink key={linked} href={albumPath(linked, locale)}>
            <Spelling {...albumTitle(linked, locale)} />
          </NameLink>,
        ]),
        after,
      ]
    );
  };

  return {
    byline: {
      billing: bill(project, (artist) => (
        <NameLink key={artist} href={artistPath(artist, locale)}>
          <Spelling {...projectName(artist, locale)} />
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

/** Who made the song and the release the page shows it on, above the title. */
export function SongByline(props: SongFactsProps) {
  return <FactLine facts={songFacts(props).byline} opacity={0.8} />;
}

/** The recording's other facts, in the line further down. */
export function SongFacts(props: SongFactsProps) {
  return <FactLine facts={songFacts(props).details} fz="sm" opacity={0.7} />;
}
