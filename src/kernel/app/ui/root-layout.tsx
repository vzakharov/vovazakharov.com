import type { Metadata } from 'next';
import type { ComponentProps, ReactNode } from 'react';

import {
  ANALYTICS_SCRIPT_URL,
  SITE_CONFIG,
  withoutScheme,
} from '@/kernel/shared/config';
import { constructMetadata } from '@/kernel/shared/seo/index.server-only';

/**
 * What every route without metadata of its own — `/` — publishes. Reaches Next
 * only through `app/layout.tsx`'s re-export, as each page's does through its
 * route module: a `metadata` this file exports and the route does not is never
 * read.
 */
export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  // Through the helper, not beside it: the spread carries every key the
  // helper knows, so a `title` set here would be overwritten with undefined.
  ...constructMetadata({ title: SITE_CONFIG.name }),
};

/**
 * The document every site renders, the game's bare; a layout extending it adds
 * to `<html>` and `<head>` through `htmlProps` and `head`.
 */
export function RootLayout({
  children,
  htmlProps,
  head,
}: Readonly<{
  children: ReactNode;
  htmlProps?: Omit<ComponentProps<'html'>, 'lang' | 'children'>;
  head?: ReactNode;
}>) {
  return (
    <html lang="en" {...htmlProps}>
      <head>
        {head}
        {/* `data-domains` keeps a dev server or a preview from counting as the site. */}
        <script
          defer
          src={ANALYTICS_SCRIPT_URL}
          data-website-id={SITE_CONFIG.analyticsId}
          data-domains={withoutScheme(SITE_CONFIG.url)}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
