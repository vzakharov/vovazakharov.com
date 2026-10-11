'use client';

import { ActionIcon, Box, Group, Text, UnstyledButton } from '@mantine/core';
import { Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';

import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
import { NameLink } from '@/shared/ui';

import { formatDuration } from '../lib/duration';
import { useStoredFlag } from '../lib/use-stored-flag';
import { Marquee } from './marquee';
import classes from './music.module.scss';
import { usePlayer } from './player-provider';
import { SongName } from './song-name';

/**
 * Keeps the reader on the playing song's page: while following, it opens that
 * page, and opens the next one each time the track changes. Following starts
 * on, a navigation of the reader's own away from the page switches it off, and
 * the returned `resume` switches it back on.
 */
function useFollow(route: string | undefined) {
  const router = useRouter();
  const pathname = usePathname();
  const [following, setFollowing] = useState(true);
  const [seen, setSeen] = useState(pathname);

  // Set during render rather than in an effect, so the push below never runs
  // against a switch the navigation has already made stale.
  if (pathname !== seen) {
    setSeen(pathname);
    if (route !== undefined && pathname !== route) setFollowing(false);
  }

  // An event rather than a dependency: only a track change opens a page, and
  // the title `resume` sits on is itself a link to the one it would open.
  const open = useEffectEvent((to: string) => {
    if (following && pathname !== to) router.push(to);
  });

  useEffect(() => {
    if (route !== undefined) open(route);
  }, [route]);

  const resume = () => {
    setFollowing(true);
  };

  return resume;
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
  const resumeFollow = useFollow(current?.routes[locale]);
  // The right-hand readout: the track's length, or what is left of it.
  const [remaining, setRemaining] = useStoredFlag('remaining');

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
      </Group>

      <Box className={classes['playerTrack']}>
        <Text size="sm" component="div">
          <Marquee key={`${slug}/${locale}`}>
            <NameLink href={routes[locale]} onClick={resumeFollow}>
              <SongName {...titles[locale]} />
            </NameLink>
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
        <UnstyledButton
          onClick={() => {
            setRemaining(!remaining);
          }}
          aria-label={labels.timeToggle}
          aria-pressed={remaining}
          title={labels.timeToggle}
        >
          <Text size="xs" opacity={0.6} className={classes['playerTime']}>
            {remaining
              ? `−${formatDuration(seconds - Math.min(elapsed, seconds))}`
              : formatDuration(seconds)}
          </Text>
        </UnstyledButton>
      </Group>
    </Box>
  );
}
