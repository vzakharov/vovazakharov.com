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

import { cx } from '@/kernel/shared/lib/class-names';

import { hasLossless } from '@/music/shared/catalogue/index.node-safe';

import { CONTROL_ON, usePlayer } from '../../context';
import { useStoredSetting, type WithVolume } from '../../setting';
import classes from './player.module.scss';

let volumeSettable = true;
let probed = false;
const probeListeners = new Set<() => void>();

/**
 * iOS leaves the volume to the device's buttons, so a slider there would move
 * nothing. An element's `volume` reads back what was set until the next tick
 * and only then reverts to 1, so the probe reads it a tick late.
 */
function probeVolume() {
  probed = true;
  const probe = new Audio();

  probe.volume = 0.5;
  setTimeout(() => {
    volumeSettable = probe.volume === 0.5;
    for (const listener of probeListeners) listener();
  });
}

function subscribe(listener: () => void) {
  probeListeners.add(listener);
  if (!probed) probeVolume();

  return () => {
    probeListeners.delete(listener);
  };
}

function canSetVolume() {
  return volumeSettable;
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

function VolumeIcon({ volume }: WithVolume) {
  if (volume === 0) return <VolumeX size={18} />;

  return volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />;
}

/** Absent for a song with no master beside its MP3, which it could not switch to. */
function LosslessToggle() {
  const { labels, switching, current } = usePlayer();
  const [lossless, setLossless] = useStoredSetting('lossless');

  if (current === undefined || !hasLossless(current)) return null;

  return (
    <UnstyledButton
      className={cx(classes['losslessChip'], lossless && CONTROL_ON)}
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
 */
export function VolumeControl() {
  const { labels } = usePlayer();
  const [volume, setVolume] = useStoredSetting('volume');
  const settable = useSyncExternalStore(subscribe, canSetVolume, () => true);

  const { opened, setOpened, hover, toggle } = useHoverPopover();

  if (!settable) return <LosslessToggle />;

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
          <LosslessToggle />
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
