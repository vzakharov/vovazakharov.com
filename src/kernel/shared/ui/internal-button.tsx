'use client';

import { Button, type ButtonProps } from '@mantine/core';
import Link from 'next/link';

import type { Anchored } from '@/shared/typings';

/**
 * A button to another page of this site. Unlike `TextLink` it has no printed
 * half: a button is something to press, and paper takes no press.
 *
 * Client-side for the reason `TextLink` is: `next/link` cannot cross the server
 * boundary as Mantine's `component` prop.
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
