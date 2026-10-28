'use client';

import { Button, Group } from '@mantine/core';
import { Radio, Shuffle } from 'lucide-react';

import type { Messages } from '@/music/shared/i18n';

import { usePlayer } from './player-context';
import { useOpenRadio } from './use-open-radio';

/** The music section's strings, whole: `Messages` is the catalogue's JSON, with no narrower type to take. */
type LaunchButtonsProps = { labels: Messages };

/**
 * The section's two ways in: the public catalogue on a fresh shuffle, and the
 * radio, which tunes in and opens its page. Neither shows a pressed state —
 * they are launchers, and the bar holds the switches.
 */
export function LaunchButtons({ labels }: LaunchButtonsProps) {
  const { shuffleAll, radio } = labels;
  const player = usePlayer();
  const openRadio = useOpenRadio();

  return (
    <Group gap="sm" className="print-hidden">
      <Button
        size="md"
        radius="xl"
        leftSection={<Shuffle size={18} />}
        onClick={player.shuffleAll}
      >
        {shuffleAll}
      </Button>
      <Button
        size="md"
        radius="xl"
        variant="default"
        leftSection={<Radio size={18} />}
        onClick={openRadio}
      >
        {radio}
      </Button>
    </Group>
  );
}
