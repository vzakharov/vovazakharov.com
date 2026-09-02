'use client';

import { Anchor, type AnchorProps } from '@mantine/core';
import Link from 'next/link';
import type { ReactNode } from 'react';

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
    <Anchor component={Link} {...{ href }} {...props}>
      {children}
    </Anchor>
  );
}
