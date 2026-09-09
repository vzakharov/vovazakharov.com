import '../styles/globals.scss';
import '../styles/print.scss';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import type { Metadata } from 'next';
import { JetBrains_Mono, Merriweather } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';

import { SITE_CONFIG } from '@/shared/config';
import { constructMetadata } from '@/shared/seo';

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
  // which reads them — on `:root`.
  return (
    <html
      lang="en"
      className={`${merriweather.variable} ${jetbrainsMono.variable}`}
      {...mantineHtmlProps}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="auto" />
      </head>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
