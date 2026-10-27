import '../styles/globals.scss';
import '../styles/print.scss';
// A site's own sheet outweighs the defaults by its `[data-site]` selectors,
// whichever is emitted first.
import '@/entities/maya';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { JetBrains_Mono, Merriweather } from 'next/font/google';

import {
  ANALYTICS_SCRIPT_URL,
  SITE_CONFIG,
  SITE_ID,
  withoutScheme,
} from '@/shared/config';
import { SCRIPT_PREFERENCE_SCRIPT } from '@/shared/lib/script-preference';
import { constructMetadata } from '@/shared/seo/index.server-only';

import { ThemeCorner } from './theme-corner';
import { ThemeProvider } from './theme-provider';

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  variable: '--font-merriweather',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

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
  // which reads them — on `:root`. A site's own styles key on `data-site`.
  return (
    <html
      lang={SITE_CONFIG.locale}
      data-site={SITE_ID}
      className={`${merriweather.variable} ${jetbrainsMono.variable}`}
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
        <script
          // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- the markup is `script-preference.ts`'s own function source and constants, never reader input; a `<script>` child would reach the page HTML-escaped
          dangerouslySetInnerHTML={{ __html: SCRIPT_PREFERENCE_SCRIPT }}
        />
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
