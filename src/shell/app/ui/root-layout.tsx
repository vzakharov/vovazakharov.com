import '../styles/globals.scss';
import '../styles/print.scss';

import { ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { JetBrains_Mono, Merriweather } from 'next/font/google';

import { SCRIPT_PREFERENCE_SCRIPT } from '@/kernel/shared/lib/script-preference';
import { RootLayout as KernelRootLayout } from '@/kernel/app/ui';

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

export function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // The font variables have to be on <html>: a custom property resolves in the
  // scope it is declared in, and Mantine declares `--mantine-font-family` —
  // which reads them — on `:root`.
  return (
    <KernelRootLayout
      htmlProps={{
        className: `${merriweather.variable} ${jetbrainsMono.variable}`,
        ...mantineHtmlProps,
      }}
      head={
        <>
          <ColorSchemeScript defaultColorScheme="auto" />
          <script
            // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- the markup is `script-preference.ts`'s own function source and constants, never reader input; a `<script>` child would reach the page HTML-escaped
            dangerouslySetInnerHTML={{ __html: SCRIPT_PREFERENCE_SCRIPT }}
          />
        </>
      }
    >
      <ThemeProvider>
        <ThemeCorner />
        {children}
      </ThemeProvider>
    </KernelRootLayout>
  );
}
