'use client';

import { Tooltip } from '@mantine/core';

import type { WithChildren } from '@/kernel/shared/typings';

import classes from './unsquatted-home.module.scss';

type CoffeeSoonProps = WithChildren & { label: string };

/**
 * Where the donation link goes once there is somewhere to donate: dotted
 * rather than linked, saying why on hover and on tap.
 */
export function CoffeeSoon({ children, label }: CoffeeSoonProps) {
  return (
    <Tooltip {...{ label }} events={{ hover: true, focus: true, touch: true }}>
      <button type="button" className={classes['soon']}>
        {children}
      </button>
    </Tooltip>
  );
}
