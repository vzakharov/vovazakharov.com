'use client';

import {
  Anchor,
  type AnchorProps,
  Button,
  type ButtonProps,
  type ElementProps,
} from '@mantine/core';
import Link from 'next/link';

import type { Anchored } from '@/shared/typings';

/**
 * React refuses to serialise `next/link` across the server boundary, so Mantine's
 * polymorphic `component` prop cannot take it from a server component. The
 * pairing lives behind this client boundary instead.
 *
 * The element props are those Mantine's own do not claim, so an anchor
 * attribute with no Mantine counterpart — `hrefLang`, `target`, `rel` — reaches
 * the rendered `<a>` without either side's type shadowing the other's.
 */
export function InternalLink({
  href,
  children,
  ...props
}: AnchorProps & ElementProps<'a', keyof AnchorProps | 'href'> & Anchored) {
  return (
    <Anchor component={Link} {...{ href }} {...props}>
      {children}
    </Anchor>
  );
}

/** The call-to-action shape of the pairing above. */
export function InternalButton({
  href,
  children,
  ...props
}: ButtonProps & Anchored) {
  return (
    <Button component={Link} {...{ href }} {...props}>
      {children}
    </Button>
  );
}
