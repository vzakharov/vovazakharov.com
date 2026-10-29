'use client';

import { Tooltip } from '@mantine/core';

import type { WithChildren } from '@/kernel/shared/typings';

import classes from './unsquatted-home.module.scss';

type HintProps = WithChildren & { label: string };

/**
 * Words with an aside behind them: dotted rather than linked, the aside shown
 * on hover and on tap.
 */
export function Hint({ children, label }: HintProps) {
  return (
    <Tooltip
      {...{ label }}
      multiline
      events={{ hover: true, focus: true, touch: true }}
      classNames={{ tooltip: classes['hintAside'] }}
    >
      <button type="button" className={classes['hint']}>
        {children}
      </button>
    </Tooltip>
  );
}
