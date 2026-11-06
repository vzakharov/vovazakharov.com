'use client';

import type { Labeled } from '@/kernel/shared/typings';

import classes from './island.module.scss';

/** The canvas the island's scene draws into, filling the viewport. */
export function IslandCanvas({ label }: Labeled) {
  return <canvas className={classes['island']} aria-label={label} />;
}
