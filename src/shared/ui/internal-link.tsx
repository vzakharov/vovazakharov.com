'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Anchor, type AnchorProps } from '@mantine/core';

/**
 * React refuses to serialise `next/link` across the server boundary, so Mantine's
 * polymorphic `component` prop cannot take it from a server component. The
 * pairing lives behind this client boundary instead.
 */
export function InternalLink({
  href,
  children,
  ...props
}: AnchorProps & { href: string; children: ReactNode }) {
  return (
    <Anchor component={Link} href={href} {...props}>
      {children}
    </Anchor>
  );
}
