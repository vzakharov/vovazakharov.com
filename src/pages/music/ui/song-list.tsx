import { Box, Group, Stack, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import type { MaybeTitled } from '@/shared/typings';
import { Card, NameLink, Subheading } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { billingText, type WithTracks } from '../lib/player-state';
import { ExplicitBadge } from './explicit-badge';
import classes from './music.module.scss';
import { SongName } from './song-name';
import { TrackButton } from './track-button';

/** Untitled under a heading of the page's own, as the index's tabs are. */
export type SongListProps = WithLocale &
  WithTracks &
  MaybeTitled & {
    /** Each row's number on its release, by slug — an album's list, which may skip. */
    trackNumbers?: ReadonlyMap<string, number>;
  };

/**
 * A list of songs, each row playable. A row plays within the queue the layout
 * seeds the player with — the public catalogue — and a row the queue does not
 * hold, a hidden song, joins it when played, as on its own page.
 */
export function SongList({
  locale,
  title,
  tracks: songs,
  trackNumbers,
}: SongListProps) {
  const messages = loadMessages(locale).music;

  if (songs.length === 0) return null;

  return (
    <Box>
      {title !== undefined && <Subheading>{title}</Subheading>}

      <Stack gap={12}>
        {songs.map((track) => (
          <Card key={track.slug}>
            <Group gap={16} wrap="nowrap">
              {trackNumbers !== undefined && (
                <Text
                  size="sm"
                  opacity={0.6}
                  className={classes['trackNumber']}
                >
                  {trackNumbers.get(track.slug)}
                </Text>
              )}
              <TrackButton
                {...pick(track.titles[locale], 'title')}
                {...{ track }}
              />

              <Box className={classes['trackText']}>
                <Text fw={500} truncate>
                  <NameLink href={track.routes[locale]}>
                    <SongName {...track.titles[locale]} />
                  </NameLink>
                  {track.explicit && (
                    <ExplicitBadge label={messages.explicit} />
                  )}
                </Text>
                <Text size="sm" opacity={0.6} truncate>
                  {billingText(track.billing[locale])}
                </Text>
              </Box>

              <Text size="sm" opacity={0.6} ff="monospace">
                {formatDuration(track.seconds)}
              </Text>
            </Group>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
