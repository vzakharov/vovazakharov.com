import '../styles/globals.scss';
import '../styles/print.scss';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';

import {
  ANALYTICS_SCRIPT_URL,
  SITE_CONFIG,
  withoutScheme,
} from '@/shared/config';
import { constructMetadata } from '@/shared/seo/index.server-only';

import { fontVariables } from './fonts';
import { ThemeCorner } from './theme-corner';
import { ThemeProvider } from './theme-provider';

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

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The font variables have to be on <html>: a custom property resolves in the
  // scope it is declared in, and Mantine declares `--mantine-font-family` —
  // which reads them — on `:root`.
  return (
    <html lang="en" className={fontVariables} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        {/* `data-domains` keeps a dev server or a preview from counting as the site. */}
        <script
          defer
          src={ANALYTICS_SCRIPT_URL}
          data-website-id={SITE_CONFIG.analyticsId}
          data-domains={withoutScheme(SITE_CONFIG.url)}
        />
      </head>
      <body>
        <ThemeProvider>
          <ThemeCorner />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
