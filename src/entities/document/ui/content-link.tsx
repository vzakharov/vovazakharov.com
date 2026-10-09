import type { ComponentProps } from 'react';

import { TextLink } from '@/shared/ui';

/**
 * Every `<a>` a document holds, linked once per medium as every other page's
 * links are: the site-root path `rehypeContentLinks` leaves on screen, and the
 * absolute address on paper, which a PDF carries out of the browser.
 */
export function ContentLink({
  href,
  className,
  children,
}: ComponentProps<'a'>) {
  // HTML allows an `<a>` with no address, which has nothing to link per medium.
  if (href === undefined) return <a {...{ className }}>{children}</a>;

  return <TextLink {...{ href, className }}>{children}</TextLink>;
}
