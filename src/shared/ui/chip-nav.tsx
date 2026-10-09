'use client';

import { Box, Group } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import type { LabeledLink } from '@/shared/typings';

import classes from './chip-nav.module.scss';
import { rememberLanguage, useLanguageReturn } from './language-return';
import { TextLink } from './text-link';

/** One destination in the row; the current one renders inert rather than linked. */
export type Chip = LabeledLink & {
  current: boolean;
  /** The language the chip's destination is in, where the row switches one. */
  hrefLang?: string;
};

export type ChipNavProps = { chips: Chip[] };

/**
 * Every alternative shown at once, the current one inverted and inert. A row of
 * links rather than a control, so the switch works before hydration.
 *
 * A chip with a `hrefLang` is this same page in another language, so following
 * it replaces the history entry rather than adding one for Back to step
 * through, and is remembered for `useLanguageReturn`.
 */
export function ChipNav({ chips }: ChipNavProps) {
  useLanguageReturn(chips);

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
            {...{ href, hrefLang }}
            {...(hrefLang !== undefined && {
              replace: true,
              onClick: () => {
                rememberLanguage(hrefLang);
              },
            })}
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
