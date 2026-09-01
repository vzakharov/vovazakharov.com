import { ReactNode } from 'react';
import { Paper } from '@mantine/core';
import type { Described, Titled } from '@/shared/typings';
import classes from './card.module.scss';

/** A heading and the prose under it — the copy every card kind renders. */
export type Summarized = Titled & Described;

export function Card({ children }: { children: ReactNode }) {
  return (
    <Paper withBorder className={classes.card}>
      {children}
    </Paper>
  );
}

/** Makes a whole card one link to somewhere off the site. */
export function CardLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={classes.link}
    >
      {children}
    </a>
  );
}
