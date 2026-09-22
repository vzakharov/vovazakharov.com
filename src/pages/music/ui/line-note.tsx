'use client';

import { Popover, UnstyledButton } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';
import type {
  WithChildren,
  WithOptionalClassName,
  WithText,
} from '@/shared/typings';

import classes from './music.module.scss';

/** The class is the line's own, the note beside it staying undimmed in a crib. */
export type LineNoteProps = WithText & WithChildren & WithOptionalClassName;

/**
 * A line of verse that opens its note on a click, as genius.com does — on a
 * click rather than a hover, because a phone has no hover and the note can
 * carry a link the reader has to reach.
 *
 * Mounted while closed and kept out of a portal, so the note is in the static
 * HTML beside its line — which is also what carries the popover's classes into
 * the export `check:mantine-styles` compares against.
 */
export function LineNote({ text, children, className }: LineNoteProps) {
  return (
    <Popover
      position="bottom-start"
      width={320}
      shadow="md"
      keepMounted
      keepMountedMode="display-none"
      withinPortal={false}
    >
      <Popover.Target>
        <UnstyledButton className={cx(className, classes['notedLine'])}>
          {text}
        </UnstyledButton>
      </Popover.Target>
      <Popover.Dropdown className={classes['lineNote']}>
        {children}
      </Popover.Dropdown>
    </Popover>
  );
}
