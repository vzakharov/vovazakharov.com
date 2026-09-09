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
 * `ElementProps` omits what `AnchorProps` claims, so an anchor attribute with no
 * Mantine counterpart — `hrefLang`, `target` — reaches the `<a>` without the two
 * types shadowing each other.
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
