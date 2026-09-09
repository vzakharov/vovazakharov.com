import { Box } from '@mantine/core';
import type { ReactNode } from 'react';

import { cx } from '@/shared/lib/class-names';
import type { WithChildren, WithOptionalClassName } from '@/shared/typings';

import classes from './corner-header.module.scss';

export type CornerHeaderProps = WithChildren &
  WithOptionalClassName & { corner: ReactNode };

/**
 * A page header with one control in its top-right corner, out of the flow — so
 * it costs no vertical band. The price is that corner: the control overlaps
 * whatever the header's first line puts there, and keeping it clear is the
 * caller's.
 */
export function CornerHeader({
  corner,
  className,
  children,
}: CornerHeaderProps) {
  return (
    <Box component="header" className={cx(classes['header'], className)}>
      <Box className={classes['corner']}>{corner}</Box>
      {children}
    </Box>
  );
}
