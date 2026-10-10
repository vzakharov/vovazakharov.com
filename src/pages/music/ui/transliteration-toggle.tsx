'use client';

import { Box, type MantineStyleProp, Switch } from '@mantine/core';
import { useState } from 'react';

import type { LabeledBlock } from '@/shared/typings';

import classes from './music.module.scss';

export type TransliterationToggleProps = LabeledBlock & {
  /** The box the words are laid out in, which the switch heads. */
  className: string | undefined;
  style?: MantineStyleProp;
};

/**
 * The words' box, headed by a switch that sets their romanization under them.
 * Both are in the static HTML; the switch only flips the attribute the
 * stylesheet shows the romanization by, so the state is all this ships.
 */
export function TransliterationToggle({
  label,
  children,
  ...box
}: TransliterationToggleProps) {
  const [shown, setShown] = useState(false);

  return (
    <Box {...box} data-transliteration={shown ? 'shown' : 'hidden'}>
      <Switch
        className={classes['transliterationSwitch']}
        size="xs"
        {...{ label }}
        checked={shown}
        onChange={({ currentTarget }) => {
          setShown(currentTarget.checked);
        }}
      />
      {children}
    </Box>
  );
}
