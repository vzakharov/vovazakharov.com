import { Box, Group, Stack, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Card, NameLink, Subheading } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import type { WithTracks } from '../lib/player-state';
import { ExplicitBadge } from './explicit-badge';
import classes from './music.module.scss';
import { TrackButton } from './track-button';

export type SongListProps = WithLocale &
  WithTracks & {
    /** Each row's number on its release, by slug — an album's list, which may skip. */
    trackNumbers?: ReadonlyMap<string, number>;
  };

/**
 * A list of songs, each row playable. On the public index it is row for row
 * the queue the layout seeds the player with, so pressing play on a row and
 * pressing next on the bar move through one list; a row the queue does not
 * hold — a hidden song — joins it when played, as on its own page.
 */
export function SongList({
  locale,
  tracks: songs,
  trackNumbers,
}: SongListProps) {
  const messages = loadMessages(locale).music;

  if (songs.length === 0) return null;

  return (
    <Box>
      <Subheading>{messages.title}</Subheading>

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
              <TrackButton title={track.titles[locale]} {...{ track }} />

              <Box className={classes['trackText']}>
                <Text fw={500} truncate>
                  <NameLink href={track.routes[locale]}>
                    {track.titles[locale]}
                  </NameLink>
                  {track.explicit && (
                    <ExplicitBadge label={messages.explicit} />
                  )}
                </Text>
                <Text size="sm" opacity={0.6} truncate>
                  {track.billing[locale]}
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
