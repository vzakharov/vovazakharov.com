'use client';

import { Box, Group } from '@mantine/core';
import { Fragment, type ReactNode } from 'react';

import { cx } from '@/kernel/shared/lib/class-names';

import type { Chip } from './chip';
import classes from './chip-nav.module.scss';
import { useLanguageReturn } from './language-return';
import { TextLink } from './text-link';

export type ChipNavProps = {
  chips: Chip[];
  /** A control standing in for the current chip, which wears `CURRENT_CHIP_CLASS` itself. */
  current?: ReactNode;
};

export const CURRENT_CHIP_CLASS = cx(classes['chip'], classes['chipCurrent']);

/**
 * Every alternative shown at once, the current one inverted and inert unless
 * `current` gives it a job. A row of links rather than a control, so the
 * switch works before hydration.
 *
 * A chip with a `hrefLang` is this same page in another language, so following
 * it replaces the history entry rather than adding one for Back to step
 * through; `useLanguageReturn` carries the language back to the pages before.
 */
export function ChipNav({ chips, current: control }: ChipNavProps) {
  useLanguageReturn(chips);

  return (
    <Group component="nav" gap={8} wrap="wrap" fz="sm" className="print-hidden">
      {chips.map(({ label, href, current, hrefLang }) =>
        current ? (
          <Fragment key={label}>
            {control ?? (
              <Box
                component="span"
                aria-current="page"
                className={CURRENT_CHIP_CLASS}
              >
                {label}
              </Box>
            )}
          </Fragment>
        ) : (
          <TextLink
            key={label}
            {...{ href, hrefLang }}
            replace={hrefLang !== undefined}
            underline="never"
            c="inherit"
            className={cx(classes['chip'], classes['chipLink'])}
          >
            {label}
          </TextLink>
        ),
      )}
    </Group>
  );
}
