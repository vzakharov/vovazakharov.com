import type { Linked } from '@/shared/typings';

import classes from './feed-link.module.scss';
import { TextLink, type TextLinkProps } from './text-link';

/** A link to a feed, behind the feed icon's dot and two arcs. */
export function FeedLink({ href, size }: Linked & Pick<TextLinkProps, 'size'>) {
  return (
    <TextLink {...{ href, size }}>
      <svg viewBox="0 0 16 16" aria-hidden className={classes['icon']}>
        <circle cx="2.5" cy="13.5" r="2" stroke="none" />
        <path d="M1 7.5a7.5 7.5 0 0 1 7.5 7.5" fill="none" strokeWidth="2.2" />
        <path
          d="M1 1.5a13.5 13.5 0 0 1 13.5 13.5"
          fill="none"
          strokeWidth="2.2"
        />
      </svg>
      RSS
    </TextLink>
  );
}
