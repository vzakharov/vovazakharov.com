'use client';

import {
  Anchor,
  type AnchorProps,
  Button,
  type ButtonProps,
} from '@mantine/core';
import Link from 'next/link';

import type { Anchored } from '@/shared/typings';

/**
 * React refuses to serialise `next/link` across the server boundary, so Mantine's
 * polymorphic `component` prop cannot take it from a server component. The
 * pairing lives behind this client boundary instead.
 */
export function InternalLink({
  href,
  children,
  ...props
}: AnchorProps & Anchored) {
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
