import { Paper } from '@mantine/core';

import type {
  Anchored,
  Described,
  Titled,
  WithChildren,
} from '@/shared/typings';

import classes from './card.module.scss';

/** A heading and the prose under it — the copy every card kind renders. */
export type Summarized = Titled & Described;

/** The label a screen reader reads for a card whose text is its own markup. */
type CardLinkProps = Anchored & {
  'aria-label': string;
};

export function Card({ children }: WithChildren) {
  return (
    <Paper withBorder className={classes['card']}>
      {children}
    </Paper>
  );
}

/** Makes a whole card one link to somewhere off the site. */
export function CardLink({
  href,
  children,
  'aria-label': ariaLabel,
}: CardLinkProps) {
  return (
    <a
      {...{ href }}
      target="_blank"
      rel="noopener noreferrer"
      className={classes['link']}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
