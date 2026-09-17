'use client';

import { ActionIcon, Box, Group, Text } from '@mantine/core';
import { Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';

import { InternalLink } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import classes from './music.module.scss';
import { usePlayer } from './player-provider';

/** The control strip, pinned to the foot of every page under `/music`. */
export function PlayerBar() {
  const { state, current, elapsed, toggle, next, previous, shuffle, seek } =
    usePlayer();

  if (current === undefined) return null;

  const { name, project, route, seconds } = current;

  return (
    <Box component="aside" className={classes['playerBar']} aria-label="Player">
      <Group gap={12} wrap="nowrap" className={classes['playerControls']}>
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={previous}
          aria-label="Previous track"
        >
          <SkipBack size={18} />
        </ActionIcon>

        <ActionIcon
          variant="filled"
          size="lg"
          onClick={toggle}
          aria-label={state.playing ? 'Pause' : 'Play'}
        >
          {state.playing ? <Pause size={18} /> : <Play size={18} />}
        </ActionIcon>

        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={next}
          aria-label="Next track"
        >
          <SkipForward size={18} />
        </ActionIcon>

        <ActionIcon
          variant={state.shuffled ? 'light' : 'subtle'}
          size="lg"
          onClick={shuffle}
          aria-label="Shuffle"
          aria-pressed={state.shuffled}
        >
          <Shuffle size={18} />
        </ActionIcon>
      </Group>

      <Box className={classes['playerTrack']}>
        <Text size="sm" truncate>
          <InternalLink href={route} underline="hover" inherit>
            {name}
          </InternalLink>
          {project !== undefined && (
            <Text component="span" inherit opacity={0.6}>
              {' — '}
              {project}
            </Text>
          )}
        </Text>
      </Box>

      <Group gap={8} wrap="nowrap" className={classes['playerSeek']}>
        <Text size="xs" opacity={0.6} className={classes['playerTime']}>
          {formatDuration(elapsed)}
        </Text>
        <input
          type="range"
          className={classes['seekBar']}
          min={0}
          max={seconds}
          step={1}
          value={Math.min(elapsed, seconds)}
          onChange={(event) => {
            seek(Number(event.currentTarget.value));
          }}
          aria-label="Seek"
        />
        <Text size="xs" opacity={0.6} className={classes['playerTime']}>
          {formatDuration(seconds)}
        </Text>
      </Group>
    </Box>
  );
}
