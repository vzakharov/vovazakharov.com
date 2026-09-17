import { Box, Group, Stack, Text } from '@mantine/core';

import { Card, InternalLink, Subheading } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { listSongs } from '../lib/songs';
import classes from './music.module.scss';
import { TrackButton } from './track-button';

/**
 * The catalogue on the index. Each row's position is the queue's own index, so
 * pressing play on a row and pressing next on the bar move through one list.
 */
export function SongList() {
  const songs = listSongs();

  if (songs.length === 0) return null;

  return (
    <Box>
      <Subheading>Songs</Subheading>

      <Stack gap={12}>
        {songs.map(({ slug, name, project, route, seconds }, track) => (
          <Card key={slug}>
            <Group gap={16} wrap="nowrap">
              <TrackButton {...{ track, name }} />

              <Box className={classes['trackText']}>
                <Text fw={500} truncate>
                  <InternalLink href={route} underline="hover" inherit>
                    {name}
                  </InternalLink>
                </Text>
                <Text size="sm" opacity={0.6} truncate>
                  {project ?? 'Unfiled'}
                </Text>
              </Box>

              <Text size="sm" opacity={0.6} ff="monospace">
                {formatDuration(seconds)}
              </Text>
            </Group>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
