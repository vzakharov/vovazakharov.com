import type { Metadata } from 'next';
import type { ComponentProps, ReactNode } from 'react';

import {
  ANALYTICS_SCRIPT_URL,
  SITE_CONFIG,
  SITE_ID,
  withoutScheme,
} from '@/kernel/shared/config';
import {
  constructMetadata,
  type FeedLink,
} from '@/kernel/shared/seo/index.server-only';

/**
 * What every route without metadata of its own — `/` — publishes, advertising
 * `feeds`. Reaches Next only through `app/layout.tsx`'s re-export, as each
 * page's does through its route module: a `metadata` this file exports and the
 * route does not is never read.
 */
export function constructRootMetadata(feeds?: readonly FeedLink[]): Metadata {
  return {
    metadataBase: new URL(SITE_CONFIG.url),
    // Through the helper, not beside it: the spread carries every key the
    // helper knows, so a `title` set here would be overwritten with undefined.
    ...constructMetadata({ title: SITE_CONFIG.name }, feeds),
  };
}

/** The root metadata of a site that publishes no feed. */
export const rootMetadata = constructRootMetadata();

/**
 * The document every site renders, bare as the game takes it; a layout
 * extending it passes what it adds rather than restating `<html>`. A site's own
 * styles key on `data-site`.
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
    <html lang={SITE_CONFIG.locale} data-site={SITE_ID} {...htmlProps}>
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
