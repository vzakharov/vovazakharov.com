'use client';

import '@mantine/core/styles.layer.css';
import { MantineProvider, type CSSVariablesResolver } from '@mantine/core';
import { cssColor } from '@/shared/ui';
import { theme } from '../styles/theme';

// Must go through the resolver rather than a plain `:root` block in
// globals.css: Mantine's stylesheet ships after it under Turbopack and wins a
// plain override.
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

export function Providers({ children }: { children: React.ReactNode }) {
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
