'use client';

import '@mantine/core/styles.layer.css';
import { MantineProvider, type CSSVariablesResolver } from '@mantine/core';
import { cssColor } from '@/shared/ui';
import { theme } from '../styles/theme';

// Mantine renders its variable block as a `<style data-mantine-styles>` at the
// top of `<body>` — after every stylesheet in `<head>`, and on the same `:root`
// selector. A `--mantine-*` override written in globals.scss therefore loses on
// document order at equal specificity, whatever the bundler. The site's own
// `--color-*` tokens live in globals.scss precisely because Mantine never
// declares those names, so nothing there is fighting this block.
const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--mantine-color-body': cssColor('background'),
    '--mantine-color-text': cssColor('foreground'),
    '--mantine-color-anchor': cssColor('foreground'),
    '--mantine-color-default-border': cssColor('border-hairline-strong'),
  },
  light: {},
  dark: {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={cssVariablesResolver}
      defaultColorScheme="auto"
    >
      {children}
    </MantineProvider>
  );
}
