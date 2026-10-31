'use client';

import { ActionIcon, Box, Group, Text, UnstyledButton } from '@mantine/core';
import { Pause, Play, Shuffle, SkipBack, SkipForward } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useEffectEvent, useState } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';

import { NameLink } from '@/shell/shared/ui';

import { formatDuration } from '@/music/shared/lib/duration';
import { BillingLinks, Spelling } from '@/music/shared/ui';

import { useStoredSetting } from '../model/use-stored-setting';
import { Marquee } from './marquee';
import classes from './player.module.scss';
import { usePlayer } from './player-provider';
import { RadioToggle } from './radio-toggle';
import { VolumeControl } from './volume-control';

/**
 * Keeps the reader on the playing song's page: while following, it opens that
 * page, and opens the next one each time the track changes. The radio turning
 * on switches it off, every way of tuning in taking the reader to the radio's
 * page instead; each navigation of the reader's own sets it: off anywhere
 * else, on at the playing song's page, however the reader got there. The
 * returned `resume` switches it on ahead of the navigation it rides on.
 */
function useFollow(route: string | undefined, radio: boolean) {
  const router = useRouter();
  const pathname = usePathname();
  const [following, setFollowing] = useState(!radio);
  const [seen, setSeen] = useState(pathname);
  const [wasRadio, setWasRadio] = useState(radio);

  // Set during render rather than in an effect, so the push below never runs
  // against a switch the navigation or the tuning has already made stale.
  if (pathname !== seen) {
    setSeen(pathname);
    if (route !== undefined) setFollowing(pathname === route);
  }
  if (radio !== wasRadio) {
    setWasRadio(radio);
    if (radio) setFollowing(false);
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
  const resumeFollow = useFollow(current?.routes[locale], state.radio);
  // The right-hand readout: the track's length, or what is left of it.
  const [remaining, setRemaining] = useStoredSetting('remaining');

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

        <RadioToggle />
      </Group>

      <Box className={classes['playerTrack']}>
        <Text size="sm" component="div">
          <Marquee key={`${slug}/${locale}`}>
            <NameLink href={routes[locale]} onClick={resumeFollow}>
              <Spelling {...titles[locale]} />
            </NameLink>
            <Text component="span" inherit opacity={0.6}>
              {' — '}
              <BillingLinks billing={billing[locale]} />
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

      <Box className={classes['playerVolume']}>
        <VolumeControl />
      </Box>
    </Box>
  );
}
