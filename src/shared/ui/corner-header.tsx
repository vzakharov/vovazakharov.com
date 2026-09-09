import { Box } from '@mantine/core';
import type { ReactNode } from 'react';

import { cx } from '@/shared/lib/class-names';
import type { WithChildren, WithOptionalClassName } from '@/shared/typings';

import classes from './corner-header.module.scss';

export type CornerHeaderProps = WithChildren &
  WithOptionalClassName & {
    /** The control the header's top right holds. */
    corner: ReactNode;
  };

/**
 * A page header carrying one control in its top-right corner, out of the flow:
 * it costs the page no vertical band of its own and leaves the header's
 * centring alone. What the pages using it owe in return is that corner — the
 * control overlaps whatever the header's own first line puts there.
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
