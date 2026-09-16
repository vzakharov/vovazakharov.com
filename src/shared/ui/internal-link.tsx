'use client';

import {
  Anchor,
  type AnchorProps,
  Button,
  type ButtonProps,
  type ElementProps,
} from '@mantine/core';
import Link from 'next/link';

import { printedUrl } from '@/shared/config';
import { cx } from '@/shared/lib/class-names';
import { pick } from '@/shared/lib/collections';
import type { Anchored, WithOptionalClassName } from '@/shared/typings';

import classes from './internal-link.module.scss';

export type InternalLinkProps = Anchored &
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
 * Another page of this site, linked once per medium — every internal link,
 * because any page can be printed and `next/link` writes a **relative** href.
 * That is what a client-side route needs and what a PDF resolves against
 * whatever host printed the file, so no single anchor serves both: the screen
 * half keeps the relative href, the printed half takes the absolute one.
 *
 * External links need no such pair, being absolute already — which is why the
 * fork belongs to this component rather than to a second one beside it.
 *
 * React refuses to serialise `next/link` across the server boundary, so
 * Mantine's polymorphic `component` prop cannot take it from a server
 * component. The pairing lives behind this client boundary instead.
 *
 * `ElementProps` omits what `AnchorProps` claims, so an anchor attribute with no
 * Mantine counterpart — `hrefLang`, `target` — reaches the `<a>` without the two
 * types shadowing each other.
 */
export function InternalLink({
  href,
  children,
  withAddress = false,
  className,
  ...props
}: InternalLinkProps) {
  const printed = printedUrl(href);

  return (
    <>
      <Anchor
        component={Link}
        {...{ href }}
        {...props}
        className={cx('print-hidden', className)}
      >
        {children}
      </Anchor>
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

/**
 * The call-to-action shape of the pairing above, and the one internal link with
 * no printed half: a button is something to press, and paper takes no press.
 */
export function InternalButton({
  href,
  children,
  ...props
}: ButtonProps & Anchored) {
  return (
    <Button component={Link} {...{ href }} {...props} className="print-hidden">
      {children}
    </Button>
  );
}
