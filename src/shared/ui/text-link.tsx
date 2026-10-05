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

import classes from './text-link.module.scss';

export type TextLinkProps = Anchored &
  Omit<AnchorProps, 'inherit'> &
  WithOptionalClassName &
  ElementProps<'a', keyof AnchorProps | 'href' | 'className'> & {
    /**
     * Paper also spells the address after the text, for a link whose own words
     * don't say where it goes — a printed page can only be followed by hand.
     */
    withAddress?: boolean;
    /** Opens beside the page rather than over it, without handing it `window.opener`. */
    newTab?: boolean;
  };

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };

/**
 * Every link set in running text, this site's pages and the wider web alike.
 *
 * Another page of this site is linked once per medium, because any page can be
 * printed and `next/link` writes a **relative** href. That is what a
 * client-side route needs and what a PDF resolves against whatever host
 * printed the file, so no single anchor serves both. An absolute address is
 * already paper's own, so it takes one anchor unless `withAddress` gives paper
 * words the screen lacks.
 *
 * Paper's copy is derived from the same `href`, so a link that reaches no
 * paper is one sitting inside a `print-hidden` container — the medium is a fact
 * about where a link is, and the container already holds it.
 *
 * React refuses to serialise `next/link` across the server boundary, so
 * Mantine's polymorphic `component` prop cannot take it from a server
 * component. The pairing lives behind this client boundary instead.
 *
 * `ElementProps` omits what `AnchorProps` claims, so an anchor attribute with no
 * Mantine counterpart — `hrefLang`, `target` — reaches the `<a>` without the two
 * types shadowing each other.
 *
 * `className` dresses both anchors and never the wrapper, which carries the
 * medium switch alone: a caller's class stating `display` ties with it on
 * specificity and wins on order, putting the printed half on screen.
 *
 * The link takes the size of the text around it unless the caller names a
 * `size`: `Anchor` is `Text` underneath and states its own `font-size`, which
 * print re-keys on the paragraph and never on the link. Mantine's `inherit`
 * rule follows the one `size` drives at equal specificity, so the two cannot
 * both be on.
 */
export function TextLink({
  href,
  children,
  withAddress = false,
  newTab = false,
  className,
  size,
  ...rest
}: TextLinkProps) {
  const printed = printedUrl(href);
  const props = {
    ...rest,
    ...(newTab ? NEW_TAB : {}),
    size,
    inherit: size === undefined,
  };

  if (printed.href === href && !withAddress) {
    return (
      <Anchor {...{ href, ...props, className }}>
        {children}
      </Anchor>
    );
  }

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
      <span className={classes['printed']}>
        {withAddress && (
          <>
            {children}
            {': '}
          </>
        )}
        {/* One text node, not two: a PDF gets a link annotation per node, and
            the first is placed over whatever precedes the anchor. */}
        <Anchor {...pick(printed, 'href')} {...props} {...{ className }}>
          {withAddress ? printed.text : children}
        </Anchor>
      </span>
    </>
  );
}

/**
 * The call-to-action shape of a link to another page of this site, and the one
 * with no printed half: a button is something to press, and paper takes no
 * press.
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
