import { Box, Group, Stack, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Card, InternalLink, Subheading } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { listSongs } from '../lib/songs';
import { ExplicitBadge } from './explicit-badge';
import classes from './music.module.scss';
import { TrackButton } from './track-button';

/**
 * The catalogue on the index. Each row's position is the queue's own index, so
 * pressing play on a row and pressing next on the bar move through one list.
 */
export function SongList({ locale }: WithLocale) {
  const songs = listSongs();
  const messages = loadMessages(locale).music;

  if (songs.length === 0) return null;

  return (
    <Box>
      <Subheading>{messages.title}</Subheading>

      <Stack gap={12}>
        {songs.map(
          ({ slug, titles, routes, billing, seconds, explicit }, track) => (
            <Card key={slug}>
              <Group gap={16} wrap="nowrap">
                <TrackButton title={titles[locale]} {...{ track }} />

                <Box className={classes['trackText']}>
                  <Text fw={500} truncate>
                    <InternalLink
                      href={routes[locale]}
                      underline="hover"
                      inherit
                    >
                      {titles[locale]}
                    </InternalLink>
                    {explicit && <ExplicitBadge label={messages.explicit} />}
                  </Text>
                  <Text size="sm" opacity={0.6} truncate>
                    {billing}
                  </Text>
                </Box>

                <Text size="sm" opacity={0.6} ff="monospace">
                  {formatDuration(seconds)}
                </Text>
              </Group>
            </Card>
          ),
        )}
      </Stack>
    </Box>
  );
}
