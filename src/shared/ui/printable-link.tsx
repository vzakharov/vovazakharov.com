'use client';

import { Anchor, type AnchorProps, type ElementProps } from '@mantine/core';

import { printedUrl } from '@/shared/config';
import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/pick';
import type { Anchored, WithOptionalClassName } from '@/shared/typings';

import { InternalLink } from './internal-link';
import classes from './printable-link.module.scss';

export type PrintableLinkProps = Anchored &
  AnchorProps &
  WithOptionalClassName &
  ElementProps<'a', keyof AnchorProps | 'href' | 'className'> & {
    /**
     * Paper also spells the address after the text, for a link whose own words
     * don't say where it goes — a printed page can only be followed by hand.
     */
    withAddress?: boolean;
  };

/**
 * An internal link rendered once per medium, since one anchor cannot serve
 * both: a client-side route needs the relative href `next/link` renders, and a
 * relative href in a PDF resolves against whatever host printed the file.
 */
export function PrintableLink({
  href,
  children,
  withAddress = false,
  className,
  ...props
}: PrintableLinkProps) {
  const printed = printedUrl(href);

  return (
    <>
      <InternalLink
        {...{ href }}
        {...props}
        className={cx('print-hidden', className)}
      >
        {children}
      </InternalLink>
      <span className={cx(classes['printed'], className)}>
        {withAddress && (
          <>
            {children}
            {': '}
          </>
        )}
        {/* One text node, not two: a PDF gets a link annotation per node, and
            the first is placed over whatever precedes the anchor. */}
        <Anchor {...pick(printed, 'href')} {...props}>
          {withAddress ? printed.text : children}
        </Anchor>
      </span>
    </>
  );
}
