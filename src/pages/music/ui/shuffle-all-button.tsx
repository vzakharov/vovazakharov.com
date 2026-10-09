'use client';

import { Button } from '@mantine/core';
import { Shuffle } from 'lucide-react';

import type { Labeled } from '@/shared/typings';

import { usePlayer } from './player-provider';

/** Starts the player's whole queue — the public catalogue — on a fresh shuffle. */
export function ShuffleAllButton({ label }: Labeled) {
  const { shuffleAll } = usePlayer();

  return (
    <Button
      size="md"
      radius="xl"
      leftSection={<Shuffle size={18} />}
      onClick={shuffleAll}
      className="print-hidden"
    >
      {label}
    </Button>
  );
}
