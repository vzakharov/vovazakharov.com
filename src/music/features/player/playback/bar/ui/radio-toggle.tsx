'use client';

import { ActionIcon } from '@mantine/core';
import { Radio } from 'lucide-react';

import { cx } from '@/kernel/shared/lib/class-names';

import {
  CONTROL_ON,
  useOnRadioPage,
  useOpenRadio,
  usePlayer,
} from '../../context';

/**
 * The bar's way to the radio, pressed while tuned in. It never tunes out:
 * releasing the radio means nothing while the music plays on, and any action on
 * playback already does it. Absent on the radio's page, whose own knob tunes in.
 */
export function RadioToggle() {
  const { state, labels } = usePlayer();
  const openRadio = useOpenRadio();
  const onRadioPage = useOnRadioPage();

  if (onRadioPage) return null;

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="xl"
      className={cx(state.radio && CONTROL_ON)}
      onClick={openRadio}
      aria-label={labels.radio}
      aria-pressed={state.radio}
    >
      <Radio size={18} />
    </ActionIcon>
  );
}
