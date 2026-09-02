import type { Metadata } from 'next';
import { Merriweather, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import '../styles/globals.scss';
import '../styles/print.scss';
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  ...constructMetadata(),
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
