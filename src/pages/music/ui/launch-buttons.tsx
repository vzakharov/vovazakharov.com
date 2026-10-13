'use client';

import { Button, Group } from '@mantine/core';
import { Radio, Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { Messages } from '@/shared/i18n';

import { usePlayer } from './player-provider';

type LaunchLabels = Pick<Messages['music'], 'shuffleAll' | 'radio'>;

/**
 * The section's two ways in: the public catalogue on a fresh shuffle, and the
 * radio, which tunes in and opens its page. Neither shows a pressed state —
 * they are launchers, and the bar holds the switches.
 */
export function LaunchButtons({ shuffleAll, radio }: LaunchLabels) {
  const player = usePlayer();
  const router = useRouter();

  function openRadio() {
    player.tuneIn();
    router.push(player.radioRoute);
  }

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
