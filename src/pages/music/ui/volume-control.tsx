'use client';

import {
  ActionIcon,
  Box,
  Popover,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { LoaderCircle, Volume1, Volume2, VolumeX } from 'lucide-react';
import {
  type PointerEvent,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { cx } from '@/shared/lib/class-names';

import { hasLossless } from '../lib/player-state';
import {
  type SettingValues,
  useStoredSetting,
} from '../lib/use-stored-setting';
import classes from './music.module.scss';
import { usePlayer } from './player-provider';

let volumeSettable: boolean | undefined;

/**
 * iOS leaves the volume to the device's buttons: an element's `volume` reads
 * back 1 whatever was set, so a slider there would move nothing.
 */
function canSetVolume(): boolean {
  if (volumeSettable === undefined) {
    const probe = new Audio();

    probe.volume = 0.5;
    volumeSettable = probe.volume === 0.5;
  }

  return volumeSettable;
}

function unsubscribe() {
  // A device's hold on its volume never changes under a page.
}

function subscribe() {
  return unsubscribe;
}

function settableOnServer() {
  return true;
}

/** Long enough for the mouse to cross the gap between the button and the dropdown. */
const HOVER_CLOSE_DELAY = 200;

/**
 * Open on a mouse resting over the button or the dropdown, and on a tap: a
 * pointer that can hover gets the slider without a click, a finger by one.
 */
function useHoverPopover() {
  const [opened, setOpened] = useState(false);
  const hoveringRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const hover = {
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      hoveringRef.current = true;
      clearTimeout(closeTimerRef.current);
      setOpened(true);
    },
    onPointerLeave: (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      hoveringRef.current = false;
      closeTimerRef.current = setTimeout(() => {
        setOpened(false);
      }, HOVER_CLOSE_DELAY);
    },
  };

  return {
    opened,
    setOpened,
    hover,
    // A click on a button the mouse already opened leaves it open rather than
    // closing it under the pointer.
    toggle: () => {
      setOpened((was) => hoveringRef.current || !was);
    },
  };
}

type VolumeIconProps = Pick<SettingValues, 'volume'>;

function VolumeIcon({ volume }: VolumeIconProps) {
  if (volume === 0) return <VolumeX size={18} />;

  return volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />;
}

function LosslessToggle() {
  const { labels, switching } = usePlayer();
  const [lossless, setLossless] = useStoredSetting('lossless');

  return (
    <UnstyledButton
      className={cx(classes['losslessChip'], lossless && classes['controlOn'])}
      onClick={() => {
        setLossless(!lossless);
      }}
      aria-label={labels.lossless}
      aria-pressed={lossless}
      aria-busy={switching}
      title={labels.lossless}
    >
      {switching ? (
        <LoaderCircle size={12} className={classes['spinner']} />
      ) : (
        'HQ'
      )}
    </UnstyledButton>
  );
}

/**
 * The bar's sound settings: the volume, and lossless above it — or lossless
 * alone, straight on the bar, where the device keeps the volume to itself.
 * Lossless shows only for a song that has a lossless file.
 */
export function VolumeControl() {
  const { labels, current } = usePlayer();
  const lossless = current !== undefined && hasLossless(current);
  const [volume, setVolume] = useStoredSetting('volume');
  const settable = useSyncExternalStore(
    subscribe,
    canSetVolume,
    settableOnServer,
  );

  const { opened, setOpened, hover, toggle } = useHoverPopover();

  if (!settable) return lossless && <LosslessToggle />;

  return (
    <Popover position="top" shadow="md" {...{ opened }} onChange={setOpened}>
      <Popover.Target>
        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          aria-label={labels.volume}
          aria-expanded={opened}
          onClick={toggle}
          {...hover}
        >
          <VolumeIcon {...{ volume }} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown className={classes['volumeDropdown']} {...hover}>
        <Stack gap={10} align="center">
          {lossless && <LosslessToggle />}
          <Box
            component="input"
            type="range"
            className={classes['volumeBar']}
            style={{ '--fill': `${volume * 100}%` }}
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => {
              setVolume(Number(event.currentTarget.value));
            }}
            aria-label={labels.volume}
            aria-orientation="vertical"
          />
          <Text size="xs" opacity={0.6} className={classes['volumeReadout']}>
            {Math.round(volume * 100)}
          </Text>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
