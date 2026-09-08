import { Paper } from '@mantine/core';

import type { Described, Linked, Titled, WithChildren } from '@/shared/typings';

import classes from './card.module.scss';

/** A heading and the prose under it — the copy every card kind renders. */
export type Summarized = Titled & Described;

/** The label a screen reader reads, the card's own markup not being one. */
type CardLinkProps = Linked & {
  'aria-label': string;
};

export function Card({ children }: WithChildren) {
  return (
    <Paper withBorder className={classes['card']}>
      {children}
    </Paper>
  );
}

/**
 * Makes a whole card one link to somewhere off the site. It goes *inside* the
 * card as an overlay rather than around it, so the card may hold links of its
 * own — an anchor cannot nest, and the card's content paints over this one.
 */
export function CardLink({ href, 'aria-label': ariaLabel }: CardLinkProps) {
  return (
    <a
      {...{ href }}
      target="_blank"
      rel="noopener noreferrer"
      className={classes['link']}
      aria-label={ariaLabel}
    />
  );
}
