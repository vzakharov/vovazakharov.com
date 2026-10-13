import { UnstyledButton } from '@mantine/core';
import { Construction } from 'lucide-react';

import classes from './wip-mark.module.scss';

export type WipMarkProps = { note: string };

/**
 * A release still being made: a gray roadworks sign whose note shows on hover,
 * keyboard focus or a tap, and is the sign's accessible name besides.
 */
export function WipMark({ note }: WipMarkProps) {
  return (
    <UnstyledButton className={classes['mark']} aria-label={note}>
      <Construction className={classes['sign']} size={14} aria-hidden />
      <span className={classes['note']} aria-hidden>
        {note}
      </span>
    </UnstyledButton>
  );
}
