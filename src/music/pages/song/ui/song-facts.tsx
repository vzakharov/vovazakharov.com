import type { ReactNode } from 'react';

import type { WithLocale } from '@/kernel/shared/i18n';

import { NameLink } from '@/shell/shared/ui';

import { documentMonth, formatDocumentMonth } from '@/blog/shared/content';

import {
  albumInfo,
  artistInfo,
  type MusicAlbum,
  type SongOnRelease,
} from '@/music/shared/catalogue';
import {
  bill,
  songPlacements,
  type SpelledLink,
} from '@/music/shared/catalogue/index.node-safe';
import { messages } from '@/music/shared/i18n';
import { formatDuration } from '@/music/shared/lib/duration';
import { FactLine, Spelling } from '@/music/shared/ui';

export type SongFactsProps = SongOnRelease & WithLocale;

/**
 * What a listener would want to know about the recording, in the order they
 * would ask, each artist and album linked to its page: who made it and which
 * release the page shows it on, then the rest — any other release it is also
 * on among them. Empty entries drop out, so a single names no album.
 */
function songFacts({ document, album, locale }: SongFactsProps) {
  const { date, language, project, seconds } = document.frontmatter;
  const copy = messages(locale);
  const nameLink = ({ href, name }: SpelledLink) => (
    <NameLink key={href} {...{ href }}>
      <Spelling {...name} />
    </NameLink>
  );

  /** The message with each album linked in its `{album}` slot, or nothing for none. */
  const albumsFact = (message: string, albums: readonly MusicAlbum[]) => {
    const [before, after] = message.split('{album}');

    return (
      albums.length > 0 && [
        before,
        ...albums.flatMap((linked, index) => [
          index > 0 && ', ',
          nameLink(albumInfo(linked, locale)),
        ]),
        after,
      ]
    );
  };

  return {
    byline: {
      billing: bill(project, (artist) => nameLink(artistInfo(artist, locale))),
      album: albumsFact(copy.album, album === null ? [] : [album]),
    },
    details: {
      date: (
        <time dateTime={documentMonth(date)}>
          {formatDocumentMonth(date, locale)}
        </time>
      ),
      language: language.map((sung) => copy.language[sung]).join(', '),
      alsoOn: albumsFact(
        copy.alsoOn,
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
