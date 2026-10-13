'use client';

import { ActionIcon } from '@mantine/core';
import { Radio } from 'lucide-react';

import { cx } from '@/shared/lib/class-names';

import classes from './music.module.scss';
import { usePlayer } from './player-provider';
import { useOnRadioPage, useOpenRadio } from './use-open-radio';

/**
 * The bar's radio switch: pressed, it releases the radio and the music plays
 * on; unpressed, it tunes in and opens the radio's page. Absent on that page,
 * whose own knob tunes in.
 */
export function RadioToggle() {
  const { state, labels, release } = usePlayer();
  const openRadio = useOpenRadio();
  const onRadioPage = useOnRadioPage();

  if (onRadioPage) return null;

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="xl"
      className={cx(state.radio && classes['controlOn'])}
      onClick={state.radio ? release : openRadio}
      aria-label={labels.radio}
      aria-pressed={state.radio}
    >
      <Radio size={18} />
    </ActionIcon>
  );
}
