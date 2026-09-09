'use client';

import '@mantine/core/styles.layer.css';

import {
  type CSSVariablesResolver,
  type MantineColorSchemeManager,
  MantineProvider,
} from '@mantine/core';

import type { WithChildren } from '@/shared/typings';
import { cssColor } from '@/shared/ui';

import { theme } from '../styles/theme';

// Every `--mantine-*` override belongs here rather than in a stylesheet:
// Mantine emits its own block as a `<style data-mantine-styles>` at the top of
// `<body>`, on `:root`, so a stylesheet's `:root` ties on specificity and loses
// on document order.
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

/** What Mantine's own manager stores the reader's choice under. */
const LEGACY_SCHEME_KEY = 'mantine-color-scheme-value';

/**
 * Storage can still hold a scheme from when the site had a control for one, and
 * `ColorSchemeScript` reads `localStorage` before hydration while
 * `forceColorScheme` accepts only `light`/`dark` — so a leftover would override
 * the system scheme forever. Browser-only, as every caller below is.
 */
function forgetStoredScheme(): void {
  globalThis.localStorage.removeItem(LEGACY_SCHEME_KEY);
}

/**
 * The scheme is the reader's system setting and nothing else: there is no
 * control to override it with, so every read reports `auto` and every other
 * entry point leaves storage empty rather than writing to it.
 */
const colorSchemeManager: MantineColorSchemeManager = {
  get: () => 'auto',
  set: forgetStoredScheme,
  subscribe: forgetStoredScheme,
  unsubscribe: forgetStoredScheme,
  clear: forgetStoredScheme,
};

export function ThemeProvider({ children }: WithChildren) {
  return (
    <MantineProvider
      {...{ theme, cssVariablesResolver, colorSchemeManager }}
      defaultColorScheme="auto"
    >
      {children}
    </MantineProvider>
  );
}
