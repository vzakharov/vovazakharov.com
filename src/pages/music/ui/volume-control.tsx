'use client';

import { ActionIcon, Popover, Stack, Text } from '@mantine/core';
import { Volume1, Volume2, VolumeX } from 'lucide-react';
import { useSyncExternalStore } from 'react';

import { cx } from '@/shared/lib/class-names';

import { useStoredSetting } from '../lib/use-stored-setting';
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

type VolumeIconProps = { volume: number };

function VolumeIcon({ volume }: VolumeIconProps) {
  if (volume === 0) return <VolumeX size={18} />;

  return volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />;
}

/** The bar's sound settings: the volume, and lossless above it. */
export function VolumeControl() {
  const { labels } = usePlayer();
  const [volume, setVolume] = useStoredSetting('volume');
  const [lossless, setLossless] = useStoredSetting('lossless');
  const settable = useSyncExternalStore(
    subscribe,
    canSetVolume,
    settableOnServer,
  );

  return (
    <Popover position="top" shadow="md">
      <Popover.Target>
        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          aria-label={labels.volume}
        >
          <VolumeIcon volume={settable ? volume : 1} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={8}>
        <Stack gap={8} align="center">
          <ActionIcon
            variant="default"
            size="lg"
            radius="xl"
            className={cx(lossless && classes['controlOn'])}
            onClick={() => {
              setLossless(!lossless);
            }}
            aria-label={labels.lossless}
            aria-pressed={lossless}
            title={labels.lossless}
          >
            <Text component="span" size="xs" fw={700}>
              HQ
            </Text>
          </ActionIcon>
          {settable && (
            <input
              type="range"
              className={classes['volumeBar']}
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
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
