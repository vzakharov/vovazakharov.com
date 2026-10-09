'use client';

import { Box, Group } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import type { LabeledLink } from '@/shared/typings';

import classes from './chip-nav.module.scss';
import { TextLink } from './text-link';

/** One destination in the row; the current one renders inert rather than linked. */
export type Chip = LabeledLink & {
  current: boolean;
  /** The language the chip's destination is in, where the row switches one. */
  hrefLang?: string;
};

export type ChipNavProps = {
  chips: Chip[];
  /**
   * The chips are one page in another form — a language, say — so switching
   * between them adds no history entry for Back to step through.
   */
  replace?: boolean;
};

/**
 * Every alternative shown at once, the current one inverted and inert. A row of
 * links rather than a control, so the switch works before hydration.
 */
export function ChipNav({ chips, replace }: ChipNavProps) {
  return (
    <Group component="nav" gap={8} wrap="wrap" fz="sm" className="print-hidden">
      {chips.map(({ label, href, current, hrefLang }) =>
        current ? (
          <Box
            key={label}
            component="span"
            aria-current="page"
            className={cx(classes['chip'], classes['chipCurrent'])}
          >
            {label}
          </Box>
        ) : (
          <TextLink
            key={label}
            {...{ href, hrefLang, replace }}
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
