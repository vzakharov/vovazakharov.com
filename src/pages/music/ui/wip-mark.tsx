import { UnstyledButton } from '@mantine/core';
import { Construction } from 'lucide-react';

import classes from './wip-mark.module.scss';

/** Why a release may still change, where it is a work in progress. */
export type WipNoted = { wip?: string };

export type WipMarkProps = {
  note: string;
  /** The sign's size, `1em` being the text it follows. */
  size?: number | string;
};

/**
 * A release still being made: a gray roadworks sign whose note shows on hover,
 * keyboard focus or a tap, and is the sign's accessible name besides. Where
 * the note hangs is the stylesheet's `--wip-*` variables.
 */
export function WipMark({ note, size = 12 }: WipMarkProps) {
  return (
    <UnstyledButton className={classes['mark']} aria-label={note}>
      <Construction className={classes['sign']} {...{ size }} aria-hidden />
      <span className={classes['note']} aria-hidden>
        {note}
      </span>
    </UnstyledButton>
  );
}
