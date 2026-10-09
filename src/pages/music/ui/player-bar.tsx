'use client';

import { ActionIcon, Box, Group, Text } from '@mantine/core';
import {
  LocateFixed,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';

import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
import { NameLink } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { Marquee } from './marquee';
import classes from './music.module.scss';
import { usePlayer } from './player-provider';

/**
 * Whether the bar keeps the reader on the playing song's page: switched on, it
 * opens that page, and opens the next one each time the track changes. Leaving
 * the page by hand does not switch it off, so the next track brings them back.
 */
function useFollow(route: string | undefined) {
  const router = useRouter();
  const pathname = usePathname();
  const [following, setFollowing] = useState(false);

  // An event rather than a dependency: a navigation of the reader's own must
  // not count as a track change and send them straight back.
  const open = useEffectEvent((to: string) => {
    if (pathname !== to) router.push(to);
  });

  useEffect(() => {
    if (following && route !== undefined) open(route);
  }, [following, route]);

  const toggle = () => {
    setFollowing(!following);
  };

  return [following, toggle] as const;
}

/** The control strip, pinned to the foot of every page under `/music`. */
export function PlayerBar() {
  const {
    state,
    current,
    elapsed,
    locale,
    labels,
    toggle,
    next,
    previous,
    shuffle,
    seek,
  } = usePlayer();
  const [following, toggleFollow] = useFollow(current?.routes[locale]);

  if (current === undefined) return null;

  const { slug, titles, routes, billing, seconds } = current;

  return (
    <Box
      component="aside"
      className={classes['playerBar']}
      aria-label={labels.label}
    >
      <Group gap={12} wrap="nowrap" className={classes['playerControls']}>
        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          onClick={previous}
          aria-label={labels.previous}
        >
          <SkipBack size={18} />
        </ActionIcon>

        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          className={classes['controlOn']}
          onClick={toggle}
          aria-label={state.playing ? labels.pause : labels.play}
        >
          {state.playing ? <Pause size={18} /> : <Play size={18} />}
        </ActionIcon>

        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          onClick={next}
          aria-label={labels.next}
        >
          <SkipForward size={18} />
        </ActionIcon>

        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          className={cx(state.shuffled && classes['controlOn'])}
          onClick={shuffle}
          aria-label={labels.shuffle}
          aria-pressed={state.shuffled}
        >
          <Shuffle size={18} />
        </ActionIcon>

        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          className={cx(following && classes['controlOn'])}
          onClick={toggleFollow}
          aria-label={labels.follow}
          aria-pressed={following}
        >
          <LocateFixed size={18} />
        </ActionIcon>
      </Group>

      <Box className={classes['playerTrack']}>
        <Text size="sm" component="div">
          <Marquee key={`${slug}/${locale}`}>
            <NameLink href={routes[locale]}>{titles[locale]}</NameLink>
            <Text component="span" inherit opacity={0.6}>
              {' — '}
              {billing[locale].map((part) =>
                typeof part === 'string' ? (
                  part
                ) : (
                  <NameLink key={part.href} {...pick(part, 'href')} c="inherit">
                    {part.label}
                  </NameLink>
                ),
              )}
            </Text>
          </Marquee>
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
          aria-label={labels.seek}
        />
        <Text size="xs" opacity={0.6} className={classes['playerTime']}>
          {formatDuration(seconds)}
        </Text>
      </Group>
    </Box>
  );
}
