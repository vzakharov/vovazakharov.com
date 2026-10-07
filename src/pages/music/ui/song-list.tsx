import { Box, Group, Stack, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Card, Subheading, TextLink } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { listSongs } from '../lib/songs';
import { ExplicitBadge } from './explicit-badge';
import classes from './music.module.scss';
import { TrackButton } from './track-button';

/** An index, in one language; `everything` lists the hidden songs too. */
export type MusicIndexProps = WithLocale & { everything?: boolean };

/**
 * The catalogue on the index, row for row the queue the layout seeds the player
 * with, so pressing play on a row and pressing next on the bar move through one
 * list. A hidden row joins that queue when played, as on its own page.
 */
export function SongList({ locale, everything = false }: MusicIndexProps) {
  const songs = listSongs(everything);
  const messages = loadMessages(locale).music;

  if (songs.length === 0) return null;

  return (
    <Box>
      <Subheading>{messages.title}</Subheading>

      <Stack gap={12}>
        {songs.map((track) => (
          <Card key={track.slug}>
            <Group gap={16} wrap="nowrap">
              <TrackButton title={track.titles[locale]} {...{ track }} />

              <Box className={classes['trackText']}>
                <Text fw={500} truncate>
                  <TextLink href={track.routes[locale]} underline="hover">
                    {track.titles[locale]}
                  </TextLink>
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
